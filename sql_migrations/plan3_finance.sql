-- ==========================================
-- PLAN 3: SISTEM KEUANGAN & TRANSAKSI
-- Jalankan seluruh script ini di SQL Editor Supabase
-- ==========================================


-- 1. TABEL: financial_transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id_transaksi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    mitra_id UUID REFERENCES public.mitra(id) ON DELETE SET NULL,
    deskripsi TEXT NOT NULL,
    masuk DECIMAL(15, 2) NOT NULL DEFAULT 0,
    keluar DECIMAL(15, 2) NOT NULL DEFAULT 0,
    -- reference_id diisi dengan id order_details saat auto-insert dari trigger
    -- UNIQUE constraint mencegah duplikasi pencatatan kas masuk
    reference_id UUID UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa query per mitra
CREATE INDEX IF NOT EXISTS idx_fin_tx_mitra_id ON public.financial_transactions(mitra_id);
CREATE INDEX IF NOT EXISTS idx_fin_tx_tanggal ON public.financial_transactions(tanggal DESC);

-- RLS untuk tabel baru
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
-- Drop jika sudah ada (idempoten)
DROP POLICY IF EXISTS "Allow all public access" ON public.financial_transactions;
CREATE POLICY "Allow all public access" ON public.financial_transactions FOR ALL USING (true);


-- 2. TRIGGER: Auto-catat Kas Masuk saat item order menjadi 'Selesai'
CREATE OR REPLACE FUNCTION public.auto_insert_finance_on_selesai()
RETURNS TRIGGER AS $$
DECLARE
    v_mitra_id UUID;
    v_nama_produk VARCHAR(255);
BEGIN
    -- Guard: hanya jika transisi tepat ke 'Selesai'
    IF (OLD.status IS DISTINCT FROM 'Selesai' AND NEW.status = 'Selesai') THEN
        -- Ambil mitra_id dari orders
        SELECT mitra_id INTO v_mitra_id
        FROM public.orders
        WHERE no_pesanan = NEW.o_pesanan;

        -- Ambil nama produk
        SELECT nama_produk INTO v_nama_produk
        FROM public.products
        WHERE id = NEW.product_id;

        -- Insert transaksi masuk — ON CONFLICT mencegah duplikasi
        INSERT INTO public.financial_transactions
            (tanggal, mitra_id, deskripsi, masuk, keluar, reference_id)
        VALUES (
            CURRENT_DATE,
            v_mitra_id,
            'Pesanan ' || NEW.o_pesanan || ' — ' || COALESCE(v_nama_produk, 'Item Produksi'),
            ROUND((NEW.harga_satuan * NEW.qty)::NUMERIC, 2),
            0,
            NEW.id
        )
        ON CONFLICT (reference_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_finance_masuk ON public.order_details;
CREATE TRIGGER trg_auto_finance_masuk
    AFTER UPDATE OF status ON public.order_details
    FOR EACH ROW
    WHEN (NEW.status = 'Selesai' AND OLD.status <> 'Selesai')
    EXECUTE FUNCTION public.auto_insert_finance_on_selesai();


-- 3. VIEW: finance_summary
-- Menggunakan View real-time: kalkulasi selalu akurat, tidak ada stale data.
-- nama_mitra disertakan langsung untuk menghindari masalah PostgREST FK join pada View.
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
    )                                                               AS estimasi_tagihan
FROM public.mitra m
LEFT JOIN public.financial_transactions ft ON m.id = ft.mitra_id
GROUP BY m.id, m.nama_mitra
ORDER BY m.nama_mitra;
