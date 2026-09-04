# Kirin Anikku Backup Viewer

Client-side **Anikku** backup viewer focused on anime/video metadata, episodes, watch progress, seasons, tracking and backup analysis. Viewer only; it does not stream or download episodes.

## Current build

**v0.3.0 — Watch & Backup Intelligence**

Repository: `Lanzkila/Anikku-Viewer`

## Main features

- Current + legacy Anikku root detection
- `.tachibk`, GZIP/raw protobuf and JSON input
- Dashboard, Library, Explore, Tools, seven themes and responsive mobile/desktop UI
- Watch Center: premium Continue Watching, watch history, watch analytics, streak and 52-week heatmap
- Episode Center: Seen/Unseen/Watching/Filler/Bookmark/Invalid-progress filters and sorting
- Season Explorer and parent/child relationship view with broken-parent detection
- Tracker Center for MyAnimeList, AniList, Kitsu, Shikimori, Bangumi, Simkl and Jellyfin
- Source Health plus Feed/Saved Search inspection
- Local pins, custom collections, bulk selection and in-memory delete
- Snapshot Vault, two-backup compare, duplicate resolution, Repair Center, integrity grade, Undo/reset and change-session log
- Quick Preview and keyboard library navigation
- **Cover Recovery Center** with custom poster → poster → background fallback, URL normalization/retry, missing/broken detection, local URL/image override and override export/import
- Watch-position unit normalization is retained for backups that store x1000 millisecond-like values

## Export safety

Decoded/working JSON export is available. `.tachibk` re-encoding is intentionally still disabled until the Anikku preservation schema covers every field that must survive a round trip.

## Privacy

Backup decoding stays in the browser. Pins, collections, snapshots and cover overrides are local viewer data.

## PWA / update note

v0.3.0 is loaded as an additive suite by the updated service worker so the stable v0.2.1 core files remain untouched. After replacing the patch files on GitHub Pages, refresh once after the new service worker activates.

## License

GPL-2.0.
