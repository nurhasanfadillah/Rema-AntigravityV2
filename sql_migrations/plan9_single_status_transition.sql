-- ==========================================
-- PLAN 9: SINGLE SOURCE OF TRUTH FOR ORDER STATUS TRANSITION
-- ==========================================

-- 1. DROP CONFLICTING TRIGGERS
-- We first remove the two triggers that were causing conflicts:
-- trg_validate_order_status (from plan6) vs trg_validate_order_status_cancel (from plan8)
DROP TRIGGER IF EXISTS trg_validate_order_status ON public.orders;
DROP FUNCTION IF EXISTS public.validate_order_status_transition();

DROP TRIGGER IF EXISTS trg_validate_order_status_cancel ON public.orders;
DROP FUNCTION IF EXISTS public.validate_order_status_cancel();


-- 2. CREATE A UNIFIED TRIGGER FOR STATUS TRANSITION
CREATE OR REPLACE FUNCTION public.unified_validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika status tidak berubah, lompati validasi
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Aturan Transisi Resmi (Single Source of Truth)
    -- Menunggu Konfirmasi -> Diproses ATAU Dibatalkan
    IF OLD.status = 'Menunggu Konfirmasi' AND NEW.status NOT IN ('Diproses', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: "Menunggu Konfirmasi" hanya bisa diubah ke "Diproses" atau "Dibatalkan".';
    END IF;

    -- Diproses -> Packing ATAU Dibatalkan
    IF OLD.status = 'Diproses' AND NEW.status NOT IN ('Packing', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: "Diproses" hanya bisa diubah ke "Packing" atau "Dibatalkan".';
    END IF;

    -- Packing -> Selesai ATAU Dibatalkan
    IF OLD.status = 'Packing' AND NEW.status NOT IN ('Selesai', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: "Packing" hanya bisa diubah ke "Selesai" atau "Dibatalkan".';
    END IF;

    -- Selesai -> Dibatalkan (PERUBAHAN UTAMA: Memperbolehkan pembatalan meskipun pesanan sudah selesai)
    IF OLD.status = 'Selesai' AND NEW.status NOT IN ('Dibatalkan') THEN
        RAISE EXCEPTION 'Transisi tidak valid: Pesanan yang sudah "Selesai" tidak dapat diubah ke status lain kecuali "Dibatalkan".';
    END IF;

    -- Dibatalkan -> Tidak ada transisi lanjutan
    IF OLD.status = 'Dibatalkan' THEN
        RAISE EXCEPTION 'Transisi tidak valid: Pesanan yang sudah "Dibatalkan" tidak dapat diaktifkan kembali atau diubah statusnya.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ATTACH THE NEW UNIFIED TRIGGER
DROP TRIGGER IF EXISTS trg_unified_validate_order_status ON public.orders;
CREATE TRIGGER trg_unified_validate_order_status
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.unified_validate_order_status_transition();
