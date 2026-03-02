-- ==========================================
-- PLAN 7: MODUL AKTIVITAS — AUDIT TRAIL TERPUSAT
-- Tabel: activity_logs
-- Deskripsi: Pencatatan seluruh aksi penting dalam aplikasi
-- untuk kebutuhan kontrol internal, transparansi, dan investigasi.
-- ==========================================

-- 1. Tabel: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    user_id VARCHAR(100) NOT NULL DEFAULT 'Administrator',
    user_role VARCHAR(50) NOT NULL DEFAULT 'Admin',
    module VARCHAR(50) NOT NULL,  -- Pesanan, Detail Pesanan, Produk, Kategori, Mitra, Keuangan
    action VARCHAR(30) NOT NULL,  -- CREATE, UPDATE, DELETE, STATUS_CHANGE, CANCEL
    description TEXT NOT NULL,     -- Deskripsi ringkas human-readable
    reference_id VARCHAR(100),     -- ID data terkait (order_id, product_id, dll.)
    old_value JSONB,               -- Nilai sebelum perubahan
    new_value JSONB,               -- Nilai sesudah perubahan
    metadata JSONB                 -- Info tambahan (IP, device, dll.)
);

-- 2. Indexes untuk performa filter & query
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON public.activity_logs (module);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_reference ON public.activity_logs (reference_id);

-- 3. Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Read-only untuk semua (SELECT)
CREATE POLICY "Allow public read activity_logs"
    ON public.activity_logs
    FOR SELECT
    USING (true);

-- Policy: Insert-only (tidak ada UPDATE/DELETE policy = user tidak bisa edit/hapus)
CREATE POLICY "Allow public insert activity_logs"
    ON public.activity_logs
    FOR INSERT
    WITH CHECK (true);

-- CATATAN: Tidak ada policy UPDATE dan DELETE.
-- Ini memastikan data audit trail tidak dapat diubah atau dihapus oleh user biasa.
-- Hanya service_role key atau admin database yang bisa memodifikasi data.
