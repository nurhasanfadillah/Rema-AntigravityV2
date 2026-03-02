# Struktur Data & Business Logic — Rema-AntigravityV2

## Arsitektur Data
Aplikasi ini menggunakan Supabase (PostgreSQL) sebagai database utama dengan relasi antar tabel sebagai berikut:

1. **Table: mitra**
   - Menyimpan data pelanggan tetap (Mitra).
   - Field kunci: `id`, `nama_mitra`, `kontak`, `alamat`.

2. **Table: products & product_categories**
   - `product_categories`: Pengelompokan produk (DTF, Kaos Polos, Sablon, dll).
   - `products`: Detail produk dengan harga default.
   - Relasi: Many-to-one (Produk ke Kategori).

3. **Table: orders (Header)**
   - `no_pesanan`: Primary key (format: R-YYYYMMDD-XXXX).
   - `status`: 'Menunggu Konfirmasi', 'Diproses', 'Packing', 'Selesai', 'Dibatalkan'.
   - `sumber_pesanan`: 'Online', 'Offline'.

4. **Table: order_details (Items)**
   - Menyimpan item-item dalam satu pesanan.
   - `status`: 'Menunggu', 'Cetak DTF', 'Sablon', 'Selesai'.
   - Automasi: Jika SEMUA detail item 'Selesai', maka Header Order otomatis menjadi 'Packing'.

5. **Table: financial_transactions**
   - Mencatat arus kas per mitra.
   - `masuk`: Nilai pendapatan (otomatis terisi saat item di order_details menjadi 'Selesai').
   - `keluar`: Nilai pengeluaran/pembayaran (diisi manual oleh admin).

---

## Aturan Bisnis (Business Rules)

1. **Status Transition (Progressive)**
   - Pesanan harus melewati tahapan: Menunggu Konfirmasi → Diproses → Packing → Selesai.
   - Item produksi harus melewati tahapan: Menunggu → Cetak DTF → Sablon → Selesai.
   - Item hanya bisa diproses (`Menunggu` → `Cetak DTF`) jika status Pesanan sudah `Diproses`.

2. **Logic Data: Representasi Status 'Dikonfirmasi'**
   - Khusus untuk status Header `Diproses`, jika SELURUH `order_details` masih berstatus `Menunggu`, maka di UI akan ditampilkan sebagai **'Dikonfirmasi'**.
   - Status akan berubah kembali menjadi **'Diproses'** segera setelah minimal satu item mulai dikerjakan (status pindah dari `Menunggu`).

3. **Integritas Penghapusan (Protection)**
   - Kategori tidak bisa dihapus jika masih memiliki Produk.
   - Produk tidak bisa dihapus jika sudah pernah ada dalam Pesanan.
   - Pesanan hanya bisa dihapus permanen jika statusnya `Dibatalkan`.

4. **Audit Trail (Aktivitas)**
   - Setiap perubahan data (Mitra, Produk, Pesanan, Status, Keuangan) dicatat otomatis di tabel `activity_logs`.
   - Data aktivitas bersifat immutable (tidak dapat diubah/dihapus).

5. **Sistem Keuangan per Mitra (Finance System)**
   - **Saldo Tagihan**: Akumulasi nilai item `Selesai` (otomatis masuk kas) dikurangi pengeluaran manual (pembayaran mitra).
   - **Tagihan Pending**: Akumulasi `harga_satuan x qty` dari item yang BELUM `Selesai` pada pesanan dengan status `Diproses` atau `Packing`.
   - **Proses Transaksi Masuk**: Terjadi otomatis per ITEM saat status item diubah menjadi `Selesai`.
   - **Proses Transaksi Keluar**: Dicatat manual sebagai bukti pembayaran dari mitra ke kita.

---

## Log Perubahan (System Audit)
- **(Maret 2026)**: Implementasi awal sistem order dengan relasi table mitra dan produk.
- **(Maret 2026)**: Audit & Perbaikan Status Order. Menghapus status 'Dipickup' dan menstandarisasi alur 'Packing' langsung ke 'Selesai' untuk menjaga integritas constraint database dan kepatuhan terhadap skema internal.
- **(Maret 2026)**: Perbaikan Modul Keuangan. Optimasi logic `tagihan_pending` agar hanya menghitung `orders` berstatus 'Diproses' dan 'Packing'. Implementasi sinkronisasi real-time antara `orderStore` dan `financeStore`.
- **(Maret 2026)**: Penyesuaian logic label status `orders`. Implementasi status virtual **'Dikonfirmasi'**.
- **(Maret 2026)**: Finalisasi Modul Mitra (Plan 5). Implementasi constraint `UNIQUE` pada `nama_mitra`.
- **(Maret 2026)**: Audit & Penyempurnaan Modul Produk & Kategori (Plan 6). Proteksi integritas data dan drill-down.
- **(Maret 2026)**: Implementasi Modul Aktivitas — Audit Trail Terpusat (Plan 7). 
