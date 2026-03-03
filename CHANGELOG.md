## [2026-03-04] - Penyelarasan UI Statistik Detail Keuangan
### Changed
- **Konsistensi UI Card Statistik**: Mensinkronkan struktur dan layout statistik card pada halaman Detail Keuangan (`FinanceDetail.tsx`) agar presisi dan identik dengan halaman utama Keuangan (`FinanceList.tsx`). Pengaturan meliputi hierarki dua tingkat untuk "Saldo Tagihan", serta layout grid dua kolom (sejajar) untuk "Pending" dan "Proyeksi Saldo" menggunakan tipografi `font-display`, spasi proporsional, border, alignment icon, dan *rounded-corner* yang konsisten.

## [2026-03-03] - Revamping Komponen Form Pesanan Baru
### Added
- **Form Multiupload Desain Terintegrasi**: Memodifikasi fitur pengunggahan `DesignFileUpload` dengan dukungan *multiple files selected at once*, kapasitas masif (maksimal 10 file per pesanan), lengkap dengan validasi file (10MB/file dan filter format ekstensi JPG/PNG/PDF yang ketat).
- **Penambahan File Counter Label**: Mengimplementasi live counter untuk mengetahui beban batas unggah (contoh `(2/10)`) serta informasi kapasitas.
### Changed
- **Penyelarasan Tata Letak Upload & Label Aktual**: Menyempurnakan layout hasil preview file ke dalam format 4-kolom (*cards list*) pada ukuran desktop/tablet dan 3-kolom pada layar mobile, menghasilkan ukuran thumbnail konstan 1:1 yang lebih proporsional (compact) dan rapi (*gap-2*). Menyingkirkan block layout *Tile "Tambah File"* menggantikannya menjadi *inline block Button* *Primary Solid Blue* dengan label "Upload File Desain" secara eksplisit untuk "Penambahan file" lanjutan agar ruang tetap seimbang.
- **Standarisasi Aksi Utama form.**: Mengganti styling ikon Plus untuk tombol array `Tambah Item` di form pendaftaran menjadi representatif penuh warna primer menggunakan teks instruksional yang memperbesar target touch (Touch Target >44px) untuk kemudahan operasional *admin* saat menambahkan produk.

## [2026-03-03] - Penyesuaian Skala Logo Header
### Changed
- **Peningkatan Ukuran Logo Header**: Menambah ukuran logo header (`LOGO_HEADER_REMVAV2`) sebesar ±30% dari ukuran sebelumnya untuk memperkuat visibilitas brand. Skala baru disesuaikan menjadi `h-[47px]` (dari `h-9`/36px) pada perangkat mobile dan `sm:h-[55px]` (dari `h-[42px]`) pada layar yang lebih lebar.
- **Optimalisasi Kontainer Logo**: Memperluas `max-width` kontainer logo menjadi `max-w-[260px]` (mobile) dan `sm:max-w-[340px]` untuk memastikan logo tetap proporsional dan terpusat tanpa risiko terpotong.

## [2026-03-03] - Refinemen UI Layout Halaman View Pesanan
### Changed
- **Header Layout**: Mengubah struktur header menjadi tiga kolom sejajar (`grid-cols-[auto_1fr_auto]`). Kolom pertama berisi tombol navigasi back, kolom kedua menampung judul "Detail Pesanan" beserta status badge di bawahnya, dan kolom ketiga berisi tombol aksi (Hapus/Batalkan) dengan alignment rata kanan.
- **Card Layout Terstruktur**: Menyempurnakan Card utama menjadi tata letak yang lebih bersih:
  - Baris pertama: Menampilkan "Nama Pelanggan - No. Pemesanan" dalam satu baris murni teks (tanpa ikon/label) di sisi kiri, dan tombol aksi (Edit/Status) rata kanan seimbang.
  - Baris kedua: Ikon & tanggal di kiri, ikon & sumber pesanan di kanan.
  - Baris ketiga: Label "Total Pembayaran" dan nominal disejajarkan rata kanan dengan proporsi ukuran font yang memperkuat hierarki pembacaan.
  - Baris keempat: Menampilkan label "Informasi Pengiriman" rata kiri, diikuti dengan tombol Dokumen Resi *full-width* (jika sumber Online) atau blok ringkasan Informasi Penerima (jika Offline).
