import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export interface Category {
    id: string;
    nama_kategori: string;
    products?: { id: string }[];
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    categoryProducts: Record<string, any[]>; // keyed by category_id
    fetchCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, 'id' | 'products'>) => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    fetchProductsByCategory: (categoryId: string) => Promise<any[]>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    categoryProducts: {},
    fetchCategories: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('categories')
            .select('*, products(id)')
            .order('created_at', { ascending: false });
        if (!error && data) {
            set({ categories: data, isLoading: false });
        } else {
            set({ isLoading: false });
            console.error(error);
        }
    },
    addCategory: async (category) => {
        set({ isLoading: true });
        const { error } = await supabase.from('categories').insert([category]);
        if (!error) {
            await get().fetchCategories();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    updateCategory: async (id, categoryUpdate) => {
        set({ isLoading: true });
        const { error } = await supabase.from('categories').update(categoryUpdate).eq('id', id);
        if (!error) {
            await get().fetchCategories();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    deleteCategory: async (id) => {
        set({ isLoading: true });

        // Pre-delete check: count products using this category
        const { count, error: checkError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id);

        if (checkError) {
            console.error(checkError);
            set({ isLoading: false });
            throw new Error('Gagal memeriksa data produk terkait.');
        }

        if (count && count > 0) {
            set({ isLoading: false });
            throw new Error(`Kategori ini tidak dapat dihapus karena masih memiliki ${count} produk terkait. Pindahkan atau hapus produk terlebih dahulu.`);
        }

        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) {
            await get().fetchCategories();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    fetchProductsByCategory: async (categoryId: string) => {
        const { data, error } = await supabase
            .from('products')
            .select('id, nama_produk, harga_default, status, foto_produk')
            .eq('category_id', categoryId)
            .order('nama_produk', { ascending: true });

        if (!error && data) {
            set((state) => ({
                categoryProducts: { ...state.categoryProducts, [categoryId]: data }
            }));
            return data;
        } else {
            console.error(error);
            return [];
        }
    }
}));
