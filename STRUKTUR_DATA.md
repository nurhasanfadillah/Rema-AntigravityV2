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


## LOGIC DATA
- Status orders otomatis menjadi 'Packing' hanya jika SEMUA order_details di bawah nomor pesanan tersebut sudah berstatus 'Selesai'.
- Pesanan dengan status  'Diproses', 'Packing' dan 'Selesai' hanya bisa ‘Dibatalkan’ tidak bisa dihapus
- Jika sumber_pesanan = 'Online', maka field file_resi wajib diisi.
- Jika sumber_pesanan = 'Offline', maka field data penerima (nama, kontak, alamat) wajib diisi manual.
- status dorder_details dari 'Menunggu' hanya bisa dikonfirmasi jika staus ordernya 'Diproses'



KREDERNSIAL SUPABASE
API URL: https://nvpwgzhsxrydgqgmezea.supabase.co
API KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cHdnemhzeHJ5ZGdxZ21lemVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTY4NDYsImV4cCI6MjA4Nzg3Mjg0Nn0.yA1H0mg0gWa76eG8ViKxM9iFSy_rnnG0xPPha8bzilo

## RIWAYAT PERBAIKAN
- **(Maret 2026)**: Standardisasi desain sistem tipografi secara global menggunakan Tailwind CSS v4 `@theme`. Mengadopsi dua jenis font (Outfit sebagai primary untuk Heading, dan Inter sebagai secondary untuk Body), pembenahan skala hierarki tipografi (H1, H2, H3, Body, Caption), proporsi ukuran, serta konfigurasi line-height, kerning, dan grid spacing modular khusus platform mobile serta perbaikan kontras warna (dark corporate theme).
- **(Bulan/Tahun Terbaru)**: Implementasi penuh fitur CRUD (Create, Read, Update, Delete) pada modul `Mitra`, `Kategori`, `Produk`, dan Modul `Pesanan` (Update status dan hapus pesanan) terintegrasi secara langsung menggunakan Supabase client. State diurus oleh Zustand di level `store/`. UI difinalisasi dengan fitur forms `Edit` & Delete Actions. Mengatasi `useState`/`useNavigate` error perihal import.
- **(Maret 2026)**: Implementasi dan sinkronisasi LOGIC DATA sesuai dokumen `STRUKTUR_DATA.md`:
  1. Otomatisasi status pesanan menjadi 'Packing' saat SEMUA `order_details` diverifikasi 'Selesai'.
  2. Mencegah (disable) hapus pesanan bila status pesanan sudah 'Diproses', 'Packing', atau 'Selesai' dan membatasi item dari 'Menunggu' kecuali status pesanan sudah 'Diproses'.
  3. Form khusus Pesanan: Input `file_resi` otomatis wajib jika 'Online' dan input informasi pelanggan wajib jika 'Offline'.
- **(Maret 2026)**: Implementasi fitur foto produk (products.foto_produk) terintegrasi penuh dengan Supabase Storage (bucket products), dilengkapi validasi file (JPG/PNG/WebP, <5MB), pratinjau rasio 1:1, dan manajemen penghapusan berkas storage untuk mencegah orphan files.