- **Tipografi & Hierarki Visual**: Mengurangi penggunaan huruf kapital penuh yang tidak perlu, membatasi *bold* hanya pada elemen prioritas (Nama Pelanggan/Mitra, Nilai Total), serta merapikan ukuran font (Judul > Nama > Total > Metadata) demi antarmuka pengguna yang *clean* dan sangat profesional untuk konteks *mobile*.

## [2026-03-02] - Refinemen UI/UX Keuangan & Filter Rentang Tanggal
### Added
- **Filter Rentang Tanggal Dinamis**: Fitur filtrasi transaksi berdasarkan rentang waktu (`startDate` & `endDate`) pada halaman Detail Keuangan.
- **Modal Date Range Picker**: UI modal yang compact, minimalis, dan mobile-friendly untuk pemilihan rentang tanggal dengan tombol "Terapkan" dan "Reset".
- **Indikator Periode Aktif**: Tampilan badge periode yang sedang diterapkan (e.g., "1 Jan 2024 — 15 Jan 2024") dengan tombol hapus filter cepat.
### Changed
- **Pembersihan Redundansi UI**: Menghapus sub-card "Total Tagihan" dan "Total Pembayaran" dari halaman utama daftar keuangan (`FinanceList.tsx`) untuk fokus pada Saldo Utama.
- **Kontekstualisasi Metrik**: Menampilkan "Total Tagihan" dan "Total Pembayaran" hanya saat filter periode aktif di halaman Detail Keuangan, memberikan angka yang relevan dengan rentang waktu yang dipilih.
- **Recalculation Dinamis**: Sistem secara otomatis menghitung ulang total masuk/keluar dan memperbarui daftar transaksi segera setelah filter diterapkan atau transaksi manual dimanipulasi.
- **Minimalist Filter UI**: Mengganti tombol filter teks panjang dengan ikon filter elegan yang konsisten dengan sistem desain aplikasi.
- **Store Update (`financeStore.ts`)**: Mendukung parameter `startDate` dan `endDate` pada fungsi `fetchTransactionsByMitra` untuk sinkronisasi data dengan backend Supabase.
- **Fix Component `Card`**: Menambahkan dukungan formal untuk `React.MouseEvent` pada props `onClick` untuk mencegah bubbling event pada modal interaktif.

## [2026-03-02] - Modul Aktivitas — Audit Trail Terpusat (Plan 7)
### Added
- **Tabel `activity_logs`** (`plan7_activity_logs.sql`): Tabel audit trail terpusat dengan kolom timestamp presisi, user_id, user_role, module, action, description, reference_id, old_value (JSONB), new_value (JSONB), dan metadata (JSONB). RLS insert-only (tidak dapat diedit/dihapus user biasa).
- **Central Logger Service** (`activityLogger.ts`): Fungsi `logActivity()` terpusat dengan pola fire-and-forget (non-blocking) untuk pencatatan otomatis dari semua store.
- **Activity Store** (`activityStore.ts`): Zustand store dengan pagination (25/halaman), filter multi-kriteria (modul, aksi, rentang tanggal, pencarian teks).
- **Halaman Log Aktivitas** (`AktivitasList.tsx`): UI read-only berbasis card-timeline dengan:
  - Filter panel (modul, aksi, tanggal, pencarian)
  - Action badge berkode warna (CREATE=hijau, UPDATE=biru, DELETE=merah, STATUS_CHANGE=kuning, CANCEL=merah)
  - Expandable detail old_value vs new_value diff view
  - Pagination navigasi
  - Empty state responsif
