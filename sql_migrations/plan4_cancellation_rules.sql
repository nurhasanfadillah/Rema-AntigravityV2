-- ==========================================
-- PLAN 4: ATURAN BACKEND PEMBATALAN, PENGHAPUSAN DAN PROTEKSI EDIT PESANAN
-- ==========================================

-- 1. VIEW UPDATE: Abaikan pesanan Dibatalkan dari estimasi_tagihan di finance_summary
DROP VIEW IF EXISTS public.finance_summary CASCADE;
CREATE OR REPLACE VIEW public.finance_summary AS
SELECT
    m.id            AS mitra_id,
    m.nama_mitra    AS nama_mitra,
    COALESCE(SUM(ft.masuk), 0)                                      AS total_masuk,
    COALESCE(SUM(ft.keluar), 0)                                     AS total_keluar,
    COALESCE(SUM(ft.masuk), 0) - COALESCE(SUM(ft.keluar), 0)       AS saldo,
    (
        SELECT COALESCE(SUM(od.harga_satuan * od.qty), 0)
        FROM public.orders o
        JOIN public.order_details od ON o.no_pesanan = od.o_pesanan
        WHERE o.mitra_id = m.id
          AND od.status IN ('Menunggu', 'Cetak DTF', 'Sablon')
          AND o.status != 'Dibatalkan'
    )                                                               AS estimasi_tagihan
FROM public.mitra m
LEFT JOIN public.financial_transactions ft ON m.id = ft.mitra_id
GROUP BY m.id, m.nama_mitra
ORDER BY m.nama_mitra;

-- 2. TRIGGER: Hapus transaksi keuangan otomatis jika pesanan dibatalkan
CREATE OR REPLACE FUNCTION public.cancel_order_finance()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'Dibatalkan' AND NEW.status = 'Dibatalkan' THEN
        -- Batalkan transaksi keuangan (kas masuk) jika pesanan diubah ke Dibatalkan
        DELETE FROM public.financial_transactions
        WHERE reference_id IN (SELECT id FROM public.order_details WHERE o_pesanan = NEW.no_pesanan);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cancel_order_finance ON public.orders;
CREATE TRIGGER trg_cancel_order_finance
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.cancel_order_finance();

-- 3. TRIGGER: Modifikasi proteksi Delete Orders (hanya boleh Dibatalkan)
CREATE OR REPLACE FUNCTION public.prevent_order_deletion()
RETURNS TRIGGER AS $$
DECLARE
    v_finance_exist INTEGER;
BEGIN
    IF OLD.status != 'Dibatalkan' THEN
        RAISE EXCEPTION 'Pesanan dengan status % tidak dapat dihapus permanen. Ubah status ke Dibatalkan terlebih dahulu.', OLD.status;
    END IF;

    -- Proteksi tambahan: bersihkan transaksi keuangan yatim jika masih ada
    SELECT COUNT(*) INTO v_finance_exist FROM public.financial_transactions 
    WHERE reference_id IN (SELECT id FROM public.order_details WHERE o_pesanan = OLD.no_pesanan);

    IF v_finance_exist > 0 THEN
        DELETE FROM public.financial_transactions
        WHERE reference_id IN (SELECT id FROM public.order_details WHERE o_pesanan = OLD.no_pesanan);
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- note: trigger is already attached by schema.sql, but we replace the function logic

-- 4. TRIGGER: Proteksi Edit Data Pesanan (setelah Menunggu Konfirmasi, field sensitif terkunci)
CREATE OR REPLACE FUNCTION public.prevent_order_edit_after_menunggu()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'Menunggu Konfirmasi' THEN
        -- Mencegah perubahan field sensitif jika bukan lagi Menunggu Konfirmasi
        -- Diperbolehkan mengubah status, atau resi
        IF OLD.tanggal IS DISTINCT FROM NEW.tanggal OR
           OLD.mitra_id IS DISTINCT FROM NEW.mitra_id OR
           OLD.sumber_pesanan IS DISTINCT FROM NEW.sumber_pesanan OR
           OLD.nama_penerima IS DISTINCT FROM NEW.nama_penerima OR
           OLD.kontak_penerima IS DISTINCT FROM NEW.kontak_penerima OR
           OLD.alamat_penerima IS DISTINCT FROM NEW.alamat_penerima THEN
            RAISE EXCEPTION 'Data pesanan (tanggal, mitra, dsb) terkunci dan tidak dapat diubah setelah pesanan diproses.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_order_edit_after_menunggu ON public.orders;
CREATE TRIGGER trg_prevent_order_edit_after_menunggu
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_order_edit_after_menunggu();


-- 5. TRIGGER: Proteksi Edit Detail Pesanan (setelah Menunggu Konfirmasi, produk/qty/harga terkunci)
CREATE OR REPLACE FUNCTION public.prevent_order_detail_edit_after_menunggu()
RETURNS TRIGGER AS $$
DECLARE
    v_order_status VARCHAR(50);
BEGIN
    -- Ambil status pesanan terkait
    SELECT status INTO v_order_status FROM public.orders WHERE no_pesanan = OLD.o_pesanan;
    
    IF v_order_status != 'Menunggu Konfirmasi' THEN
        -- Proteksi untuk memastikan field finansial tidak berubah
        IF OLD.product_id IS DISTINCT FROM NEW.product_id OR
           OLD.harga_satuan IS DISTINCT FROM NEW.harga_satuan OR
           OLD.qty IS DISTINCT FROM NEW.qty OR
           OLD.deskripsi_desain IS DISTINCT FROM NEW.deskripsi_desain THEN
            RAISE EXCEPTION 'Data item pesanan (produk, harga, qty, deskripsi) terkunci dan tidak dapat diubah setelah pesanan diproses.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_order_detail_edit_after_menunggu ON public.order_details;
CREATE TRIGGER trg_prevent_order_detail_edit_after_menunggu
BEFORE UPDATE ON public.order_details
FOR EACH ROW
EXECUTE FUNCTION public.prevent_order_detail_edit_after_menunggu();
