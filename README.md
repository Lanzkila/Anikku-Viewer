# Kirin Anikku Backup Viewer

A client-side backup viewer for **Anikku**, focused on anime/video library metadata, episodes, watch progress, seasons, tracking, sources, feeds and saved searches.

> Viewer only. It does not stream anime, resolve video hosts, or download episodes.

## Repository

| Item | Details |
| --- | --- |
| Project | Kirin Anikku Backup Viewer |
| Repository | `Lanzkila/Kirin-Anikku-Backup-Viewer` |
| Current build | v0.1.0 Foundation |
| App type | Static client-side web app / PWA |
| Deployment | GitHub Pages |
| License | GPL-2.0 |

## v0.1.0 features

- Current Anikku backup root detection (`500–610` series)
- Legacy Anikku backup root detection
- `.tachibk`, GZIP protobuf, raw protobuf and decoded JSON input
- Anime dashboard
- Anime library with search, filters, sorting and pagination
- Continue Watching from stored episode progress
- Episode metadata:
  - seen / unseen
  - watch position
  - total duration
  - filler mark
  - bookmark
  - episode number
  - upload date
  - summary
  - preview URL presence
- Anime metadata:
  - poster / custom poster
  - background art
  - season number
  - season parent ID
  - fetch type (Seasons / Episodes)
  - source / categories / genres
- Tracking:
  - MyAnimeList
  - AniList
  - Kitsu
  - Shikimori
  - Bangumi
  - Simkl
  - Jellyfin
- Explore:
  - Categories
  - Sources
  - Trackers
  - Feeds
  - Saved Searches
- Decoded JSON export
- Seven themes
- Responsive desktop + mobile layout
- PWA shell caching after initial successful online load
- Local browser processing

## Privacy

Selected backup files are decoded inside the current browser tab. There is no custom backend upload step in this project.

Only viewer appearance/settings may be stored in browser local storage. The loaded backup itself is not persisted to local storage.

## Backup compatibility notes

Anikku's current backup root differs from Mihon/Komikku-style roots. Current Anikku stores the main anime library at protobuf field `501`, categories at `502`, and sources at `503`. The viewer also attempts the older legacy root automatically.

Episode metadata uses the Anikku/Aniyomi video-oriented fields such as seen state, last watched second, total seconds, filler mark, summary and preview URL.

v0.1.0 intentionally does **not** re-encode `.tachibk` yet. Unknown protobuf fields are skipped safely by the decoder, but a future re-encoder must model every field that needs to be preserved.

## GitHub Pages

For the simplest deployment on this static project:

1. Upload the repository files to `main`.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.

No custom Pages workflow is required for v0.1.0.

## Project structure

```text
Kirin-Anikku-Backup-Viewer/
├─ index.html
├─ README.md
├─ CHANGELOG.md
├─ LICENSE
├─ manifest.webmanifest
├─ sw.js
├─ .nojekyll
├─ schemas/
│  └─ schema-anikku.proto
└─ assets/
   ├─ css/
   │  └─ app.css
   ├─ js/
   │  └─ app.js
   ├─ icons/
   │  └─ app-icon.svg
   └─ vendor/
      └─ pako.min.js
```

## Source references

The backup field mapping used by this viewer follows the open-source Anikku backup models from `komikku-app/anikku`.

Anikku itself is an independent open-source project. This viewer is not an official Anikku application.

## License

This viewer is distributed under **GNU GPL v2.0**. See [`LICENSE`](./LICENSE).