- **Menu Dashboard**: Grup "Sistem" baru dengan ikon Activity gradient violet/purple.
### Changed
- **Integrasi Logger ke 5 Store**:
  - `mitraStore.ts`: Logging CREATE, UPDATE, DELETE dengan old/new value tracking.
  - `categoryStore.ts`: Logging CREATE, UPDATE, DELETE.
  - `productStore.ts`: Logging CREATE, UPDATE, DELETE.
  - `orderStore.ts`: Logging CREATE, UPDATE, DELETE, STATUS_CHANGE, CANCEL (termasuk auto-Packing).
  - `financeStore.ts`: Logging CREATE, UPDATE, DELETE transaksi keuangan.

## [2026-03-02] - Penyesuaian Ikon Navigasi Dashboard
### Fixed & Improved
- Mengubah tampilan ikon navigasi Dashboard dari transparan/glassmorphism menjadi solid gradient (100% opacity).
- Mengimplementasikan skema warna fungsional: Biru untuk Operasional, Slate/Neutral untuk Master Data, dan Emerald untuk Keuangan.
- Meningkatkan kontras ikon dengan menggunakan warna putih dan mempertebal stroke-width menjadi 2.5.
- Meningkatkan ukuran container ikon dan radius (18px) untuk tampilan yang lebih premium dan profesional.
- Penambahan bayangan (shadow) yang lebih kuat (stronger) untuk memberikan kedalaman visual yang lebih baik.

## [2026-03-02] - Finalisasi Modul Mitra & Standarisasi UI Components
### Added
- **Migration Plan 5 (`plan5_mitra_uniqueness.sql`)**: 
  - Penambahan constraint `UNIQUE` pada `nama_mitra` di level database untuk validasi absolut.
  - Implementasi trigger `handle_updated_at` untuk pemeliharaan otomatis timestamp `updated_at` pada tabel mitra.
### Changed
- **Penguatan Logic `mitraStore.ts`**:
  - Sinkronisasi manual check dengan backend constraint untuk menangani race conditions secara elegan.
  - Integrasi `get().fetchMitras()` untuk memastikan state UI selalu selaras dengan database setelah operasi CRUD.
- **Standarisasi Komponen Global (`Button`, `StatusBadge`, `Notify`)**:
  - **Button**: Penambahan dukungan `size` prop ('sm', 'md', 'lg') dan penggunaan variabel brand theme (`brand-accent`) secara eksklusif.
  - **StatusBadge & Stepper**: Migrasi dari hardcoded hex codes ke sistem variabel brand dan optimalisasi shadow menggunakan brand palette.
  - **Notify (Toast)**: Penyelarasan palet warna notifikasi dengan standar Light Corporate Theme (WCAG AA Compliant).
- **Refinement UI `MitraList.tsx`**: 
  - Peningkatan kontras teks alamat dan metadata mitra.
  - Penyesuaian spacing kartu dan tombol aksi untuk optimalisasi penggunaan pada perangkat mobile.


## [2026-03-02] - Optimasi Header & Visual Logo (Compact Mode)
### Changed
- **Header Layout Optimization**: Mengurangi padding vertikal (`py-2.5`) dan horizontal (`px-4`) pada header untuk menciptakan tampilan yang lebih compact namun tetap ergonomis.
- **Peningkatan Skala Logo Header**: Memperbesar ukuran logo (`LOGO_HEADER_REMVAV2`) sebesar ±30% dari ukuran sebelumnya (`h-9` untuk mobile, `sm:h-[42px]` untuk tablet/desktop) untuk mempertegas identitas visual brand.
- **Penyelarasan Presisi**: Menyesuaikan `max-width` kontainer logo untuk memastikan alignment tetap center secara presisi dan mencegah logo terpotong pada berbagai ukuran layar, serta menjaga keseimbangan visual dengan elemen sekitarnya.

