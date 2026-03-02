-- ==========================================
-- PLAN 6: REFINEMENT LOGIC KEUANGAN & AUDIT STATUS
-- Jalankan script ini untuk memperbaiki constraint, view keuangan, dan validasi transisi
-- ==========================================

-- 1. AUDIT & FIX STATUS CONSTRAINT
-- Memastikan hanya status resmi yang diizinkan
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('Menunggu Konfirmasi', 'Diproses', 'Packing', 'Selesai', 'Dibatalkan'));

-- 2. TRIGGER: Validasi Transisi Status Pesanan (Eksplisit di Backend)
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika status tidak berubah, skip
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Aturan Transisi Resmi
    -- Menunggu Konfirmasi -> Diproses OR Dibatalkan
    IF OLD.status = 'Menunggu Konfirmasi' AND NEW.status NOT IN ('Diproses', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Menunggu Konfirmasi hanya bisa ke Diproses atau Dibatalkan.';
    END IF;

    -- Diproses -> Packing OR Dibatalkan
    IF OLD.status = 'Diproses' AND NEW.status NOT IN ('Packing', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Diproses hanya bisa ke Packing atau Dibatalkan.';
    END IF;

    -- Packing -> Selesai OR Dibatalkan
    IF OLD.status = 'Packing' AND NEW.status NOT IN ('Selesai', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Packing hanya bisa ke Selesai atau Dibatalkan.';
    END IF;

    -- Selesai -> No further transition
    IF OLD.status = 'Selesai' THEN
        RAISE EXCEPTION 'Transisi tidak valid: Pesanan yang sudah Selesai tidak dapat diubah lagi.';
    END IF;

    -- Dibatalkan -> No further transition
    IF OLD.status = 'Dibatalkan' THEN
        RAISE EXCEPTION 'Transisi tidak valid: Pesanan yang sudah Dibatalkan tidak dapat diaktifkan kembali.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_order_status ON public.orders;
CREATE TRIGGER trg_validate_order_status
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_status_transition();

-- 3. UPDATE VIEW finance_summary
-- Mengubah 'estimasi_tagihan' menjadi 'tagihan_pending'
-- Hanya menghitung item (order_details) yang BELUM 'Selesai'
-- Dan induk orders-nya berstatus 'Diproses' atau 'Packing'
DROP VIEW IF EXISTS public.finance_summary CASCADE;
CREATE OR REPLACE VIEW public.finance_summary AS
SELECT
    m.id            AS mitra_id,
    m.nama_mitra    AS nama_mitra,
    COALESCE(SUM(ft.masuk), 0)                                      AS total_masuk,
    COALESCE(SUM(ft.keluar), 0)                                     AS total_keluar,
    COALESCE(SUM(ft.masuk), 0) - COALESCE(SUM(ft.keluar), 0)        AS saldo,
    (
        SELECT COALESCE(SUM(od.harga_satuan * od.qty), 0)
        FROM public.orders o
        JOIN public.order_details od ON o.no_pesanan = od.o_pesanan
        WHERE o.mitra_id = m.id
          AND o.status IN ('Diproses', 'Packing')
          AND od.status NOT IN ('Selesai')
          AND o.status != 'Dibatalkan'
    )                                                               AS tagihan_pending
FROM public.mitra m
LEFT JOIN public.financial_transactions ft ON m.id = ft.mitra_id
GROUP BY m.id, m.nama_mitra
ORDER BY m.nama_mitra;
