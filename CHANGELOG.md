# Changelog

## [2026-03-01] - Reorganisasi Hierarki Informasi & Desain Premium Pesanan
### Added
- **Pembaruan Hierarki Visual Pesanan**: Restrukturisasi total tata letak pada halaman daftar dan detail pesanan untuk mempertegas prioritas konten:
  - **Daftar Pesanan (List)**: Kini menampilkan "Nama Mitra" sebagai judul utama (Heading) yang dominan, diikuti Tanggal sebagai metadata primer, sementara detail teknis (No. Pesanan, Sumber, Total) ditata dalam grid sekunder yang rapi.
  - **Detail Item Produksi**: Mengangkat "Nama Produk" sebagai judul utama setiap kartu item, dengan "Qty" dan "Deskripsi Desain" sebagai informasi inti yang paling menonjol.
- **Status Stepper & Progress Tracking**: Implementasi komponen `StatusStepper` dan `StatusBadge` baru yang memberikan visualisasi alur progres sistem (Menunggu -> Cetak -> Sablon -> Selesai) secara konsisten dan elegan.
- **Smart Text Management**: 
  - Penambahan fitur **Expand/Collapse** dengan *line-clamp* pada deskripsi desain yang panjang agar layout tetap rapi namun tetap dapat diakses penuh.
  - Implementasi galeri aset desain yang elegan dengan scroll horizontal dan ring highlight untuk preview file.
- **Optimasi Layout & Ruang**: Penggunaan whitespace yang lebih luas, tipografi berjenjang (`font-display` untuk heading), dan aksen gradien biru yang lebih halus untuk menciptakan kesan premium dan profesional.
- **Aksesiibilitas & Responsivitas**: Peningkatan keterbacaan pada berbagai ukuran layar dengan alignment yang konsisten dan pengelolaan teks yang lebih terkontrol.

## [2026-03-01] - Button-Driven Status UX & Progressive Workflow
### Added
- **State-Driven Button System**: Menggantikan dropdown status tradisional dengan sistem tombol berbasis kondisi (state) yang lebih intuitif dan terkontrol:
  - **Order Level**: 
    - Tombol "Konfirmasi Pesanan" (Aktif) -> "Pesanan Dikonfirmasi" (Terkunci) -> "Diproses" (Indikator Animasi) -> "Packing dan Selesaikan" (Aktif) -> "Selesai" (Indikator).
    - Tombol "Batalkan Pesanan" dengan proteksi konfirmasi destruktif berlapis (alasan + double confirm) setelah pesanan selesai.
  - **Detail Level**: 
    - Alur kerja progresif otomatis: "Cetak DTF" -> "Sablon" -> "Selesaikan Item" -> "SELESAI".
    - Penyembunyian tombol detail jika pesanan induk belum dikonfirmasi ("Menunggu Konfirmasi").
- **Strict Logic Validation**: Integrasi Rule Engine langsung ke `orderStore.ts` untuk memvalidasi setiap transisi status (mencegah lompatan status tidak sah) dan memastikan pencatatan audit trail yang akurat untuk setiap perubahan.
- **Visual Feedback & Triggers**: Penambahan indikator *pulse* pada status "Diproses" dan sinkronisasi otomatis status Pesanan induk menjadi "Packing" segera setelah semua item selesai.

## [2026-03-01] - Mekanisme Perubahan Status Interaktif & Rule Engine

### Added
- **Interactive Rule Engine**: Implementasi sistem kontrol transisi status (State Transition Control) yang membatasi alur perubahan status hanya pada jalur yang valid sesuai logika bisnis.
- **Dynamic Confirmation Modal**: Pengenalan komponen `StatusConfirmationModal` yang menampilkan rincian komprehensif sebelum perubahan status:
  - Visualisasi status saat ini vs status tujuan.
  - Verifikasi prasyarat (Prerequisite Check) secara *real-time* (e.g., pengecekan keberadaan `file_resi` untuk Online, data penerima untuk Offline).
  - Daftar konsekuensi perubahan untuk transparansi operasional.
  - Input alasan (Reasoning) wajib untuk pembatalan atau status kritis.
  - Fitur Double Confirmation untuk mencegah kesalahan pada status final/kritis (Selesai/Dibatalkan).