## [2026-03-02] - Optimasi Build & Bundle Split (Vite)
### Changed
- **Penerapan Manual Chunking**: Mengkonfigurasi `build.rollupOptions.output.manualChunks` di `vite.config.ts` untuk memisahkan library besar ke dalam chunk tersendiri:
  - `react-vendor`: Memisahkan `react`, `react-dom`, dan `react-router-dom`.
  - `supabase`: Memisahkan `@supabase/supabase-js`.
  - `icons`: Memisahkan `lucide-react`.
  - `vendor`: Mengelompokkan library pihak ketiga lainnya.
- **Peningkatan Batas Chunk**: Menaikkan `chunkSizeWarningLimit` menjadi 1000 kB untuk menghindari peringatan build yang tidak perlu pada library vendor yang sudah dioptimasi.
- **Resolusi Warning Build**: Menghilangkan peringatan "Some chunks are larger than 500 kB" dan meningkatkan efisiensi caching browser melalui pemisahan dependensi.

## [2026-03-02] - Implementasi Identitas Visual & Branding Terpadu
### Added
- **Logo Header Utama (`LOGO_HEADER_REMVAV2.png`)**:
  - Mengimplementasikan logo utama di `MobileLayout.tsx` dengan posisi *center alignment* yang konsisten di seluruh halaman aplikasi.
  - Menerapkan padding vertikal (`py-4`) dan horizontal (`px-6`) yang proporsional untuk memberikan ruang napas ideal.
  - Memastikan ukuran responsif (`h-7` untuk mobile, `sm:h-8` untuk tablet/desktop) dan statis (`sticky top-0`) agar tidak mengganggu navigasi.
  - Menambahkan efek interaksi halus (`hover:scale-[1.02]`) pada logo untuk pengalaman pengguna yang lebih hidup.
- **Identitas Ikon Aplikasi (`ICON_APLIKASI_LOGO_REMAV2.png`)**:
  - Memperbarui Favicon (`index.html`) dan `apple-touch-icon` menggunakan aset PNG resolusi tinggi untuk konsistensi identitas pada perangkat iOS/Android/macOS.
  - Mengintegrasikan ikon ke dalam sistem PWA via `vite.config.ts`, mencakup ukuran standar (192x192), ukuran besar (512x512), dan *maskable purpose* untuk tampilan optimal di berbagai launcher.
  - Menambahkan **PWA Shortcuts** untuk navigasi instan ke modul Dashboard, Pesanan, Produksi, dan Keuangan langsung dari beranda perangkat.
  - Mengatur `theme_color` dan `background_color` (`#09090b`) serta meta tag pendukung untuk integrasi Splash Screen yang mulus.
  - Membersihkan referensi aset `favicon.ico` dan `masked-icon.svg` yang tidak relevan di konfigurasi build.
### Changed
- **Pembersihan Branding Teks**: Menghapus ornamen branding teks "REMA v2.0" yang bersifat sementara di header, menggantikannya dengan aset visual resmi yang lebih profesional dan bersih.

## [2026-03-01] - Brief Konsep Rekomendasi Desain Logo & Icon
### Added
- **Dokumen Konsep Desain (`REKOMENDASI_DESAIN_LOGO_ICON.md`)**: Membuat panduan desain komprehensif untuk identitas visual brand REMA (Redone Mandiri), mencakup:
  - Filosofi brand (Efisien, Modern, Growth, Presisi).
  - 3 Opsi konsep logo (Monogram, Abstrak, Tipografi Custom).
  - Optimasi icon aplikasi untuk mobile (Squircle, Glassmorphism, Grid Pattern).
  - Standarisasi palet warna (Blue & Zinc) dan tipografi modern (Inter/Outfit).
  - Prinsip estetika Corporate Modern & Futuristic.

