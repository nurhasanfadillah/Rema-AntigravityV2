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
    foto_produk: String (URL/Path gambar)
    created_at / updated_at: Timestamp

## PLAN 2
### DATA OPERASIONAL
1. Tabel: orders (Data Pesanan)
    Header transaksi pemesanan.
    no_pesanan: Primary Key (Format: RBM-XXXX)
    tanggal: Date (dd/mm/yyyy)
    mitra_id: Foreign Key (Relasi ke mitra.id)
    sumber_pesanan: Enum ('Online', 'Offline')
    file_resi: String (Path PDF, khusus pesanan Online)
    nama_penerima: String (Wajib jika Offline)
    kontak_penerima: String (Wajib jika Offline)
    alamat_penerima: Text (Wajib jika Offline)
    status: Enum ('Menunggu Konfirmasi'(default), 'Diproses', 'Packing', 'Selesai', Dibatalkan)
    created_at / updated_at: Timestamp

B. Tabel: order_details (Data Detail Pesanan)
Rincian item di dalam satu nomor pesanan, bisa lebih dari satu.
    ID: Primary Key
    o_pesanan: Foreign Key (Relasi ke orders.no_pesanan)
    product_id: Foreign Key (Relasi ke products.id)
    harga_satuan: Decimal (ambil harga default produk dan bisa dibuah)
    qty: Integer
    deskripsi_desain: Text (Instruksi khusus desain)
    design_file: String (multiple URL file format JPEG, PNG dan PDF, bisa lebih dari satu)
    status: Enum ('Menunggu'(default), 'Cetak DTF', 'Sablon', 'Selesai')
    created_at / updated_at: Timestamp


KREDERNSIAL SUPABASE
API URL: https://nvpwgzhsxrydgqgmezea.supabase.co
API KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cHdnemhzeHJ5ZGdxZ21lemVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTY4NDYsImV4cCI6MjA4Nzg3Mjg0Nn0.yA1H0mg0gWa76eG8ViKxM9iFSy_rnnG0xPPha8bzilo

## RIWAYAT PERBAIKAN
- **(Bulan/Tahun Terbaru)**: Implementasi penuh fitur CRUD (Create, Read, Update, Delete) pada modul `Mitra`, `Kategori`, `Produk`, dan Modul `Pesanan` (Update status dan hapus pesanan) terintegrasi secara langsung menggunakan Supabase client. State diurus oleh Zustand di level `store/`. UI difinalisasi dengan fitur forms `Edit` & Delete Actions. Mengatasi `useState`/`useNavigate` error perihal import.