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