## [2026-03-01] - Standarisasi Padding & Spacing UI Data Pesanan
### Changed
- **Penyelarasan Proporsi Card**: Menyesuaikan padding internal kartu pesanan pada daftar "Data Pesanan" (`PesananList.tsx`) agar identik dengan standar visual halaman "Produksi". Mengubah padding utama menjadi `pt-4 pb-3 px-4 pl-5` untuk mengkompensasi border logis dan menyamakan *visual weight*.
- **Konsistensi Ritme Vertikal**: Memperbarui spacing antar elemen kartu (gap) dari `grid gap-4` menjadi `space-y-3` agar sesuai dengan ritme vertikal yang diterapkan pada antarmuka daftar Produksi.
- **Hierarki Density**: Menghilangkan indikasi *double padding* (`!p-0`) pada `Card` komponen dasar agar tata letak *expand/collapse handle* tetap *full-width* dan menyentuh tepi kartu tanpa jarak kosong, mengamankan hierarki density yang dirancang khusus untuk Data Pesanan responsif.

## [2026-03-01] - Optimasi Interaksi Kartu Pesanan & Navigasi Direct
### Changed
- **Sistem Trigger Collapse Baru**: Mengganti mekanisme *expand/collapse* dari klik header menjadi handle visual minimalis di bagian bawah kartu (affordance) untuk menghindari konflik interaksi.
- **Navigasi Kartu Utuh (Full Card Navigation)**: Seluruh area kartu pesanan kini dapat diklik untuk menavigasi langsung ke halaman detail pesanan (`/pesanan/:id`), meningkatkan efisiensi akses informasi.
- **Akses Langsung Item Detail**: Mengimplementasikan navigasi langsung dari daftar item di dalam kartu yang telah di-expand menuju halaman detail spesifik item (`/pesanan/detail-item/:id`).
- **Feedback Interaksi Responsif**: Menambahkan efek mikrotouch `active:bg-zinc-800/20` dan hover state yang lebih kontras pada seluruh elemen interaktif dalam kartu untuk meningkatkan *affordance* dan pengalaman pengguna.
- **Pembersihan UI**: Menghapus tombol aksi eksternal yang redundan pada baris daftar untuk menciptakan tampilan yang lebih bersih, profesional, dan fokus pada konten.

## [2026-03-01] - Restrukturisasi Navigasi Bottom & Arsitektur Hub
### Changed
- **Penyederhanaan Bottom Navigation**: Menghapus menu "Lainnya" dan membatasi navigasi utama menjadi maksimal 3 menu: **Home (Dashboard)**, **Pesanan**, dan **Produksi**.
- **Layout Bottom Bar Proposional**: Menggunakan `flex-1` pada setiap item navigasi untuk memastikan distribusi ruang yang seimbang, proporsional, dan memiliki area sentuh (touch target) yang lebih luas.
- **Arsitektur Navigasi Terpusat**: 
  - Meletakkan Dashboard sebagai hub utama untuk mengakses seluruh modul (Mitra, Kategori, Produk, Pesanan, Produksi, Lainnya).
  - Reorganisasi item Dashboard dengan memprioritaskan alur kerja utama (Pesanan & Produksi) di posisi teratas.
- **Akses Kontekstual Global**: Menambahkan tombol pengaturan/hub di Header `MobileLayout.tsx` sebagai akses cepat ke menu "Lainnya/Settings" dari halaman mana pun tanpa harus melalui bottom navigation.
- **Konsistensi Visual**: Menjaga keselerasan ikon, label, dan state aktif pada seluruh elemen navigasi baru untuk pengalaman pengguna yang kohesif.

## [2026-03-01] - Eliminasi Sistem Sticky & Standarisasi Layout
### Changed
- **Penyesuaian Menyeluruh UI**: Menghapus sistem `sticky` dan `fixed` pada seluruh elemen aplikasi kecuali Bottom Navigation (Home/Pesanan/Produksi/Lainnya).
- **Update Layout & Komponen**:
  - `MobileLayout.tsx`: Header utama kini mengikuti scroll normal.
  - `ProduksiList.tsx`: Header dan Segmented Control (Tabs) status kini bersifat scrollable secara normal.
  - `PesananBaru.tsx`: Baris total transaksi (Card Summary) dan Action Bar tombol simpan kini mengikuti alur layout.
  - `PesananDetailItem.tsx`: Header detail dan floating button progres status diubah menjadi elemen layout normal.
