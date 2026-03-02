import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { logActivity } from '../utils/activityLogger';

export interface Product {
    id: string;
    category_id: string | null;
    nama_produk: string;
    deskripsi: string;
    harga_default: number;
    status: 'Aktif' | 'Tidak Aktif';
    foto_produk: string | null;
    categories?: { nama_kategori: string };
    active_order_qty?: number;
}

interface ProductState {
    products: Product[];
    isLoading: boolean;
    activeOrderQtyMap: Record<string, number>; // keyed by product_id
    fetchProducts: () => Promise<void>;
    fetchActiveOrderQty: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id' | 'categories' | 'active_order_qty'>) => Promise<void>;
    updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'categories' | 'active_order_qty'>>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isLoading: false,
    activeOrderQtyMap: {},
    fetchProducts: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(nama_kategori)')
            .order('created_at', { ascending: false });
        if (!error && data) {
            set({ products: data, isLoading: false });
            // Also fetch active order qty stats
            get().fetchActiveOrderQty();
        } else {
            set({ isLoading: false });
            console.error(error);
        }
    },
    fetchActiveOrderQty: async () => {
        // Query: SUM(qty) dari order_details JOIN orders WHERE orders.status = 'Diproses', grouped by product_id
        const { data, error } = await supabase
            .from('order_details')
            .select('product_id, qty, orders!inner(status)')
            .eq('orders.status', 'Diproses');

        if (!error && data) {
            const qtyMap: Record<string, number> = {};
            for (const item of data) {
                const pid = item.product_id;
                qtyMap[pid] = (qtyMap[pid] || 0) + item.qty;
            }
            set({ activeOrderQtyMap: qtyMap });
        } else {
            console.error('Failed to fetch active order qty:', error);
        }
    },
    addProduct: async (product) => {
        set({ isLoading: true });
        const { data: inserted, error } = await supabase.from('products').insert([product]).select('id').single();
        if (!error && inserted) {
            logActivity({
                module: 'Produk',
                action: 'CREATE',
                description: `Menambahkan produk baru: ${product.nama_produk}`,
                referenceId: inserted.id,
                newValue: { nama_produk: product.nama_produk, harga_default: product.harga_default, status: product.status },
            });
            await get().fetchProducts();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    updateProduct: async (id, productUpdate) => {
        set({ isLoading: true });
        const oldProd = get().products.find(p => p.id === id);
        const { error } = await supabase.from('products').update(productUpdate).eq('id', id);
        if (!error) {
            logActivity({
                module: 'Produk',
                action: 'UPDATE',
                description: `Memperbarui produk: ${oldProd?.nama_produk || id}`,
                referenceId: id,
                oldValue: oldProd ? { nama_produk: oldProd.nama_produk, harga_default: oldProd.harga_default, status: oldProd.status } : null,
                newValue: productUpdate,
            });
            await get().fetchProducts();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    deleteProduct: async (id) => {
        set({ isLoading: true });

        // Pre-delete check: count order_details using this product
        const { count, error: checkError } = await supabase
            .from('order_details')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', id);

        if (checkError) {
            console.error(checkError);
            set({ isLoading: false });
            throw new Error('Gagal memeriksa data pesanan terkait.');
        }

        if (count && count > 0) {
            set({ isLoading: false });
            throw new Error(`Produk ini tidak dapat dihapus karena masih terdapat pada ${count} item pesanan. Selesaikan atau batalkan pesanan terkait terlebih dahulu.`);
        }

        const oldProd = get().products.find(p => p.id === id);
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            logActivity({
                module: 'Produk',
                action: 'DELETE',
                description: `Menghapus produk: ${oldProd?.nama_produk || id}`,
                referenceId: id,
                oldValue: oldProd ? { nama_produk: oldProd.nama_produk, harga_default: oldProd.harga_default } : null,
            });
            await get().fetchProducts();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    }
}));
