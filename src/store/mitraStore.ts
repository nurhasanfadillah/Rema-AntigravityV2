import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export interface Mitra {
    id: string;
    nama_mitra: string;
    kontak: string;
    alamat: string;
    status: 'Aktif' | 'Tidak Aktif';
    limit_tagihan: number;
}

interface MitraState {
    mitras: Mitra[];
    isLoading: boolean;
    fetchMitras: () => Promise<void>;
    addMitra: (mitra: Omit<Mitra, 'id'>) => Promise<void>;
    updateMitra: (id: string, mitra: Partial<Mitra>) => Promise<void>;
    deleteMitra: (id: string) => Promise<void>;
}

export const useMitraStore = create<MitraState>((set) => ({
    mitras: [],
    isLoading: false,
    fetchMitras: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase.from('mitra').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            set({ mitras: data, isLoading: false });
        } else {
            set({ isLoading: false });
            console.error(error);
        }
    },
    addMitra: async (mitra) => {
        set({ isLoading: true });
        const { error } = await supabase.from('mitra').insert([mitra]);
        if (!error) {
            // Re-fetch
            const { data } = await supabase.from('mitra').select('*').order('created_at', { ascending: false });
            if (data) set({ mitras: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    },
    updateMitra: async (id, mitraUpdate) => {
        set({ isLoading: true });
        const { error } = await supabase.from('mitra').update(mitraUpdate).eq('id', id);
        if (!error) {
            const { data } = await supabase.from('mitra').select('*').order('created_at', { ascending: false });
            if (data) set({ mitras: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    },
    deleteMitra: async (id) => {
        set({ isLoading: true });
        const { error } = await supabase.from('mitra').delete().eq('id', id);
        if (!error) {
            const { data } = await supabase.from('mitra').select('*').order('created_at', { ascending: false });
            if (data) set({ mitras: data });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    }
}));
