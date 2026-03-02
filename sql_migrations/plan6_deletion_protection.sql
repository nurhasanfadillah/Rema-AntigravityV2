-- ==========================================
-- PLAN 6: Deletion Protection Triggers
-- ==========================================
-- Trigger untuk mencegah penghapusan kategori yang masih memiliki produk
-- dan produk yang masih memiliki order_details.

-- A. Proteksi Hapus Kategori (jika masih punya Produk)
CREATE OR REPLACE FUNCTION public.prevent_category_deletion()
RETURNS TRIGGER AS $$
DECLARE
    v_product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_product_count
    FROM public.products
    WHERE category_id = OLD.id;

    IF v_product_count > 0 THEN
        RAISE EXCEPTION 'Kategori "%" tidak dapat dihapus karena masih memiliki % produk terkait. Pindahkan atau hapus produk terlebih dahulu.', OLD.nama_kategori, v_product_count;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_category_delete ON public.categories;
CREATE TRIGGER trg_prevent_category_delete
BEFORE DELETE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.prevent_category_deletion();


-- B. Proteksi Hapus Produk (jika masih punya Order Details)
CREATE OR REPLACE FUNCTION public.prevent_product_deletion()
RETURNS TRIGGER AS $$
DECLARE
    v_order_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_order_count
    FROM public.order_details
    WHERE product_id = OLD.id;

    IF v_order_count > 0 THEN
        RAISE EXCEPTION 'Produk "%" tidak dapat dihapus karena masih terdapat pada % pesanan. Selesaikan atau batalkan pesanan terkait terlebih dahulu.', OLD.nama_produk, v_order_count;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_product_delete ON public.products;
CREATE TRIGGER trg_prevent_product_delete
BEFORE DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.prevent_product_deletion();