- **Audit Trail System**: Pencatatan otomatis setiap riwayat perubahan status ke tabel `order_audit_trail` (mencakup user, waktu, status lama, status baru, dan alasan).
- **Backend Transactional Enforcement**: Penggunaan trigger PostgreSQL untuk menjamin integritas data secara absolut di level database:
  - `trg_check_items_done`: Otomatisasi status 'Packing' saat semua detail item 'Selesai'.
  - `trg_prevent_order_delete`: Proteksi penghapusan pesanan yang sudah masuk tahap proses/produksi.
  - `trg_validate_detail_status`: Validasi integrasi transisi status detail item terhadap status pesanan induk.
### Changed
- **Refactoring Order Store**: Pembaruan `orderStore.ts` untuk mendukung parameter audit dan integrasi dengan tabel riwayat.
- **Enhanced Pesanan Detail**: Pembaruan antarmuka `PesananDetail.tsx` menggantikan dropdown status standar dengan alur konfirmasi interaktif yang lebih aman dan terperinci.

## [2026-03-01] - Fitur Foto Produk & Integrasi Storage
### Added
- **Integrasi Supabase Storage**: Implementasi penyimpanan foto produk pada bucket `products` di Supabase.
- **Komponen Upload Premium**: Penambahan komponen `ProductImageUpload` dengan fitur:
  - Preview foto dengan aspek rasio tetap (1:1).
  - Validasi tipe file (JPG, PNG, WebP) dan batasan ukuran (Maks 5MB).
  - Indikator proses upload (Loading spinner).
  - Penamaan file unik otomatis (`timestamp-random`) untuk mencegah duplikasi/konflik.
- **Manajemen Orphan Files**: Mekanisme otomatis menghapus file lama dari storage saat foto diganti atau produk dihapus.
- **UI Produk yang Diperbarui**: Tampilan daftar produk kini menyertakan foto dengan placeholder yang rapi dan konsisten, menggunakan grid layout yang selaras.

## [2026-03-01] - Data Integrity & Mandatory Mitra Relation
### Added
- **Mandat Relasi Mitra-Pesanan**: Memastikan setiap entitas pesanan (`orders`) wajib memiliki relasi ke entitas `mitra` (non-nullable).
- **Penyederhanaan Sumber Pesanan**: Menyesuaikan label dropdown Sumber Pesanan menjadi hanya "Online" dan "Offline" untuk menghilangkan ambiguitas, karena seluruh pesanan kini sudah pasti terikat pada mitra.
- **Integritas Referensial**: Implementasi pencegahan penghapusan mitra yang masih memiliki riwayat pesanan di level aplikasi (Referential Integrity Check).
- **Mekanisme Migrasi**: Penambahan utility `src/utils/dataMigration.ts` untuk audit otomatis dan perbaikan data pesanan yang tidak memiliki relasi valid.
### Changed
- **UI Pesanan Baru**: Update form input pesanan agar pemilihan Mitra bersifat wajib untuk semua sumber pesanan (Online maupun Offline) dan label sumber pesanan disederhanakan.
- **UI Daftar Pesanan**: Penyesuaian tampilan daftar pesanan agar konsisten menampilkan nama mitra penanggung jawab untuk semua jenis sumber pesanan.
- **Order Store**: Penyesuaian `interface Order` dan fungsi `addOrder` untuk mendukung skema mandatory `mitra_id`.

