# Changelog

## [Unreleased]
### Added
- Diperbarui (Updated) seluruh tema warna UI ke desain **Dark Corporate Modern** sesuai dengan standar dan instruksi.
  - Warna dasar (Backgrounds) kini menggunakan dominan *dark gray* (kumpulan `zinc-900` hingga `zinc-950`).
  - Pemakaian gradasi biru gelap (dark blue gradient) diimplementasikan pada Header (Navbar), Card di Dashboard untuk menu utama, dan Primary Button (Gradient dari biru solid menuju biru gelap).
  - Kontras teks ditingkatkan mengikuti standar (minimal WCAG AA) dengan menggunakan warna `zinc-100` untuk teks primer, `zinc-300` untuk teks sekunder, dan warna khusus pada icon/elemen terkait highlight interaktif.
  - Penyesuaian shadow, border (`zinc-800`), dan divider di seluruh komponen (*Card*, *NumberInput*, Modal form, dsb) agar terlihat harmonis di atas tema latar gelap.

### Changed
- Standardisasi seluruh aksen warna UI (`bg-blue-*`, `text-blue-*`, `border-blue-*`, `ring-*`) ke gradasi modern "blue-to-dark-blue gradient":
  - **Tombol Utama (Primary)**: Diubah menjadi `bg-gradient-to-r from-blue-600 to-blue-900` dengan efek hover, active, dan disabled yang harmonis.
  - **Indikator Status & Link**: Solid colors `bg-blue-500/10` diubah menjadi `bg-gradient-to-r from-blue-900/40 to-blue-800/40` untuk tampilan transparan modern.
  - **Elemen Fokus**: Border dan ring color pada state focus menggunakan basis warna solid `blue-600` untuk konsistensi di input form (`NumberInput`, dll).
  - **Ikon dan Highlight Teks**: Dikonversi ke `text-blue-300` agar memberikan *accessibility contrast* (WCAG AA) yang minimal dan keterbacaan tinggi di atas latar warna `zinc-950`.