- **Kebijakan Desain Baru**: Menempatkan navigasi utama (Bottom Navigation) sebagai satu-satunya elemen `fixed` yang diizinkan untuk stabilitas visual.

## [2026-03-01] - Refinemen UI Produksi (Compact & Flex-Grow Tabs)
### Changed
- **Optimasi Tab Status**: Memperbarui sistem tab pada `ProduksiList.tsx` untuk tampilan yang lebih modern dan efisien:
  - **Compact Text-Only**: Menghilangkan kombinasi Icon + Label, beralih ke format "Teks Ringkas Saja" (Antri, Cetak, Sablon, Selesai) dengan indikator jumlah (count) yang terintegrasi secara minimalis.
  - **Flexible Width Layout**: Mengimplementasikan `flex-grow` pada setiap tab sehingga mengisi penuh lebar layar secara proporsional tanpa *horizontal scrolling*.
  - **Tipografi & Active State**: Menggunakan font yang lebih kecil namun tetap tajam, dengan *active state* berupa background subtle dan garis bawah (underline) tipis yang elegan.
  - **Penyelarasan Spasi**: Merapikan margin dan padding pada header dan card untuk mencapai keseimbangan visual dan skannabilitas yang lebih tinggi.

## [2026-03-01] - Refaktor UI Daftar Produksi & Sentralisasi Aksi Status
### Changed
- **UI Card `ProduksiList.tsx`**: Menyesuaikan tampilan daftar item produksi agar lebih ringkas dan berfokus pada monitoring:
  - Mengubah hierarki visual dengan menjadikan "Nama Mitra" sebagai elemen paling dominan di kiri atas dan "Nama Produk x Qty" diletakkan rata kanan (sebaris) pada baris pertama.
  - Menyederhanakan Deskripsi Desain menjadi teks inline yang ringkas tanpa ornamen/box langsung di bawah baris pertama.
  - Menambahkan garis pemisah tipis (subtle divider) yang elegan untuk memisahkan secara visual antara informasi utama (Mitra, Produk, Deskripsi) dan informasi sekunder.
  - Memperkecil dan meredupkan informasi sekunder seperti Tanggal, Waktu Berlalu (relative time), dan No. Pesanan di bagian terbawah card.
  - Sepenuhnya menghapus seluruh action button (seperti "Lanjut ke...") dan *StatusBadge* langsung dari baris list array untuk menjaga area card tetap bersih dari interupsi monitoring.
- **Relokasi Action & Validasi Status ( `PesananDetailItem.tsx`)**:
  - Memindahkan seluruh mekanisme konfirmasi perubahan status (`StatusConfirmationModal`) ke halaman "View Detail_Pesanan", di mana seluruh interaksi bergeser ke state detail.
  - Mengintegrasikan aksi *floating* "Lanjut ke [Status]" di dalam page full view dengan dukungan sinkronisasi validasi dari backend.

## [2026-03-01] - Halaman Spesifik Detail Item Pesanan (Full Page View)
### Added
- **Dedicated Page `PesananDetailItem.tsx`**: Mengubah UI "Modal Khusus View Detail_Pesanan" yang sebelumnya berada di `ProduksiList` menjadi halaman terpisah yang dirender penuh (Full Page View) dengan struktur:
  - Navigasi kembali (Back Button) yang mulus dengan animasi transisi halaman (slide in/out).
  - Tampilan hierarki informasi inti: Deskripsi Desain, File Desain, serta File Resi (sumber Online) atau Detail Pengiriman (sumber Offline) yang dipertahankan tanpa interupsi informasi asing.
  - Daftar ringkas (List) item lain di bagian paling bawah pada pesanan (order) yang sama dengan deskripsi singkat, Qty, dan Status.
