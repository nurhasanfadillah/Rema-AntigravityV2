-- SCHEMA FOR REMA v2
-- This script corresponds to the data structure in STRUKTUR_DATA.md

-- 1. Tabel: mitra (Data Mitra)
CREATE TABLE IF NOT EXISTS public.mitra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_mitra VARCHAR(255) NOT NULL UNIQUE,
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

-- 6. Tabel: order_audit_trail (Audit Trail Pesanan)
CREATE TABLE IF NOT EXISTS public.order_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_pesanan VARCHAR(50) REFERENCES public.orders(no_pesanan) ON DELETE CASCADE,
    status_lama VARCHAR(50),
    status_baru VARCHAR(50),
    alasan TEXT,
    aksi_oleh VARCHAR(100), -- Nama user atau role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Settings
ALTER TABLE public.mitra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public access" ON public.mitra FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.order_details FOR ALL USING (true);
CREATE POLICY "Allow all public access" ON public.order_audit_trail FOR ALL USING (true);


-- ==========================================
-- TRIGGERS & BUSINESS LOGIC (BACKEND ENFORCEMENT)
-- ==========================================

-- A. Otomatisasi status 'Packing' saat semua item 'Selesai'
CREATE OR REPLACE FUNCTION public.check_all_items_done()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.order_details WHERE o_pesanan = NEW.o_pesanan AND status != 'Selesai') = 0 THEN
        UPDATE public.orders 
        SET status = 'Packing' 
        WHERE no_pesanan = NEW.o_pesanan AND status NOT IN ('Packing', 'Selesai', 'Dibatalkan');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_items_done
AFTER UPDATE OF status ON public.order_details
FOR EACH ROW
WHEN (NEW.status = 'Selesai')
EXECUTE FUNCTION public.check_all_items_done();


-- B. Proteksi Hapus Pesanan (Hanya boleh 'Menunggu Konfirmasi' atau 'Dibatalkan')
CREATE OR REPLACE FUNCTION public.prevent_order_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status NOT IN ('Menunggu Konfirmasi', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Pesanan dengan status % tidak dapat dihapus, gunakan opsi Dibatalkan.', OLD.status;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_order_delete
BEFORE DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_order_deletion();


-- B2. Validasi Transisi Status Pesanan (Single Source of Truth)
CREATE OR REPLACE FUNCTION public.unified_validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN RETURN NEW; END IF;
    IF OLD.status = 'Menunggu Konfirmasi' AND NEW.status NOT IN ('Diproses', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Menunggu Konfirmasi -> Diproses/Dibatalkan.';
    END IF;
    IF OLD.status = 'Diproses' AND NEW.status NOT IN ('Packing', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Diproses -> Packing/Dibatalkan.';
    END IF;
    IF OLD.status = 'Packing' AND NEW.status NOT IN ('Selesai', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Packing -> Selesai/Dibatalkan.';
    END IF;
    IF OLD.status = 'Selesai' AND NEW.status NOT IN ('Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Selesai -> Dibatalkan.';
    END IF;
    IF OLD.status = 'Dibatalkan' THEN
        RAISE EXCEPTION 'Transisi tidak valid: Dibatalkan tidak dapat diubah.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_unified_validate_order_status
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.unified_validate_order_status_transition();


-- C. Validasi Transisi Detail Pesanan (Hanya bisa dari Menunggu jika Order Diproses)
CREATE OR REPLACE FUNCTION public.validate_detail_transition()
RETURNS TRIGGER AS $$
DECLARE
    v_order_status VARCHAR(50);
BEGIN
    SELECT status INTO v_order_status FROM public.orders WHERE no_pesanan = NEW.o_pesanan;
    
    IF (OLD.status = 'Menunggu' AND NEW.status != 'Menunggu' AND v_order_status != 'Diproses') THEN
        RAISE EXCEPTION 'Item hanya dapat diproses (dipindahkan dari status Menunggu) jika status Pesanan adalah Diproses.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_detail_status
BEFORE UPDATE OF status ON public.order_details
FOR EACH ROW
EXECUTE FUNCTION public.validate_detail_transition();


-- ==========================================
-- STORAGE CONFIGURATION (Supabase Storage)
-- ==========================================

-- 1. Pastikan bucket 'products' ada
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Kebijakan RLS untuk storage.objects
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

CREATE POLICY "Allow public upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public view" ON storage.objects 
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow public update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'products');

CREATE POLICY "Allow public delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'products');
