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

export const useMitraStore = create<MitraState>((set, get) => ({
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

        // Check for duplicate name
        const { data: existing } = await supabase
            .from('mitra')
            .select('id')
            .eq('nama_mitra', mitra.nama_mitra)
            .maybeSingle();

        if (existing) {
            set({ isLoading: false });
            throw new Error(`Mitra dengan nama "${mitra.nama_mitra}" sudah terdaftar.`);
        }

        const { error } = await supabase.from('mitra').insert([mitra]);
        if (!error) {
            await get().fetchMitras();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    updateMitra: async (id, mitraUpdate) => {
        set({ isLoading: true });

        // Check for duplicate name if name is updated (Manual check for UX)
        if (mitraUpdate.nama_mitra) {
            const { data: existing } = await supabase
                .from('mitra')
                .select('id')
                .eq('nama_mitra', mitraUpdate.nama_mitra)
                .neq('id', id)
                .maybeSingle();

            if (existing) {
                set({ isLoading: false });
                throw new Error(`Mitra dengan nama "${mitraUpdate.nama_mitra}" sudah terdaftar.`);
            }
        }

        const { error } = await supabase.from('mitra').update(mitraUpdate).eq('id', id);
        if (!error) {
            await get().fetchMitras();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    },
    deleteMitra: async (id) => {
        set({ isLoading: true });

        // Procedural delete - Database constraint 23503 will catch it,
        // but we keep the manual check for a cleaner error message.
        const { count, error: checkError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('mitra_id', id);

        if (checkError) {
            console.error(checkError);
            set({ isLoading: false });
            throw new Error('Gagal memeriksa data pesanan terkait.');
        }

        if (count && count > 0) {
            set({ isLoading: false });
            throw new Error('Mitra ini tidak dapat dihapus karena masih memiliki riwayat pesanan.');
        }

        const { error } = await supabase.from('mitra').delete().eq('id', id);
        if (!error) {
            await get().fetchMitras();
        } else {
            console.error(error);
            set({ isLoading: false });
            throw error;
        }
        set({ isLoading: false });
    }
}));
