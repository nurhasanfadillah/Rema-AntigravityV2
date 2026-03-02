Nama Aplikasi : REMA (Redone Execution and Management Architecture)
Pengembang : PT. REDONE BERKAH MANDIRI UTAMA
Versi Aplikasi : 2.0
Tahun : 2026

## PLAN 1
### MASTER DATA
1. Tabel: mitra (Data Mitra)
    ID: Primary Key
    nama_mitra: Nama mitra penjualan b2b
    kontak: Nomor WhatsApp/Telepon
    alamat: Alamat lengkap pengiriman/kantor
    status: Enum ('Aktif', 'Tidak Aktif')
    Limit:  Decimal/BigInt Limit tagihan
    created_at / updated_at: Timestamp

2. Tabel: categories (Kategori Produk)
    ID: Primary Key
    nama_kategori: Nama kategori (Contoh: Pouch, Handbag, Ransel, Slingbag)

3. Tabel: products (Data Produk)
    ID: Primary Key
    category_id: Foreign Key (Relasi ke categories.id)
    nama_produk: Nama barang
    deskripsi: Detail spesifikasi produk
    harga_default: Decimal/BigInt (Harga per satuan)
    status: Enum ('Aktif', 'Tidak Aktif')
    foto_produk: String (URL/Path gambar), penyimpanan di supabase storage
    created_at / updated_at: Timestamp

## PLAN 2
### DATA OPERASIONAL
1. Tabel: orders (Data Pesanan)
    Header transaksi pemesanan.
    no_pesanan: Primary Key (Format: RBM-XXXX)
    tanggal: Date (dd/mm/yyyy)
    mitra_id: Foreign Key (Relasi ke mitra.id) - **MANDATORY (Non-Nullable)**
    sumber_pesanan: Enum ('Online', 'Offline'), Klasifikasi kanal masuk pesanan (Digital vs Non-Digital), seluruh pesanan wajib terikat ke mitra. Jika 'Online' wajib file resi (PDF), jika 'Offline' wajib data penerima.
    file_resi: String (Path PDF, khusus pesanan Online)
    nama_penerima: String (Wajib jika Offline)
    kontak_penerima: String (Wajib jika Offline)
    alamat_penerima: Text (Wajib jika Offline)
    status: Enum ('Menunggu Konfirmasi'(default), 'Diproses', 'Packing', 'Selesai', Dibatalkan)
    created_at / updated_at: Timestamp
    **Integritas Data:** Foreign Key ke `mitra` bersifat `RESTRICT` (Mitra tidak bisa dihapus jika memiliki pesanan).
    view data:
        total_qty: Integer (Hasil kalkulasi SUM(detail_pesanan.qty))
        total_jumlah: Decimal (Hasil kalkulasi SUM(detail_pesanan.subtotal))

B. Tabel: order_details (Data Detail Pesanan)
Rincian item di dalam satu nomor pesanan, bisa lebih dari satu.
    ID: Primary Key
    o_pesanan: Foreign Key (Relasi ke orders.no_pesanan)
    product_id: Foreign Key (Relasi ke products.id)
    harga_satuan: Decimal (ambil harga default produk dan bisa dibuah)
    qty: Integer
    deskripsi_desain: Text (Instruksi khusus desain)
    design_file: String (multiple URL file format JPEG, PNG dan PDF, bisa lebih dari satu), jika ada file JPEG atau PNG gambar terlihat di UI, penyimpanan di supabase storage
    status: Enum ('Menunggu'(default), 'Cetak DTF', 'Sablon', 'Selesai')
    created_at / updated_at: Timestamp
    view data:
        subtotal: Decimal (Hasil kalkulasi harga_satuan * qty)

C. Tabel: order_audit_trail (Audit Trail Pesanan)
Pencatatan riwayat perubahan status untuk keamanan dan pelacakan.
    ID: Primary Key
    no_pesanan: Foreign Key (Relasi ke orders.no_pesanan)
    status_lama: String
    status_baru: String
    alasan: Text
    aksi_oleh: String (User/Sistem)
    created_at: Timestamp


## LOGIC DATA
- Status orders otomatis menjadi 'Packing' hanya jika SEMUA order_details di bawah nomor pesanan tersebut sudah berstatus 'Selesai'.
- Pesanan dengan status  'Diproses', 'Packing' dan 'Selesai' hanya bisa ‘Dibatalkan’ tidak bisa dihapus
- Jika sumber_pesanan = 'Online', maka field file_resi wajib diisi.
- Jika sumber_pesanan = 'Offline', maka field data penerima (nama, kontak, alamat) wajib diisi manual.
- Status order_details dari 'Menunggu' hanya bisa dikonfirmasi jika status ordernya 'Diproses'.
- **Representasi Status:** Jika `orders.status = 'Diproses'` dan SEMUA `order_details` masih 'Menunggu', maka label status pesanan ditampilkan sebagai **'Dikonfirmasi'**. Label otomatis berubah kembali menjadi **'Diproses'** jika minimal satu detail sudah masuk tahap produksi (Cetak DTF/Sablon).