## [2026-03-01] - Data Structure & Logic Alignment
### Added
- Sinkronisasi struktur data tabel `mitra`, `categories`, `products`, `orders`, dan `order_details` sesuai PLAN 1 & PLAN 2.
- Implementasi Logika Data Transaksi:
  - Validasi hapus pesanan: Pesanan status 'Diproses', 'Packing', dan 'Selesai' tidak dapat dihapus (Logic Data #2).
  - Validasi proses item: Status item hanya bisa diubah dari 'Menunggu' jika status pesanan induk adalah 'Diproses' (Logic Data #5).
  - Automasi status 'Packing': Pesanan otomatis menjadi 'Packing' jika seluruh item detail sudah berstatus 'Selesai' (Logic Data #1).
- Penambahan Ringkasan Transaksi: Menampilkan `Total Qty` dan `Total Jumlah` pada setiap card di daftar pesanan (View Data requirement).
### Changed
- Penyesuaian label field `limit_tagihan` menjadi **"Limit"** pada modul Mitra agar sesuai dengan terminologi PLAN 1.
- Validasi strict `sumber_pesanan`: Memastikan file_resi wajib untuk Online dan data penerima wajib untuk Offline (Logic Data #3 & #4).

## [2026-03-01] - UI/UX Polish & Bug Fixes
### Fixed
- **Modul Pesanan (Pesanan Baru)**: Memperbaiki masalah tombol "Simpan Transaksi" dan "Batal" yang tidak muncul karena tertutup oleh `BottomNavigation`. 
  - `BottomNavigation` kini otomatis tersembunyi pada halaman input pesanan baru dan detail pesanan untuk memaksimalkan ruang kerja.
  - Peningkatan `z-index` dan *styling* pada bar aksi (bottom bar) agar lebih kontras dan premium.

## [Unreleased]
### Added
- Diperbarui (Updated) seluruh tema warna UI ke desain **Dark Corporate Modern** sesuai dengan standar dan instruksi.
  - Warna dasar (Backgrounds) kini menggunakan dominan *dark gray* (kumpulan `zinc-900` hingga `zinc-950`).
  - Pemakaian gradasi biru gelap (dark blue gradient) diimplementasikan pada Header (Navbar), Card di Dashboard untuk menu utama, dan Primary Button (Gradient dari biru solid menuju biru gelap).
  - Kontras teks ditingkatkan mengikuti standar (minimal WCAG AA) dengan menggunakan warna `zinc-100` untuk teks primer, `zinc-300` untuk teks sekunder, dan warna khusus pada icon/elemen terkait highlight interaktif.
  - Penyesuaian shadow, border (`zinc-800`), dan divider di seluruh komponen (*Card*, *NumberInput*, Modal form, dsb) agar terlihat harmonis di atas tema latar gelap.

### Changed
- Standardisasi seluruh aksen warna UI (`bg-blue-*`, `text-blue-*`, `border-blue-*`, `ring-*`) ke gradasi modern "blue-to-dark-blue gradient":
  - **Tombol Utama (Primary)**: Secara eksplisit menggunakan `bg-gradient-to-r from-blue-600 to-blue-900` dengan efek hover, active, dan disabled yang harmonis di seluruh modul dan form. Menghapus override warna spesifik lokal (emerald, purple, orange).
  - **Indikator Status, Badge, dan Link**: Warna solid dan spesifik modul diubah secara massal menjadi `bg-gradient-to-r from-blue-900/40 to-blue-800/40` atau badge gradien untuk memberikan tampilan transparan modern dan harmonis secara aplikasi-sentris.
  - **Elemen Fokus dan Progress**: Border serta ring color pada state focus menggunakan basis warna solid/gradien `blue-600` untuk konsistensi di input form (`NumberInput`, select, text area). Menghilangkan warna emerald, purple, serta orange dari state focus.
  - **Ikon dan Highlight Teks**: Dikonversi penuh ke `text-blue-300` agar memberikan *accessibility contrast* (WCAG AA) yang andal dan keterbacaan tinggi di atas latar warna gelap `zinc-900/50`. Teks form label menggunakan gradien cerah `from-blue-100 to-blue-300`.

### UX Improvements
- **Perbaikan Alur Navigasi**: Menambahkan `BottomNavigation` yang intuitif untuk perpindahan antar modul utama (Home, Pesanan, Produk, Mitra) tanpa harus kembali ke dashboard utama, meminimalkan steps.
- **Feedback Visual (Toast)**: Mengintegrasikan `react-hot-toast` secara global untuk memberikan umpan balik (success/error messages) yang jelas dan instan pada setiap aksi CRUD (Create, Update, Delete) di semua modul aplikasi.
- **Responsivitas Interaksi**: Menambahkan efek mikrotouch `active:scale-95` dan pointer pada `Button` component untuk mempercepat waktu respons sentuhan antarmuka dan mengurangi friksi bagi pengguna.
- **Penyesuaian Safe Area Mobile**: Menerapkan kelas padding bottom khusus di `MobileLayout` untuk memastikan `BottomNavigation` dan daftar list data tidak bertumpuk serta memastikan scroll page tetap terlihat jelas sampai paling bawah.
