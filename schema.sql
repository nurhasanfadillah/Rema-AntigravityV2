-- SCHEMA FOR REMA v2
-- This script corresponds to the data structure in STRUKTUR_DATA.md

-- 1. Tabel: mitra (Data Mitra)
CREATE TABLE IF NOT EXISTS public.mitra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_mitra VARCHAR(255) NOT NULL,
    kontak VARCHAR(50),
    alamat TEXT,
    status VARCHAR(20) CHECK (status IN ('Aktif', 'Tidak Aktif')) DEFAULT 'Aktif',
    limit_tagihan DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel: categories (Kategori Produk)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kategori VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel: products (Data Produk)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    nama_produk VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga_default DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('Aktif', 'Tidak Aktif')) DEFAULT 'Aktif',
    foto_produk TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel: orders (Data Pesanan)
CREATE TABLE IF NOT EXISTS public.orders (
    no_pesanan VARCHAR(50) PRIMARY KEY, -- Format: RBM-XXXX
    tanggal DATE NOT NULL,
    mitra_id UUID REFERENCES public.mitra(id) ON DELETE RESTRICT,
    sumber_pesanan VARCHAR(20) CHECK (sumber_pesanan IN ('Online', 'Offline')) NOT NULL,
    file_resi TEXT,
    nama_penerima VARCHAR(255),
    kontak_penerima VARCHAR(50),
    alamat_penerima TEXT,
    status VARCHAR(50) CHECK (status IN ('Menunggu Konfirmasi', 'Diproses', 'Packing', 'Selesai', 'Dibatalkan')) DEFAULT 'Menunggu Konfirmasi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel: order_details (Data Detail Pesanan)
CREATE TABLE IF NOT EXISTS public.order_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    o_pesanan VARCHAR(50) REFERENCES public.orders(no_pesanan) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    harga_satuan DECIMAL(15, 2) NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    deskripsi_desain TEXT,
    design_file JSONB, -- multiple URL file format (array of strings)
    status VARCHAR(50) CHECK (status IN ('Menunggu', 'Cetak DTF', 'Sablon', 'Selesai')) DEFAULT 'Menunggu',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Settings
-- Enable RLS logic for anonymous usage if needed, or disable since it's a private operational app.
-- For simple setup in a private corp app, we might allow all if relying on app layer, or set proper auth.
-- Here we enable an open policy for the sake of the demo, but usually you'd tie it to users.
ALTER TABLE public.mitra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public access" ON public.mitra FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.order_details FOR ALL USING (true);

-- ==========================================
-- STORAGE CONFIGURATION (Supabase Storage)
-- ==========================================

-- 1. Pastikan bucket 'products' ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Kebijakan RLS untuk storage.objects
-- Karena storage.objects adalah tabel internal Supabase, kita buat policy berdasarkan bucket_id

-- Hapus policy lama jika ada untuk menghindari konflik
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Policy untuk mengizinkan upload (INSERT)
CREATE POLICY "Allow public upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

-- Policy untuk mengizinkan melihat file (SELECT)
CREATE POLICY "Allow public view" ON storage.objects 
FOR SELECT USING (bucket_id = 'products');

-- Policy untuk mengizinkan update file (UPDATE)
CREATE POLICY "Allow public update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'products');

-- Policy untuk mengizinkan hapus file (DELETE)
CREATE POLICY "Allow public delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'products');