## RIWAYAT PERBAIKAN
- **(Maret 2026)**: Refaktor besar peribahan status (UX Buttons). Menggantikan dropdown dengan sistem tombol berbasis *state-driven* yang sinkron dengan database: Level `orders` progresif (Konfirmasi -> Diproses -> Packing -> Selesai -> Batalkan), Level `order_details` disinkronkan ke status induk dan bersifat progresif (DTF -> Sablon -> Selesai). Seluruh transisi kini divalidasi ketat di `orderStore` (Rule Engine) serta otomatisasi audit trail audit yang lebih detail.
- **(Maret 2026)**: Implementasi mekanisme konfirmasi interaktif berbasis Rule Engine. transisi status kini dikontrol ketat oleh prasyarat (file_resi jika Online, data penerima jika Offline), modal konfirmasi dinamis dengan audit trail logging (user, waktu, status), serta proteksi penghapusan pesanan yang telah diproses.
- **(Maret 2026)**: Penambahan tabel `order_audit_trail` dan logic trigger di level database (SQL) untuk menjamin konsistensi data secara transaksional (auto Packing & validasi status item).
- **(Maret 2026)**: Finalisasi Modul Mitra (Plan 5). Implementasi constraint `UNIQUE` pada `nama_mitra`, otomatisasi `updated_at` via database trigger, serta standarisasi UI components (`Button` sizes & `Brand` color variables) untuk mencapai konsistensi Light Corporate Theme (WCAG AA).
- **(Maret 2026)**: Audit & Penyempurnaan Modul Produk & Kategori (Plan 6). Implementasi trigger `prevent_category_deletion` dan `prevent_product_deletion` di level database untuk proteksi integritas data. Pre-delete validation di store layer (`categoryStore`, `productStore`) dengan pesan error human-readable. Penambahan fitur drill-down kategori → produk, statistik qty pesanan aktif per produk (SUM qty dari `order_details` WHERE `orders.status = 'Diproses'`), dan edit-mode isolation (item tersembunyi dari list saat diedit) di seluruh modul (Produk, Kategori, Mitra). Standarisasi UI/UX form mengikuti pattern MitraList (accent bar, X close, spacing konsisten).
- **(Maret 2026)**: Implementasi Modul Aktivitas — Audit Trail Terpusat (Plan 7). Tabel baru `activity_logs` dengan RLS insert-only (tidak dapat diedit/dihapus user biasa). Central logger service (`activityLogger.ts`) terintegrasi di seluruh store (Mitra, Kategori, Produk, Pesanan, Keuangan) secara fire-and-forget. Pencatatan otomatis CREATE, UPDATE, DELETE, STATUS_CHANGE, CANCEL dengan old_value/new_value JSON. UI read-only dengan filter (modul, aksi, tanggal, pencarian) dan pagination.
- **(Maret 2026)**: Perbaikan Modul Keuangan (Plan 8). Optimasi logic `estimasi_tagihan` agar hanya menghitung `orders` berstatus 'Diproses' dan 'Packing'. Implementasi sinkronisasi real-time antara `orderStore` dan `financeStore` (Auto-refresh summary saat status berubah). Standarisasi terminologi UI: 'Saldo Tagihan' (tampilan disederhanakan), 'Total Tagihan', 'Total Pembayaran', dan 'Tagihan Pending' untuk konsistensi hierarki visual dan kejelasan arus kas per mitra.
- **(Maret 2026)**: Penyesuaian logic label status `orders`. Implementasi status virtual **'Dikonfirmasi'** sebagai representasi pesanan yang telah disetujui namun belum masuk tahap produksi. Logic bersifat dinamis (agregasi status detail): pesanan berstatus 'Diproses' akan berlabel 'Dikonfirmasi' jika seluruh item masih 'Menunggu', dan otomatis berubah kembali ke 'Diproses' saat pengerjaan item dimulai. Perubahan ini diterapkan pada `orderStore` (helper logic) dan direfleksikan secara real-time di UI (`StatusBadge`, `PesananList`, `PesananDetail`).
... (existing history)

## PLAN 7
### SISTEM — AUDIT TRAIL TERPUSAT
1. Tabel: activity_logs (Log Aktivitas Sistem)
    Pencatatan seluruh aksi penting untuk kontrol internal dan investigasi.
    id: Primary Key (UUID)
    timestamp: Timestamp presisi (TIMESTAMPTZ, default NOW())
    user_id: Pelaku aksi (default: 'Administrator')
    user_role: Role pengguna (default: 'Admin')
    module: Modul/entitas terdampak (Pesanan, Detail Pesanan, Produk, Kategori, Mitra, Keuangan)
    action: Jenis aksi (CREATE, UPDATE, DELETE, STATUS_CHANGE, CANCEL)
    description: Deskripsi ringkas human-readable
    reference_id: ID data terkait (order_id, product_id, dll.)
    old_value: JSONB — nilai sebelum perubahan
    new_value: JSONB — nilai sesudah perubahan
    metadata: JSONB — info tambahan (IP, device, trigger)
    **Keamanan:** RLS insert-only. Tidak ada policy UPDATE/DELETE. Data tidak dapat diedit atau dihapus oleh user biasa.
    **Integrasi:** Logger terpusat (`activityLogger.ts`) dipanggil dari semua store secara non-blocking (fire-and-forget).