- **Navigasi Terpusat**: Semua Card item di halaman `PesananDetail` dan daftar di `ProduksiList` kini menggunakan pola akses navigasi push/route yang sama (`/pesanan/detail-item/:id`) menuju Dedicated Page yang baru ini, menggantikan mekanisme modal sebelumnya.
### Changed
- **Komponen `Card.tsx`**: Menambahkan *support* property `onClick` yang secara native meneruskan event click untuk mendukung navigasi langsung klik-card pada antarmuka.## [2026-03-01] - Halaman Produksi & Restrukturisasi Menu Navigasi
### Added
- **Pusat Pengelolaan Produksi (`ProduksiList.tsx`)**: Menambahkan halaman baru "Produksi" yang berfungsi sebagai pusat manajemen `detail_pesanan` secara independen, dengan fitur:
  - **Filter Relasi Backend**: Hanya menampilkan item detail yang pesanan induknya berstatus "Diproses" atau "Packing".
  - **Segmented Control Status**: Filtrasi item menggunakan tab/segmented control (Menunggu, Cetak DTF, Sablon, Selesai) untuk *monitoring* yang jelas.
  - **Atribut Visual Inti**: Menggunakan "Nama Produk" sebagai judul, Nama Mitra sebagai konteks sekunder, kuantitas, deskripsi dengan *line-clamp*, dan indikator status interaktif.
  - **Aksi Progresif**: Tombol aksi dinamis per baris item sesuai logic transisi yang berlaku untuk memindahkan status item ke tahap selanjutnya.
- **Produksi Store (`produksiStore.ts`)**: Pembuatan store *Zustand* khusus untuk melayani halaman Produksi, yang memisahkan logic pengambilan data langsung dari `order_details` dengan relasi yang sudah diperiksa.
- **Menu Halaman 'Lainnya' (`Lainnya.tsx`)**: Membuat halaman menu yang berfungsi sebagai folder pengelompokan akses untuk master data, mitra, dan pengaturan tanpa perlu navigasi dari Dashboard utama.
### Changed
- **Pembaruan Susunan Bottom Navigation**: Mereorganisasi menu *bottom bar* agar memenuhi aturan maksimal 4 menu. Daftar yang ditampilkan sekarang difokuskan pada *core operation*: 
  - Home, Pesanan, Produksi, dan Lainnya (sebagai pengganti menu Produk/Mitra yang digabung menjadi satu pengelompokan yang cerdas).
- **Integrasi Store Produksi dengan Transisi Order Store**: Memastikan setiap pembaruan manual di halaman "Produksi" terkait pembaruan status item tetap terhubung dengan *rule transitions* yang terdapat di `useOrderStore` sehingga *audit trail* dan perubahan order otomatis ke 'Packing' berjalan sesuai alur yang ada.


## [2026-03-01] - Penyederhanaan UI Daftar Pesanan & Sistem Expand/Collapse
### Changed
- **Penyederhanaan Baris Data Utama**: Menghilangkan label field eksplisit pada daftar pesanan untuk tampilan yang lebih bersih. Nama Mitra kini menjadi elemen paling dominan, didukung informasi inti (Tanggal, No. Pesanan, Status, dan Total Qty) dalam format ringkas bersimbol yang mudah dipindai.
- **Sistem Expand/Collapse Per Baris**: Mengimplementasikan kartu pesanan yang dapat dikembangkan (expandable) untuk melihat kilasan `detail_pesanan` secara langsung dari daftar.
- **Layout Detail Terstruktur**: Pada tampilan *expanded*, informasi ditampilkan terstruktur dengan Nama Produk sebagai judul utama, Qty, dan Deskripsi Desain yang dibatasi (line-clamp) untuk menjaga kerapian grid tanpa atribut berlebih.
- **Akses Cepat Detail Lengkap**: Menyediakan tombol aksi terpisah pada sisi kanan baris pesanan untuk membuka tampilan detail pesanan secara penuh.
- **Optimasi Whitespace & Transisi**: Menyempurnakan pemanfaatan ruang kosong, hierarki tipografi, serta animasi expand/collapse yang mulus tanpa merusak alignment antar baris pesanan.

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
