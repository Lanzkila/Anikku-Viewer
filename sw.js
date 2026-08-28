const CACHE='kirin-anikku-v011';
const SHELL=[
  './','./index.html','./assets/css/app.css?v=011','./assets/js/app.js?v=011',
  './assets/vendor/pako.min.js','./assets/icons/app-icon.svg','./schemas/schema-anikku.proto',
  './manifest.webmanifest?v=011'
];
const CDN=[
  'https://cdn.jsdelivr.net/npm/long@5.2.3/umd/index.min.js',
  'https://cdn.jsdelivr.net/npm/protobufjs@7.5.4/dist/protobuf.min.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    await cache.addAll(SHELL);
    for(const url of CDN){try{await cache.add(url);}catch{}}
  }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(hit=>{
    const network=fetch(event.request).then(response=>{
      if(response && response.ok){
        const clone=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,clone)).catch(()=>{});
      }
      return response;
    }).catch(()=>hit);
    return hit||network;
  }));
});
