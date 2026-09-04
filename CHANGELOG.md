# Changelog

## [0.3.1] - 2026-09-05

### Fixed
- Matched Anikku's floating `↑ / ↓` scroll controls to Komikku behavior.
- `↑` now becomes dark/disabled when the page is already at the top.
- `↓` now becomes dark/disabled when the page reaches the bottom.
- Both buttons remain active while the page is between the top and bottom.
- Scroll state refreshes on scrolling, resize, backup/content layout changes, and dynamic rendering.
- Updated PWA cache to `kirin-anikku-v031`.

## [0.3.0] - 2026-09-05

### Added
- Watch & Backup Intelligence suite opened from the new diamond button (`Ctrl+Shift+K`).
- Watch Center with Continue Watching, history, analytics, streak and 52-week heatmap.
- Global Episode Center with Seen/Unseen/Watching/Filler/Bookmark/Invalid-progress filters.
- Season Explorer and parent/child relationship diagnostics.
- Tracker Center, Source Health and Feed/Saved Search inspection.
- Local pins, custom collections, bulk selection and in-memory delete.
- Snapshot Vault, two-backup compare, Duplicate Resolution, Repair Center, integrity grade, Undo/reset and session log.
- Quick Preview and keyboard library navigation.
- Cover Recovery Center with missing/broken scanning, normalized URL retry, local URL/image override, override import/export and Library card repair.

### Kept
- v0.1.5 x1000 watch-time normalization.
- v0.2.0 Library Upgrade and theme-safe text.
- v0.2.1 in-card modal close overlay.
- `.tachibk` re-encoding remains disabled until full preservation coverage is modeled.

### Changed
- Repository documentation updated to `Lanzkila/Anikku-Viewer`.
- Suite typography enlarged for desktop and mobile.
- PWA cache updated to `kirin-anikku-v030`.
