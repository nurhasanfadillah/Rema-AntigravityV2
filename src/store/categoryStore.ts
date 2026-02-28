import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export interface Category {
    id: string;
    nama_kategori: string;
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    isLoading: false,
    fetchCategories: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
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
            const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
            if (data) set({ categories: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    }
}));
