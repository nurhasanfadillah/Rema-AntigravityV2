-- ==========================================
-- UPDATE: ATURAN PENGHAPUSAN DAN PEMBATALAN PESANAN
-- ==========================================

-- 1. UPDATE: Proteksi Hapus Pesanan (Hanya boleh 'Menunggu Konfirmasi' atau 'Dibatalkan')
CREATE OR REPLACE FUNCTION public.prevent_order_deletion()
RETURNS TRIGGER AS $$
DECLARE
    v_finance_exist INTEGER;
BEGIN
    -- Aturan baru: Hanya boleh hapus jika Menunggu Konfirmasi atau Dibatalkan
    IF OLD.status NOT IN ('Menunggu Konfirmasi', 'Dibatalkan') THEN
        RAISE EXCEPTION 'Pesanan dengan status % tidak dapat dihapus permanen. Aksi ini hanya diperbolehkan untuk status Menunggu Konfirmasi atau Dibatalkan.', OLD.status;
    END IF;

    -- Proteksi tambahan: bersihkan transaksi keuangan yatim jika masih ada
    -- (Terutama untuk status Dibatalkan yang mungkin punya record lama)
    DELETE FROM public.financial_transactions
    WHERE reference_id IN (SELECT id FROM public.order_details WHERE o_pesanan = OLD.no_pesanan);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. NEW: Validasi Transisi ke 'Dibatalkan' (Hanya dari Diproses, Packing, atau Selesai)
CREATE OR REPLACE FUNCTION public.validate_order_status_cancel()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika target status adalah Dibatalkan
    IF NEW.status = 'Dibatalkan' AND OLD.status != 'Dibatalkan' THEN
        -- Cek apakah status sekarang valid untuk dibatalkan
        IF OLD.status NOT IN ('Diproses', 'Packing', 'Selesai') THEN
            RAISE EXCEPTION 'Pesanan dengan status % tidak dapat dibatalkan. Gunakan aksi Hapus untuk pesanan yang masih Menunggu Konfirmasi.', OLD.status;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_order_status_cancel ON public.orders;
CREATE TRIGGER trg_validate_order_status_cancel
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_status_cancel();
