(() => {
  'use strict';

  const VERSION = '0.1.3';
  const SETTINGS_KEY = 'kirin-anikku-viewer-settings-v010';
  const TRACKERS = {
    1:'MyAnimeList', 2:'AniList', 3:'Kitsu', 4:'Shikimori', 5:'Bangumi',
    101:'Simkl', 102:'Jellyfin'
  };
  const STATUS = {
    0:'Unknown',1:'Ongoing',2:'Completed',3:'Licensed',4:'Finished',5:'Cancelled',6:'On hiatus'
  };
  const THEMES = ['night','light','amoled','ocean','sakura','forest','sepia'];

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const arr = v => Array.isArray(v) ? v : [];
  const text = v => v == null ? '' : String(v);
  const num = v => Number(v || 0);
  const key64 = v => text(v || '0');
  const esc = v => text(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));

  const state = {
    data:null,
    rawBytes:null,
    fileName:'',
    fileSize:0,
    format:'',
    schema:null,
    detectorType:null,
    currentType:null,
    legacyType:null,
    sourceMap:new Map(),
    categoryMap:new Map(),
    filtered:[],
    page:1,
    pageSize:24,
    currentView:'dashboard',
    exploreTab:'categories',
    settings:{theme:'night'},
    debug:[],
  };

  function log(message) {
    const stamp = new Date().toLocaleTimeString();
    state.debug.push(`[${stamp}] ${message}`);
    if (state.debug.length > 150) state.debug.shift();
    const out = $('#debug-output');
    if (out) out.textContent = state.debug.join('\n');
  }

  function diag(message, error=false) {
    const el = $('#diagnostic');
    if (el) {
      el.textContent = message;
      el.style.color = error ? 'var(--danger)' : '';
    }
    log(message);
  }

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>el.classList.add('hidden'),2400);
  }

  function saveSettings(patch={}) {
    state.settings = {...state.settings,...patch};
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  }

  function loadSettings() {
    try { state.settings = {...state.settings,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}; } catch {}
    if (!THEMES.includes(state.settings.theme)) state.settings.theme='night';
    applyTheme(state.settings.theme);
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    saveSettings({theme});
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#090c12';
  }

  async function ensureSchema() {
    if (state.schema) return;
    if (!window.protobuf) throw new Error('ProtobufJS did not load. Check internet access and reload.');
    if (window.Long && protobuf.util) { protobuf.util.Long = window.Long; protobuf.configure(); }
    const url = new URL('./schemas/schema-anikku.proto', document.baseURI).href;
    const response = await fetch(url,{cache:'no-store'});
    if (!response.ok) throw new Error(`Could not load schema-anikku.proto (HTTP ${response.status}).`);
    const source = await response.text();
    const parsed = protobuf.parse(source,{keepCase:true});
    state.schema = parsed.root;
    state.detectorType = parsed.root.lookupType('BackupDetector');
    state.currentType = parsed.root.lookupType('Backup');
    state.legacyType = parsed.root.lookupType('LegacyBackup');
    log('Anikku protobuf schema loaded.');
  }

  function isGzip(bytes) { return bytes?.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b; }
  function looksJson(bytes) {
    const head = new TextDecoder().decode(bytes.slice(0,64)).trimStart();
    return head.startsWith('{') || head.startsWith('[');
  }

  function toPlain(type, message) {
    return type.toObject(message,{
      longs:String,
      enums:Number,
      bytes:String,
      defaults:false,
      arrays:true,
      objects:true
    });
  }

  function meaningful(data) {
    return arr(data?.backupManga).length || arr(data?.backupCategories).length || arr(data?.backupSources).length ||
      arr(data?.backupSavedSearches).length || arr(data?.backupFeeds).length;
  }

  async function decodeBytes(bytes) {
    await ensureSchema();
    if (looksJson(bytes)) {
      const parsed = JSON.parse(new TextDecoder().decode(bytes));
      return {data:normalizeBackup(parsed),format:parsed.__format || 'JSON'};
    }

    let payload = bytes;
    let compression = 'raw protobuf';
    if (isGzip(bytes)) {
      if (!window.pako?.ungzip) throw new Error('GZIP decoder did not load.');
      payload = window.pako.ungzip(bytes);
      compression = 'GZIP protobuf';
    }

    // Match Anikku's own BackupDetector behavior exactly.
    // The detector message defines field 500 with default=true:
    // missing field 500 => legacy; field 500 encoded false => current.
    let legacy = true;
    try {
      const detector = state.detectorType.decode(payload);
      legacy = detector.isLegacy !== false;
      log(`BackupDetector: ${legacy ? 'legacy' : 'current'} root.`);
    } catch (e) {
      log(`BackupDetector failed (${e.message}); trying both roots safely.`);
      legacy = null;
    }

    const decodeCurrent = () => {
      const msg = state.currentType.decode(payload);
      const plain = toPlain(state.currentType,msg);
      const normalized = normalizeBackup(plain);
      normalized.__format = 'Anikku current';
      return {data:normalized,format:`Anikku current · ${compression}`};
    };

    const decodeLegacy = () => {
      const msg = state.legacyType.decode(payload);
      const plain = toPlain(state.legacyType,msg);
      const normalized = normalizeBackup(plain);
      normalized.__format = 'Anikku legacy';
      return {data:normalized,format:`Anikku legacy · ${compression}`};
    };

    if (legacy === false) {
      try {
        const result = decodeCurrent();
        log(`Current root decoded: ${result.data.backupManga.length} anime.`);
        return result;
      } catch (e) {
        log(`Current root decode failed: ${e.message}`);
        // Fall through once for unusual/corrupt-but-readable backups.
        try {
          const fallback = decodeLegacy();
          if (meaningful(fallback.data)) {
            log('Legacy fallback succeeded after current decode failure.');
            return fallback;
          }
        } catch {}
        throw e;
      }
    }

    if (legacy === true) {
      try {
        const result = decodeLegacy();
        log(`Legacy root decoded: ${result.data.backupManga.length} anime.`);
        return result;
      } catch (e) {
        log(`Legacy root decode failed: ${e.message}`);
        try {
          const fallback = decodeCurrent();
          if (meaningful(fallback.data)) {
            log('Current fallback succeeded after legacy decode failure.');
            return fallback;
          }
        } catch {}
        throw e;
      }
    }

    // Detector itself failed: compare both candidates and prefer the one
    // containing actual anime/category/source data rather than shared 600/610 fields.
    let currentCandidate=null, legacyCandidate=null;
    try { currentCandidate=decodeCurrent(); } catch(e) { log(`Current candidate: ${e.message}`); }
    try { legacyCandidate=decodeLegacy(); } catch(e) { log(`Legacy candidate: ${e.message}`); }

    const rootScore = result => {
      if (!result) return -1;
      const d=result.data;
      return arr(d.backupManga).length*1000000 +
        arr(d.backupCategories).length*1000 +
        arr(d.backupSources).length*100 +
        arr(d.backupSavedSearches).length +
        arr(d.backupFeeds).length;
    };
    if (rootScore(legacyCandidate) > rootScore(currentCandidate)) return legacyCandidate;
    if (rootScore(currentCandidate) >= 0) return currentCandidate;

    throw new Error('This file did not match the current or legacy Anikku backup root.');
  }

  function normalizeBackup(input) {
    const d = input?.data && input.data.backupManga ? input.data : input;
    const out = {
      backupManga:arr(d?.backupManga).map(m=>({
        ...m,
        source:key64(m.source),
        episodes:arr(m.episodes).map(ep=>({
          ...ep,
          lastSecondSeen:key64(ep.lastSecondSeen),
          totalSeconds:key64(ep.totalSeconds),
          dateFetch:key64(ep.dateFetch),
          dateUpload:key64(ep.dateUpload),
          sourceOrder:key64(ep.sourceOrder),
          lastModifiedAt:key64(ep.lastModifiedAt),
          version:key64(ep.version),
        })),
        categories:arr(m.categories).map(key64),
        tracking:arr(m.tracking).map(t=>({
          ...t,
          libraryId:key64(t.libraryId),
          mediaId:key64(t.mediaId),
          startedWatchingDate:key64(t.startedWatchingDate),
          finishedWatchingDate:key64(t.finishedWatchingDate),
        })),
        history:arr(m.history).map(h=>({...h,lastRead:key64(h.lastRead),readDuration:key64(h.readDuration)})),
        dateAdded:key64(m.dateAdded),
        lastModifiedAt:key64(m.lastModifiedAt),
        favoriteModifiedAt:key64(m.favoriteModifiedAt),
        parentId:m.parentId==null?null:key64(m.parentId),
        id:m.id==null?null:key64(m.id),
        seasonFlags:key64(m.seasonFlags),
        seasonSourceOrder:key64(m.seasonSourceOrder),
      })),
      backupCategories:arr(d?.backupCategories).map(c=>({...c,order:key64(c.order),id:key64(c.id),flags:key64(c.flags)})),
      backupSources:arr(d?.backupSources).map(s=>({...s,sourceId:key64(s.sourceId)})),
      backupSavedSearches:arr(d?.backupSavedSearches).map(s=>({...s,source:key64(s.source)})),
      backupFeeds:arr(d?.backupFeeds).map(f=>({
        ...f,
        source:key64(f.source),
        savedSearch:f.savedSearch?{...f.savedSearch,source:key64(f.savedSearch.source)}:null
      })),
      __format:d?.__format || input?.__format || '',
    };
    return out;
  }

  function buildIndexes() {
    state.sourceMap = new Map(arr(state.data.backupSources).map(s=>[key64(s.sourceId),s.name||`Source ${s.sourceId}`]));
    state.categoryMap = new Map();
    arr(state.data.backupCategories).forEach((c,i)=>{
      // Anikku backup entries use category order references.
      state.categoryMap.set(key64(c.order ?? i),c);
    });
  }

  function animeTitle(m) { return m.customTitle || m.title || '(Untitled anime)'; }
  function animeCover(m) { return m.customThumbnailUrl || m.thumbnailUrl || ''; }
  function animeDescription(m) { return m.customDescription || m.description || ''; }
  function animeGenres(m) { return arr(m.customGenre).length ? arr(m.customGenre) : arr(m.genre); }
  function sourceName(m) { return state.sourceMap.get(key64(m.source)) || `Source ${m.source}`; }
  function seenCount(m) { return arr(m.episodes).filter(e=>e.seen).length; }
  function unseenCount(m) { return Math.max(0,arr(m.episodes).length-seenCount(m)); }
  function partialEpisodes(m) {
    return arr(m.episodes).filter(e=>!e.seen && num(e.lastSecondSeen)>0 && num(e.totalSeconds)>0);
  }
  function lastWatch(m) {
    const hist = arr(m.history).map(h=>num(h.lastRead));
    return Math.max(0,...hist);
  }
  function statusName(v) { return STATUS[num(v)] || `Status ${v}`; }
  function trackerName(id) { return TRACKERS[num(id)] || `Tracker ${id}`; }
  function fetchTypeName(v) { return num(v) === 0 ? 'Seasons' : 'Episodes'; }

  function formatDuration(seconds) {
    let s = Math.max(0,Math.floor(num(seconds)));
    const h=Math.floor(s/3600); s%=3600;
    const m=Math.floor(s/60), sec=s%60;
    return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  }
  function formatWatchTime(seconds) {
    const s=Math.max(0,Math.round(seconds));
    const h=Math.floor(s/3600);
    const m=Math.floor((s%3600)/60);
    return h ? `${h.toLocaleString()}h ${m}m` : `${m}m`;
  }
  function formatDate(ms) {
    const n=num(ms);
    if (!n) return '—';
    try { return new Date(n).toLocaleDateString(); } catch { return '—'; }
  }

  function totalWatchSeconds() {
    return arr(state.data?.backupManga).reduce((sum,m)=>{
      return sum + arr(m.episodes).reduce((s,e)=>s+(e.seen ? num(e.totalSeconds) : Math.min(num(e.lastSecondSeen),num(e.totalSeconds)||num(e.lastSecondSeen))),0);
    },0);
  }

  function renderDashboard() {
    const anime = arr(state.data.backupManga);
    const episodes = anime.flatMap(m=>arr(m.episodes));
    const seen = episodes.filter(e=>e.seen).length;
    const unseen = Math.max(0,episodes.length-seen);
    const tracked = anime.filter(m=>arr(m.tracking).length).length;
    const partial = anime.reduce((n,m)=>n+partialEpisodes(m).length,0);

    const cards = [
      ['Anime',anime.length],['Episodes',episodes.length],['Seen',seen],['Unseen',unseen],
      ['Watching',partial],['Tracked',tracked],['Watch time',formatWatchTime(totalWatchSeconds())]
    ];
    $('#dashboard-stats').innerHTML = cards.map(([k,v])=>`<div class="stat-card"><strong>${typeof v==='number'?v.toLocaleString():esc(v)}</strong><span>${esc(k)}</span></div>`).join('');

    const continueItems=[];
    anime.forEach((m,mi)=>{
      partialEpisodes(m).forEach(ep=>continueItems.push({m,mi,ep,progress:num(ep.totalSeconds)?num(ep.lastSecondSeen)/num(ep.totalSeconds):0,last:lastWatch(m)}));
    });
    continueItems.sort((a,b)=>b.last-a.last || b.progress-a.progress);
    $('#continue-watching').innerHTML = continueItems.length ? continueItems.slice(0,6).map(x=>{
      const pct=clamp(Math.round(x.progress*100),0,100);
      const cover=animeCover(x.m);
      return `<button class="continue-card" type="button" data-open-anime="${x.mi}">
        <span class="continue-poster">${cover?`<img src="${esc(cover)}" alt="" loading="lazy">`:'<span class="continue-poster-fallback">▶</span>'}</span>
        <span class="continue-info">
          <strong>${esc(animeTitle(x.m))}</strong>
          <small>${esc(x.ep.name||`Episode ${x.ep.episodeNumber||''}`)}</small>
          <small class="continue-time">${formatDuration(x.ep.lastSecondSeen)} / ${formatDuration(x.ep.totalSeconds)}</small>
          <span class="progress continue-progress"><i style="width:${pct}%"></i></span>
        </span>
      </button>`;
    }).join('') : '<div class="muted">No partially watched episode stored in this backup.</div>';

    const filler=episodes.filter(e=>e.fillermark||e.fillermarkLegacy).length;
    const bookmarked=episodes.filter(e=>e.bookmark).length;
    $('#watch-summary').innerHTML = [
      ['Completion',episodes.length?`${Math.round(seen/episodes.length*100)}%`:'—'],
      ['Filler marked',filler.toLocaleString()],
      ['Bookmarked',bookmarked.toLocaleString()],
      ['Categories',arr(state.data.backupCategories).length.toLocaleString()],
      ['Sources',arr(state.data.backupSources).length.toLocaleString()],
    ].map(([a,b])=>`<div class="detail-row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');

    const sourceCounts = new Map();
    anime.forEach(m=>sourceCounts.set(key64(m.source),(sourceCounts.get(key64(m.source))||0)+1));
    $('#top-sources').innerHTML = [...sourceCounts].sort((a,b)=>b[1]-a[1]).slice(0,7).map(([id,count])=>
      `<div class="detail-row"><span>${esc(state.sourceMap.get(id)||`Source ${id}`)}</span><strong>${count.toLocaleString()}</strong></div>`
    ).join('') || '<div class="muted">No source data.</div>';

    const trackerCounts=new Map();
    anime.forEach(m=>arr(m.tracking).forEach(t=>trackerCounts.set(num(t.syncId),(trackerCounts.get(num(t.syncId))||0)+1)));
    $('#tracking-summary').innerHTML = [...trackerCounts].sort((a,b)=>b[1]-a[1]).map(([id,count])=>
      `<div class="detail-row"><span>${esc(trackerName(id))}</span><strong>${count.toLocaleString()}</strong></div>`
    ).join('') || '<div class="muted">No tracking data.</div>';
  }

  function populateFilters() {
    $('#category-filter').innerHTML = '<option value="all">All categories</option>' +
      arr(state.data.backupCategories).sort((a,b)=>num(a.order)-num(b.order)).map(c=>`<option value="${esc(key64(c.order))}">${esc(c.name||'Unnamed')}</option>`).join('');
    $('#source-filter').innerHTML = '<option value="all">All sources</option>' +
      [...state.sourceMap].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,name])=>`<option value="${esc(id)}">${esc(name)}</option>`).join('');
  }

  function applyLibraryFilters(resetPage=false) {
    if (resetPage) state.page=1;
    const q=$('#search-input').value.trim().toLowerCase();
    const cat=$('#category-filter').value;
    const source=$('#source-filter').value;
    const progress=$('#progress-filter').value;
    const sort=$('#sort-filter').value;

    let items=arr(state.data.backupManga).map((m,index)=>({m,index})).filter(({m})=>{
      if(q){
        const hay=[animeTitle(m),m.author,m.artist,animeGenres(m).join(' '),sourceName(m)].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      if(cat!=='all' && !arr(m.categories).map(key64).includes(cat)) return false;
      if(source!=='all' && key64(m.source)!==source) return false;
      const eps=arr(m.episodes),seen=seenCount(m),unseen=unseenCount(m),partial=partialEpisodes(m).length;
      if(progress==='unseen' && !unseen) return false;
      if(progress==='watching' && !partial) return false;
      if(progress==='seen' && !(eps.length && seen===eps.length)) return false;
      if(progress==='tracked' && !arr(m.tracking).length) return false;
      return true;
    });

    items.sort((a,b)=>{
      if(sort==='recent') return lastWatch(b.m)-lastWatch(a.m);
      if(sort==='episodes') return arr(b.m.episodes).length-arr(a.m.episodes).length;
      if(sort==='unseen') return unseenCount(b.m)-unseenCount(a.m);
      if(sort==='added') return num(b.m.dateAdded)-num(a.m.dateAdded);
      return animeTitle(a.m).localeCompare(animeTitle(b.m),undefined,{sensitivity:'base'});
    });

    state.filtered=items;
    renderLibrary();
  }

  function renderLibrary() {
    const total=state.filtered.length;
    const pages=Math.max(1,Math.ceil(total/state.pageSize));
    state.page=clamp(state.page,1,pages);
    const start=(state.page-1)*state.pageSize;
    const slice=state.filtered.slice(start,start+state.pageSize);
    $('#library-meta').textContent = `${total.toLocaleString()} of ${arr(state.data.backupManga).length.toLocaleString()} anime · page ${state.page}/${pages}`;

    $('#anime-grid').innerHTML = slice.map(({m,index})=>{
      const eps=arr(m.episodes),seen=seenCount(m),unseen=unseenCount(m),cover=animeCover(m);
      const pct=eps.length?Math.round(seen/eps.length*100):0;
      return `<button class="anime-card" data-open-anime="${index}">
        <div class="anime-cover-wrap">${cover?`<img class="anime-cover" src="${esc(cover)}" loading="lazy" alt="">`:''}<span class="anime-badge">${unseen.toLocaleString()} unseen</span></div>
        <div class="anime-card-body"><strong>${esc(animeTitle(m))}</strong><div class="anime-meta"><span>${esc(sourceName(m))}</span><span>${seen}/${eps.length}</span></div><span class="progress"><i style="width:${pct}%"></i></span></div>
      </button>`;
    }).join('') || '<div class="muted">No anime matches the current filters.</div>';

    const pageButtons=[];
    const from=Math.max(1,state.page-2),to=Math.min(pages,state.page+2);
    pageButtons.push(`<button data-page="${Math.max(1,state.page-1)}">‹</button>`);
    for(let p=from;p<=to;p++) pageButtons.push(`<button data-page="${p}" class="${p===state.page?'active':''}">${p}</button>`);
    pageButtons.push(`<button data-page="${Math.min(pages,state.page+1)}">›</button>`);
    $('#pager').innerHTML=pageButtons.join('');
  }

  function renderExplore(tab=state.exploreTab) {
    state.exploreTab=tab;
    $$('.subnav-btn[data-explore]').forEach(b=>b.classList.toggle('active',b.dataset.explore===tab));
    const anime=arr(state.data.backupManga);
    let html='';

    if(tab==='categories'){
      const counts=new Map();
      anime.forEach(m=>arr(m.categories).forEach(c=>counts.set(key64(c),(counts.get(key64(c))||0)+1)));
      html=arr(state.data.backupCategories).sort((a,b)=>num(a.order)-num(b.order)).map(c=>`<div class="explore-row"><span class="explore-icon">C</span><span><strong>${esc(c.name||'Unnamed')}</strong><small>Order ${esc(c.order)}${c.hidden?' · Hidden':''}</small></span><span class="explore-count">${(counts.get(key64(c.order))||0).toLocaleString()} anime</span></div>`).join('');
    } else if(tab==='sources'){
      const counts=new Map(); anime.forEach(m=>counts.set(key64(m.source),(counts.get(key64(m.source))||0)+1));
      html=[...state.sourceMap].sort((a,b)=>(counts.get(b[0])||0)-(counts.get(a[0])||0)).map(([id,name])=>`<div class="explore-row"><span class="explore-icon">S</span><span><strong>${esc(name)}</strong><small>ID ${esc(id)}</small></span><span class="explore-count">${(counts.get(id)||0).toLocaleString()} anime</span></div>`).join('');
    } else if(tab==='trackers'){
      const counts=new Map(); anime.forEach(m=>arr(m.tracking).forEach(t=>counts.set(num(t.syncId),(counts.get(num(t.syncId))||0)+1)));
      html=[...counts].sort((a,b)=>b[1]-a[1]).map(([id,count])=>`<div class="explore-row"><span class="explore-icon">${esc(trackerName(id).slice(0,2).toUpperCase())}</span><span><strong>${esc(trackerName(id))}</strong><small>Tracker ID ${id}</small></span><span class="explore-count">${count.toLocaleString()} tracked</span></div>`).join('');
    } else if(tab==='feeds'){
      html=arr(state.data.backupFeeds).map(f=>{
        const name=f.savedSearch?.name || 'Popular / Latest';
        const src=state.sourceMap.get(key64(f.source)) || `Source ${f.source}`;
        return `<div class="explore-row"><span class="explore-icon">F</span><span><strong>${esc(name)}</strong><small>${esc(src)} · ${f.global?'Global':'Source'}${f.savedSearch?.query?` · ${esc(f.savedSearch.query)}`:''}</small></span><span class="explore-count">${f.savedSearch?'Saved search':'Built-in'}</span></div>`;
      }).join('');
    } else if(tab==='searches'){
      html=arr(state.data.backupSavedSearches).map(s=>`<div class="explore-row"><span class="explore-icon">⌕</span><span><strong>${esc(s.name||'Unnamed search')}</strong><small>${esc(state.sourceMap.get(key64(s.source))||`Source ${s.source}`)} · ${esc(s.query||'(empty query)')}</small></span><span class="explore-count">Saved</span></div>`).join('');
    }
    $('#explore-content').innerHTML=html || '<div class="muted">No data in this section.</div>';
  }

  function openAnime(index) {
    const m=arr(state.data.backupManga)[Number(index)];
    if(!m) return;
    const eps=arr(m.episodes),seen=seenCount(m),unseen=unseenCount(m);
    const cover=animeCover(m),bg=m.backgroundUrl||cover;
    const genres=animeGenres(m);
    const categories=arr(m.categories).map(c=>state.categoryMap.get(key64(c))?.name).filter(Boolean);
    const season = num(m.seasonNumber) >= 0 ? num(m.seasonNumber) : null;

    $('#modal-content').innerHTML = `
      <section class="anime-hero">
        <div class="anime-hero-bg" style="${bg?`background-image:url('${esc(bg).replace(/'/g,'&#39;')}')`:''}"></div>
        <div class="anime-hero-content">
          ${cover?`<img class="detail-cover" src="${esc(cover)}" alt="">`:'<div class="detail-cover"></div>'}
          <div>
            <div class="eyebrow">${esc(sourceName(m))}</div>
            <h2 class="detail-title">${esc(animeTitle(m))}</h2>
            <div class="chips">${genres.slice(0,12).map(g=>`<span class="chip">${esc(g)}</span>`).join('')}</div>
            <div class="detail-grid">
              <div><b>Status</b>${esc(statusName(m.customStatus||m.status))}</div>
              <div><b>Progress</b>${seen} / ${eps.length} seen</div>
              <div><b>Unseen</b>${unseen}</div>
              <div><b>Tracking</b>${arr(m.tracking).length}</div>
              <div><b>Fetch type</b>${esc(fetchTypeName(m.fetchType))}</div>
              <div><b>Season</b>${season==null?'—':season}</div>
              <div><b>Categories</b>${esc(categories.join(', ')||'—')}</div>
              <div><b>Added</b>${formatDate(m.dateAdded)}</div>
              <div><b>Parent ID</b>${esc(m.parentId||'—')}</div>
            </div>
          </div>
        </div>
      </section>
      <div class="modal-tabs">
        <button class="modal-tab active" data-detail-tab="overview">Overview</button>
        <button class="modal-tab" data-detail-tab="episodes">Episodes (${eps.length})</button>
        <button class="modal-tab" data-detail-tab="tracking">Tracking (${arr(m.tracking).length})</button>
        <button class="modal-tab" data-detail-tab="raw">Raw</button>
      </div>
      <div id="detail-tab-content"></div>`;

    const renderTab = tab => {
      $$('.modal-tab').forEach(b=>b.classList.toggle('active',b.dataset.detailTab===tab));
      const area=$('#detail-tab-content');
      if(tab==='overview'){
        area.innerHTML=`<p class="description">${esc(animeDescription(m)||'No description stored in this backup.')}</p>${m.notes?`<h3>Notes</h3><p class="description">${esc(m.notes)}</p>`:''}`;
      } else if(tab==='episodes'){
        area.innerHTML=`<div class="episode-tools"><input id="episode-search" placeholder="Search episodes…"></div><div id="episode-list" class="episode-list"></div>`;
        const draw=()=>{
          const q=$('#episode-search').value.trim().toLowerCase();
          const items=eps.filter(e=>`${e.name||''} ${e.summary||''} ${e.scanlator||''}`.toLowerCase().includes(q));
          $('#episode-list').innerHTML=items.map(e=>{
            const total=num(e.totalSeconds),last=num(e.lastSecondSeen),pct=e.seen?100:(total?clamp(Math.round(last/total*100),0,100):0);
            return `<div class="episode-row"><div><strong>${esc(e.name||`Episode ${e.episodeNumber||''}`)}</strong><small>Episode ${esc(e.episodeNumber||'—')} · ${formatDate(e.dateUpload)}${e.scanlator?` · ${esc(e.scanlator)}`:''}</small>
              ${e.summary?`<small>${esc(e.summary)}</small>`:''}
              <div class="episode-progress"><span class="progress"><i style="width:${pct}%"></i></span><span>${formatDuration(last)} / ${formatDuration(total)}</span></div>
            </div><div class="episode-flags">${e.seen?'<span class="flag seen">Seen</span>':'<span class="flag">Unseen</span>'}${(e.fillermark||e.fillermarkLegacy)?'<span class="flag filler">Filler</span>':''}${e.bookmark?'<span class="flag bookmark">Bookmark</span>':''}${e.previewUrl?'<span class="flag">Preview</span>':''}</div></div>`;
          }).join('')||'<div class="muted">No matching episode.</div>';
        };
        draw(); $('#episode-search').addEventListener('input',draw);
      } else if(tab==='tracking'){
        area.innerHTML=`<div class="tracking-grid">${arr(m.tracking).map(t=>`<div class="tracking-card"><strong>${esc(trackerName(t.syncId))}</strong><small>${esc(t.title||animeTitle(m))}</small><div class="detail-row"><span>Progress</span><b>${t.lastEpisodeSeen||0} / ${t.totalEpisodes||0}</b></div><div class="detail-row"><span>Score</span><b>${t.score||0}</b></div><div class="detail-row"><span>Status code</span><b>${t.status||0}</b></div><div class="detail-row"><span>Start / Finish</span><b>${formatDate(t.startedWatchingDate)} / ${formatDate(t.finishedWatchingDate)}</b></div></div>`).join('')||'<div class="muted">No tracking data.</div>'}</div>`;
      } else {
        area.innerHTML=`<pre class="raw-box">${esc(JSON.stringify(m,null,2))}</pre>`;
      }
    };
    renderTab('overview');
    $$('.modal-tab').forEach(b=>b.addEventListener('click',()=>renderTab(b.dataset.detailTab)));
    $('#anime-modal').classList.remove('hidden');
  }

  function closeModal() { $('#anime-modal').classList.add('hidden'); }
  function openTheme() { $('#theme-modal').classList.remove('hidden'); }
  function closeTheme() { $('#theme-modal').classList.add('hidden'); }

  function renderMetadata() {
    const anime=arr(state.data.backupManga);
    const episodes=anime.reduce((n,m)=>n+arr(m.episodes).length,0);
    $('#backup-metadata').innerHTML=[
      ['File',state.fileName],['Size',`${(state.fileSize/1024/1024).toFixed(2)} MB`],['Detected format',state.format],
      ['Anime',anime.length.toLocaleString()],['Episodes',episodes.toLocaleString()],
      ['Categories',arr(state.data.backupCategories).length.toLocaleString()],['Sources',arr(state.data.backupSources).length.toLocaleString()],
      ['Feeds',arr(state.data.backupFeeds).length.toLocaleString()],['Saved searches',arr(state.data.backupSavedSearches).length.toLocaleString()]
    ].map(([a,b])=>`<div class="detail-row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');
  }

  function switchView(view) {
    if(!state.data && view!=='home') return;
    state.currentView=view;
    ['dashboard','library','explore','tools'].forEach(v=>$(`#${v}-view`)?.classList.toggle('hidden',v!==view));
    $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    $('#main-nav').classList.remove('open');
    $('#mobile-menu').setAttribute('aria-expanded','false');
    if(view==='dashboard') renderDashboard();
    if(view==='library') applyLibraryFilters(false);
    if(view==='explore') renderExplore();
    if(view==='tools') renderMetadata();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function showLoading(stage,pct) {
    $('#loading-overlay').classList.remove('hidden');
    $('#loading-stage').textContent=stage;
    $('#loading-progress').style.width=`${pct}%`;
  }
  function hideLoading() { $('#loading-overlay').classList.add('hidden'); }

  async function openFile(file) {
    if(!file) return;
    try {
      showLoading('Reading file…',15);
      const bytes=new Uint8Array(await file.arrayBuffer());
      state.rawBytes=bytes;
      state.fileName=file.name;
      state.fileSize=file.size;
      showLoading('Decompressing / detecting format…',38);
      await new Promise(r=>setTimeout(r,0));
      const decoded=await decodeBytes(bytes);
      showLoading('Indexing anime library…',68);
      state.data=decoded.data;
      state.format=decoded.format;
      if (!arr(state.data.backupManga).length) {
        log(`Decoded ${decoded.format} but found 0 anime. Categories=${arr(state.data.backupCategories).length}, Sources=${arr(state.data.backupSources).length}, Feeds=${arr(state.data.backupFeeds).length}, SavedSearches=${arr(state.data.backupSavedSearches).length}`);
      }
      buildIndexes();
      populateFilters();
      state.page=1;
      state.pageSize=num($('#page-size').value)||24;
      state.filtered=arr(state.data.backupManga).map((m,index)=>({m,index}));
      showLoading('Building dashboard…',90);
      renderDashboard();
      renderMetadata();
      $('#backup-name').textContent=file.name;
      $('#backup-summary').textContent=`${arr(state.data.backupManga).length.toLocaleString()} anime · ${arr(state.data.backupCategories).length} categories · ${arr(state.data.backupSources).length} sources`;
      $('#format-badge').textContent=state.format.includes('legacy')?'LEGACY':'CURRENT';
      $('#home-view').classList.add('hidden');
      $('#app-view').classList.remove('hidden');
      switchView('dashboard');
      const animeCount=arr(state.data.backupManga).length;
      if (animeCount) {
        diag(`${decoded.format} loaded ✓ · ${animeCount.toLocaleString()} anime.`);
        toast('Anikku backup loaded');
      } else {
        diag(`${decoded.format} decoded, but this backup contains 0 library anime. Check Decoder diagnostic.`, true);
        toast('Backup decoded with empty library');
      }
      hideLoading();
    } catch(error) {
      console.error(error);
      hideLoading();
      diag(error.message,true);
      toast('Could not open backup');
    }
  }

  function clearSession() {
    state.data=null; state.rawBytes=null; state.fileName=''; state.fileSize=0; state.format=''; state.filtered=[];
    $('#app-view').classList.add('hidden'); $('#home-view').classList.remove('hidden'); closeModal();
    diag('Ready · choose an Anikku backup.');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function exportJson() {
    if(!state.data) return;
    const payload={app:'Kirin Anikku Backup Viewer',version:VERSION,__format:state.format,data:state.data};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    const base=(state.fileName||'anikku-backup').replace(/\.[^.]+$/,'');
    a.download=`${base}-decoded.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  function bind() {
    $('#choose-file').addEventListener('click',e=>{e.stopPropagation();$('#file-input').click();});
    $('#file-input').addEventListener('change',e=>openFile(e.target.files?.[0]));
    const drop=$('#drop-zone');
    drop.addEventListener('click',e=>{if(!e.target.closest('button'))$('#file-input').click();});
    drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#file-input').click();}});
    ['dragenter','dragover'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.add('drag');}));
    ['dragleave','drop'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.remove('drag');}));
    drop.addEventListener('drop',e=>openFile(e.dataTransfer.files?.[0]));

    $$('.nav-btn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
    $('[data-home]').addEventListener('click',()=>state.data?switchView('dashboard'):window.scrollTo({top:0,behavior:'smooth'}));
    $('#mobile-menu').addEventListener('click',()=>{
      const open=$('#main-nav').classList.toggle('open');
      $('#mobile-menu').setAttribute('aria-expanded',String(open));
    });
    $('#theme-button').addEventListener('click',openTheme);
    $$('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{applyTheme(b.dataset.themeChoice);closeTheme();}));
    $$('[data-close-theme]').forEach(b=>b.addEventListener('click',closeTheme));
    $$('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModal));
    $('#new-backup').addEventListener('click',clearSession);
    $('#open-another').addEventListener('click',()=>$('#file-input').click());
    $('#clear-session').addEventListener('click',clearSession);
    $('#export-json').addEventListener('click',exportJson);

    ['search-input','category-filter','source-filter','progress-filter','sort-filter'].forEach(id=>{
      $(`#${id}`).addEventListener(id==='search-input'?'input':'change',()=>applyLibraryFilters(true));
    });
    $('#page-size').addEventListener('change',()=>{state.pageSize=num($('#page-size').value)||24;state.page=1;renderLibrary();});
    $('#pager').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;state.page=num(b.dataset.page)||1;renderLibrary();window.scrollTo({top:150,behavior:'smooth'});});
    $('#anime-grid').addEventListener('click',e=>{const b=e.target.closest('[data-open-anime]');if(b)openAnime(b.dataset.openAnime);});
    $('#continue-watching').addEventListener('click',e=>{const b=e.target.closest('[data-open-anime]');if(b)openAnime(b.dataset.openAnime);});
    $$('.subnav-btn[data-explore]').forEach(b=>b.addEventListener('click',()=>renderExplore(b.dataset.explore)));
    $$('[data-explore-jump]').forEach(b=>b.addEventListener('click',()=>{switchView('explore');renderExplore(b.dataset.exploreJump);}));
    $('#scroll-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
    $('#scroll-bottom').addEventListener('click',()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'}));
    window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeTheme();$('#main-nav').classList.remove('open');}});
  }

  function registerPwa() {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=013',{updateViaCache:'none'}).catch(e=>log(`Service worker: ${e.message}`));
    }
  }

  window.addEventListener('DOMContentLoaded',async()=>{
    bind(); loadSettings(); registerPwa();
    $('#footer-year').textContent=String(new Date().getFullYear());
    try { await ensureSchema(); diag('Ready ✓ · current + legacy Anikku schema loaded.'); }
    catch(error) { diag(error.message,true); }
  });
})();
