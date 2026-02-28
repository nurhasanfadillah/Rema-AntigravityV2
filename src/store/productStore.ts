import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export interface Product {
    id: string;
    category_id: string | null;
    nama_produk: string;
    deskripsi: string;
    harga_default: number;
    status: 'Aktif' | 'Tidak Aktif';
    foto_produk: string | null;
    categories?: { nama_kategori: string };
}

interface ProductState {
    products: Product[];
    isLoading: boolean;
    fetchProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id' | 'categories'>) => Promise<void>;
    updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'categories'>>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    fetchProducts: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase.from('products').select('*, categories(nama_kategori)').order('created_at', { ascending: false });
        if (!error && data) {
            set({ products: data, isLoading: false });
        } else {
            set({ isLoading: false });
            console.error(error);
        }
    },
    addProduct: async (product) => {
        set({ isLoading: true });
        const { error } = await supabase.from('products').insert([product]);
        if (!error) {
            const { data } = await supabase.from('products').select('*, categories(nama_kategori)').order('created_at', { ascending: false });
            if (data) set({ products: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    },
    updateProduct: async (id, productUpdate) => {
        set({ isLoading: true });
        const { error } = await supabase.from('products').update(productUpdate).eq('id', id);
        if (!error) {
            const { data } = await supabase.from('products').select('*, categories(nama_kategori)').order('created_at', { ascending: false });
            if (data) set({ products: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    },
    deleteProduct: async (id) => {
        set({ isLoading: true });
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            const { data } = await supabase.from('products').select('*, categories(nama_kategori)').order('created_at', { ascending: false });
            if (data) set({ products: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    }
}));
