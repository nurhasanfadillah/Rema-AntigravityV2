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
- status dorder_details dari 'Menunggu' hanya bisa dikonfirmasi jika staus ordernya 'Diproses'

## RIWAYAT PERBAIKAN
- **(Maret 2026)**: Refaktor besar peribahan status (UX Buttons). Menggantikan dropdown dengan sistem tombol berbasis *state-driven* yang sinkron dengan database: Level `orders` progresif (Konfirmasi -> Diproses -> Packing -> Selesai -> Batalkan), Level `order_details` disinkronkan ke status induk dan bersifat progresif (DTF -> Sablon -> Selesai). Seluruh transisi kini divalidasi ketat di `orderStore` (Rule Engine) serta otomatisasi audit trail audit yang lebih detail.
- **(Maret 2026)**: Implementasi mekanisme konfirmasi interaktif berbasis Rule Engine. transisi status kini dikontrol ketat oleh prasyarat (file_resi jika Online, data penerima jika Offline), modal konfirmasi dinamis dengan audit trail logging (user, waktu, status), serta proteksi penghapusan pesanan yang telah diproses.
- **(Maret 2026)**: Penambahan tabel `order_audit_trail` dan logic trigger di level database (SQL) untuk menjamin konsistensi data secara transaksional (auto Packing & validasi status item).
- **(Maret 2026)**: Finalisasi Modul Mitra (Plan 5). Implementasi constraint `UNIQUE` pada `nama_mitra`, otomatisasi `updated_at` via database trigger, serta standarisasi UI components (`Button` sizes & `Brand` color variables) untuk mencapai konsistensi Light Corporate Theme (WCAG AA).
- **(Maret 2026)**: Audit & Penyempurnaan Modul Produk & Kategori (Plan 6). Implementasi trigger `prevent_category_deletion` dan `prevent_product_deletion` di level database untuk proteksi integritas data. Pre-delete validation di store layer (`categoryStore`, `productStore`) dengan pesan error human-readable. Penambahan fitur drill-down kategori → produk, statistik qty pesanan aktif per produk (SUM qty dari `order_details` WHERE `orders.status = 'Diproses'`), dan edit-mode isolation (item tersembunyi dari list saat diedit) di seluruh modul (Produk, Kategori, Mitra). Standarisasi UI/UX form mengikuti pattern MitraList (accent bar, X close, spacing konsisten).
... (existing history)
