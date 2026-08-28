# Changelog

All notable changes to **Kirin Anikku Backup Viewer** are documented here.

## [0.1.3] - 2026-08-28

### Fixed
- Fixed episode `Seen`, `Filler`, and `Bookmark` badges stretching to the full height of the episode row.
- Status badges now render as compact pill badges aligned to the top-right on desktop and top-left on mobile.
- Replaced the default bright browser scrollbar with a theme-aware scrollbar for the page, Anime Details modal, raw inspector, tabs, and other scrollable areas.
- Updated application/service-worker cache to `v013`.

## [0.1.2] - 2026-08-28

### Fixed
- Fixed black text inside Dashboard `Continue Watching` cards by explicitly inheriting the active theme text color.
- Rebuilt Continue Watching card markup into dedicated poster and content containers.
- Fixed the watch progress bar escaping/collapsing into a vertical gradient strip.
- Added width/min-width/overflow guards so long anime titles, episode names and watch times stay inside their cards.
- Applied the same progress-bar block sizing safely across dashboard/library layouts.
- Updated application/service-worker cache to `v012`.

## [0.1.1] - 2026-08-28

### Fixed
- Fixed Anikku legacy backups being incorrectly detected as current backups when they contained shared Saved Search (`600`) or Feed (`610`) fields.
- Root detection now mirrors Anikku's official `BackupDetector`: missing field `500` means legacy, while current backups explicitly encode `isLegacy = false`.
- Added a safe two-root fallback if detector decoding itself fails.
- Fallback scoring prioritizes actual anime/category/source data over fields shared by both backup generations.
- Empty decoded libraries now show an explicit diagnostic instead of silently looking like a valid empty backup.
- Updated application/service-worker cache to `v011`.

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
