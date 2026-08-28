# Changelog

All notable changes to **Kirin Anikku Backup Viewer** are documented here.

## [0.1.0] - 2026-08-28

### Added
- Initial sister project foundation for Anikku backups.
- Current Anikku protobuf backup root decoder.
- Legacy Anikku backup root decoder.
- GZIP `.tachibk`, raw protobuf and decoded JSON input.
- Anime dashboard with anime, episode, seen/unseen, watching, tracking and watch-time statistics.
- Continue Watching cards using stored `lastSecondSeen` / `totalSeconds`.
- Responsive Anime Library with search, category/source/progress filters, sorting and pagination.
- Anime Details modal with background art, season metadata, categories, tracking and raw inspector.
- Episode list with seen, filler, bookmark, progress, duration, summary and preview metadata.
- Explore views for categories, sources, trackers, feeds and saved searches.
- Official tracker ID mapping for MyAnimeList, AniList, Kitsu, Shikimori, Bangumi, Simkl and Jellyfin.
- Seven themes.
- PWA manifest/service worker.
- JSON export.
- Desktop and mobile layouts.
- Back-to-top and go-to-bottom controls.

### Notes
- `.tachibk` re-encoding is intentionally disabled in this foundation build until the full preservation schema is modeled.
