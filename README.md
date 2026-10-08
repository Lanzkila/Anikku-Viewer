<div align="center">

<img src="assets/icons/app-icon.svg" alt="Kirin Anikku Viewer" width="94" height="94">

# Kirin Anikku Backup Viewer

**Anikku backup explorer · Library insights · Watch progress**

Buka, semak dan urus metadata backup anime Anikku terus di browser — tanpa muat naik backup ke server khas.

*Explore and inspect your Anikku anime backups locally in your browser.*

[**🌐 Buka Viewer / Open Viewer**](https://lanzkila.github.io/Anikku-Viewer/) · [**📋 Changelog**](CHANGELOG.md) · [**📄 License**](LICENSE)

[![Stars](https://img.shields.io/github/stars/Lanzkila/Anikku-Viewer?style=flat-square&logo=github&label=Stars)](https://github.com/Lanzkila/Anikku-Viewer/stargazers)
[![Forks](https://img.shields.io/github/forks/Lanzkila/Anikku-Viewer?style=flat-square&logo=github&label=Forks)](https://github.com/Lanzkila/Anikku-Viewer/forks)
[![License](https://img.shields.io/github/license/Lanzkila/Anikku-Viewer?style=flat-square)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/Lanzkila/Anikku-Viewer?style=flat-square)](https://github.com/Lanzkila/Anikku-Viewer/commits/main/)
[![Auto changelog](https://github.com/Lanzkila/Anikku-Viewer/actions/workflows/auto-changelog.yml/badge.svg?branch=main)](https://github.com/Lanzkila/Anikku-Viewer/actions/workflows/auto-changelog.yml)

</div>

---

## 🇲🇾 Tentang projek

**Kirin Anikku Backup Viewer** ialah viewer web / PWA untuk membaca metadata daripada backup **Anikku**. Ia bertujuan membantu kau menyemak perpustakaan anime, episod, status tontonan, tracker dan masalah metadata tanpa membuka aplikasi asal.

> **Viewer sahaja.** Ia **tidak** memainkan atau memuat turun episod. Fail backup asal tidak diubah, dan eksport kembali ke format `.tachibk` masih **belum disokong**.

**Versi ciri terbaru yang direkodkan:** `v0.3.2` (Watch & Backup Intelligence + penambahbaikan navigasi/scroll). Enjin asal `v0.2.1` masih dikekalkan; suite tambahan dimuat melalui service worker.

## ✨ Ciri utama / Features

| Modul | Fungsi |
| --- | --- |
| **Backup Reader** | Kesan struktur Anikku semasa dan legacy; baca `.tachibk`, GZIP/raw protobuf dan JSON yang serasi |
| **Dashboard & Library** | Ringkasan koleksi, carian, penapis, sort, grid/compact view, pagination |
| **Watch Center** | Continue Watching, sejarah tontonan, analitik, streak dan heatmap 52 minggu |
| **Episode Center** | Semak Seen, Unseen, Watching, Filler, Bookmark dan invalid progress |
| **Season Explorer** | Hubungan parent/child, susunan musim dan pengesanan pautan parent rosak |
| **Tracker Center** | Metadata MyAnimeList, AniList, Kitsu, Shikimori, Bangumi, Simkl dan Jellyfin |
| **Metadata Tools** | Source Health, Feed / Saved Search, Quick Preview dan navigasi papan kekunci |
| **Library Tools** | Pins tempatan, custom collections, bulk selection dan pemadaman dalam memori |
| **Backup Intelligence** | Snapshot Vault, perbandingan dua backup, duplicate resolution, Repair Center, integrity grade dan Undo/reset |
| **Cover Recovery** | Fallback poster/background, pemeriksaan imej rosak, URL retry, local override serta import/eksport override |
| **Penampilan** | 7 tema, layout responsif untuk HP/desktop, kawalan scroll dan PWA |

## 🚀 Cara guna / Quick start

1. Buka **[Kirin Anikku Viewer](https://lanzkila.github.io/Anikku-Viewer/)** pada telefon atau desktop.
2. Tekan **Choose file** dan pilih backup Anikku (`.tachibk`, protobuf/GZIP atau JSON yang disokong).
3. Selepas backup diproses, guna **Dashboard**, **Library**, **Explore** dan **Tools**.
4. Tekan **◆** untuk membuka **Watch & Backup Intelligence** (pintasan desktop: `Ctrl + Shift + K`).
5. Jika perlu, eksport data yang telah dinyahkod dalam bentuk **JSON**.

> Simpan backup asal. Viewer mengubah data kerja dalam memori / data tempatan sahaja; ia bukan alat untuk menulis semula fail backup Anikku.

## 🔒 Privasi & keselamatan data

- Proses decoding backup berjalan **di browser**; viewer tidak menghantar fail backup ke server milik projek.
- Pins, collections, snapshots dan cover overrides ialah data viewer **setempat**.
- Library luaran yang diperlukan oleh decoder boleh dimuat daripada CDN; sambungan internet mungkin diperlukan pada lawatan awal.
- **Decoded/working JSON export** tersedia. **Re-encoding `.tachibk` sengaja dimatikan** sehingga liputan schema preservation lengkap.
- Selepas kemas kini GitHub Pages, refresh laman supaya service worker / cache PWA menggunakan versi terkini.

## 📁 Struktur repositori

```text
Anikku-Viewer/
├── index.html                      # UI utama
├── assets/
│   ├── css/                        # Tema, layout & suite
│   ├── js/                         # Decoder, viewer & suite
│   ├── icons/                      # Ikon PWA
│   └── vendor/                     # Dependency tempatan
├── schemas/                        # Schema protobuf
├── sw.js                           # Service worker & cache
├── manifest.webmanifest            # PWA manifest
├── scripts/update_changelog.py     # Penjana sejarah commit automatik
├── .github/workflows/
│   └── auto-changelog.yml          # Workflow GitHub Actions
├── CHANGELOG.md                    # Release notes + sejarah commit
└── LICENSE                         # GPL-2.0
```

## 📝 Auto changelog

Setiap push yang relevan ke branch `main` akan mencetuskan **[Auto Changelog](.github/workflows/auto-changelog.yml)**. Workflow membaca commit baharu, merekod tarikh dan jam **MYT (UTC+8)**, mengelakkan rekod berganda, dan mengemas kini [`CHANGELOG.md`](CHANGELOG.md) melalui satu commit bot.

- Rekod release/version sedia ada dikekalkan; log automatik disimpan dalam seksyen berasingan.
- Workflow boleh dijalankan manual melalui **Actions → Auto Changelog → Run workflow** (menyegerakkan commit sehingga 30 hari lalu).
- Commit bot tidak mencetuskan kemas kini berulang. Rekod lama tidak dibuang secara automatik.

## 🧹 Auto Library Cleanup

Apabila backup baharu dibuka, viewer secara automatik **menyembunyikan anime yang ditandakan `favorite=false`** (bukan lagi dalam Library). Rekod sejarah yang disimpan oleh aplikasi asal tidak lagi bercampur dalam Dashboard, Library dan Intelligence Suite. **Fail `.tachibk` asal tidak diubah.** Eksport JSON daripada viewer mengandungi data Library yang telah ditapis. Untuk mengetahui perubahan terkini daripada aplikasi, buat dan buka backup baharu; GitHub Pages tidak menyambung terus ke pangkalan data aplikasi.

## 🇬🇧 English overview

This is a **client-side Anikku backup metadata viewer**, not a streaming/downloading app. It supports compatible current/legacy backup formats, library and watch-progress inspection, episode/season/tracker tools, local backup intelligence and cover recovery. Open the **[live web app](https://lanzkila.github.io/Anikku-Viewer/)**, choose a compatible backup file, and inspect or export decoded JSON. Original `.tachibk` re-encoding is intentionally unavailable. Automated commit history is maintained in [CHANGELOG.md](CHANGELOG.md).

## 📜 License

Distributed under **[GPL-2.0](LICENSE)**.

<div align="center"><sub>Made for the Kirin project · <a href="https://github.com/Lanzkila/Anikku-Viewer">Lanzkila / Anikku-Viewer</a></sub></div>
