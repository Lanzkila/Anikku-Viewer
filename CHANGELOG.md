# Changelog

## Recent commits (automatic)

<!-- AUTO-CHANGELOG:START -->
### 2026-10-08 (MYT)
- **09:32** · **Fixed** — fix(pwa): refresh Anikku cleanup script and show hidden Library count ([`b784e27`](https://github.com/Lanzkila/Anikku-Viewer/commit/b784e27aa7e4b40fab63f2f81c642a4cc7809003)) <!-- commit:b784e27aa7e4b40fab63f2f81c642a4cc7809003 -->
- **09:21** · **Fixed** — fix(viewer): automatically exclude non-library Anikku backup entries ([`8c42fd1`](https://github.com/Lanzkila/Anikku-Viewer/commit/8c42fd1de6507e930a08d2a9b53cffbb8679ab95)) <!-- commit:8c42fd1de6507e930a08d2a9b53cffbb8679ab95 -->
- **09:21** · **Docs** — docs(changelog): auto-update commit history \[skip ci\] ([`30d5942`](https://github.com/Lanzkila/Anikku-Viewer/commit/30d5942fcfbf156f162bb6a439c96b1be0dbaa25)) <!-- commit:30d5942fcfbf156f162bb6a439c96b1be0dbaa25 -->
- **08:50** · **Docs** — docs(changelog): auto-update commit history \[skip ci\] ([`83b8e3b`](https://github.com/Lanzkila/Anikku-Viewer/commit/83b8e3bc9b6739f8d8a39cb35fce568d9eadad89)) <!-- commit:83b8e3bc9b6739f8d8a39cb35fce568d9eadad89 -->
- **08:50** · **Fixed** — fix(changelog): backfill 30-day history on every push without duplicates ([`4413f21`](https://github.com/Lanzkila/Anikku-Viewer/commit/4413f21c458698678680645eac3117b7d5d8bc60)) <!-- commit:4413f21c458698678680645eac3117b7d5d8bc60 -->
- **08:49** · **CI** — ci: add auto changelog workflow for main commits ([`cd697ba`](https://github.com/Lanzkila/Anikku-Viewer/commit/cd697baf46533d639c648f7af674a52e17f29e12)) <!-- commit:cd697baf46533d639c648f7af674a52e17f29e12 -->
- **08:49** · **Docs** — docs(changelog): auto-update commit history \[skip ci\] ([`958d31c`](https://github.com/Lanzkila/Anikku-Viewer/commit/958d31cefd52805a540baa8f2448a80a10a4eb4f)) <!-- commit:958d31cefd52805a540baa8f2448a80a10a4eb4f -->
- **08:48** · **Docs** — docs: rework Anikku Viewer README with features, badges, guides and changelog info ([`93bf6da`](https://github.com/Lanzkila/Anikku-Viewer/commit/93bf6dafd47086ec8895ea785fdb8cc1e21bb68a)) <!-- commit:93bf6dafd47086ec8895ea785fdb8cc1e21bb68a -->
- **08:48** · **Maintenance** — chore: add deduplicating timestamped changelog generator ([`600824e`](https://github.com/Lanzkila/Anikku-Viewer/commit/600824e597ca8466aa5211e8cbf4900e1e7141a4)) <!-- commit:600824e597ca8466aa5211e8cbf4900e1e7141a4 -->
- **08:45** · **Fixed** — fix(pages): load updated responsive header stylesheet ([`7e0983b`](https://github.com/Lanzkila/Anikku-Viewer/commit/7e0983b680f13decefbf0f1791d847b6fdbee04a)) <!-- commit:7e0983b680f13decefbf0f1791d847b6fdbee04a -->
- **08:45** · **Fixed** — fix(pwa): refresh stylesheet cache for mobile header ([`4a6df10`](https://github.com/Lanzkila/Anikku-Viewer/commit/4a6df10c6cb4135fef746af8c241ab09da62492d)) <!-- commit:4a6df10c6cb4135fef746af8c241ab09da62492d -->
- **08:45** · **Fixed** — fix(mobile): align header action buttons to the right ([`28f8de8`](https://github.com/Lanzkila/Anikku-Viewer/commit/28f8de86cf4333fa6a3459c1bee3dae8eef8fa47)) <!-- commit:28f8de86cf4333fa6a3459c1bee3dae8eef8fa47 -->
<!-- AUTO-CHANGELOG:END -->


## [0.3.2] - 2026-09-05

### Fixed
- Reworked the Anikku Library pager to match Komikku: `Previous · Page X / Y · Next`.
- Fixed the bottom-of-page state so the `↓` button becomes dark/disabled when the footer is reached.
- Fixed the top-of-page state so the `↑` button becomes dark/disabled at the top.
- Scroll-button state now refreshes after pagination, filters, dynamic rendering, resize and document-height changes.
- Increased the bottom spacing around the pager/footer so the whole lower section matches Komikku more closely.
- Fixed the visible build label/footer to v0.3.2.
- Changed the injected suite fetch to network-first to reduce stale service-worker add-on caching.
- Updated service-worker cache to `kirin-anikku-v032`.

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
