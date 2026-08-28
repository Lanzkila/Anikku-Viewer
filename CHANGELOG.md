# Changelog

All notable changes to **Kirin Anikku Backup Viewer** are documented here.

## [0.2.0] - 2026-08-28

### Fixed
- Fixed black text inside Anime Library cards by explicitly applying the active theme text and muted colors to the button-based cards.
- Added theme-safe styling for anime title, source metadata and progress labels.

### Added
- Added Library quick filters: All, Unseen, Watching, Seen, Bookmarked, Filler and Tracked.
- Added live global counts to each quick-filter chip.
- Added Grid and Compact library layouts.
- The selected Library layout is remembered in local storage.
- Added a `Recent` shortcut that immediately sorts the Library by recently watched anime.
- Added per-card Watching, Bookmark and Filler indicators.
- Added visible percentage next to each anime progress bar.

### Changed
- Compact layout uses horizontal poster cards and switches to one column on mobile.
- Updated application/service-worker cache to `v020`.

## [0.1.5] - 2026-08-28

### Fixed
- Normalized Anikku episode position/duration values that are stored as x1000 millisecond-like values even though the backup fields are named `lastSecondSeen` and `totalSeconds`.
- Fixed inflated episode durations such as hundreds of hours in Continue Watching and Episode Details.
- Fixed inflated Dashboard total watch-time statistics without modifying the raw backup values.

### Changed
- Increased the overall UI font size for easier reading.
- Increased small labels, metadata, episode text, buttons, tabs, chips, statistics and diagnostic text.
- Improved Dashboard spacing and Continue Watching card readability.
- Improved Anime Details modal spacing on desktop and mobile.
- Kept raw backup values untouched in the Raw inspector/export.
- Updated application/service-worker cache to `v015`.

## [0.1.4] - 2026-08-28

### Fixed
- Fixed the Anime Details / theme modal close button overlapping the modal edge and nearby content.
- Close buttons now use absolute top-right positioning instead of sticky+float behavior.
- Added safe right-side padding inside modal cards so the `×` button has its own space on desktop and mobile.
- Updated application/service-worker cache to `v014`.

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
