import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export interface ProduksiItem {
    id: string;
    o_pesanan: string;
    product_id: string;
    qty: number;
    deskripsi_desain: string | null;
    design_file: string[] | null;
    status: 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';
    created_at: string;
    products: {
        id: string;
        nama_produk: string;
    } | null;
    orders: {
        no_pesanan: string;
        status: string;
        tanggal: string;
        sumber_pesanan: 'Online' | 'Offline';
        file_resi: string | null;
        nama_penerima: string | null;
        kontak_penerima: string | null;
        alamat_penerima: string | null;
        mitra: {
            id: string;
            nama_mitra: string;
        } | null;
    } | null;
}

interface ProduksiState {
    items: ProduksiItem[];
    isLoading: boolean;
    fetchProduksi: () => Promise<void>;
}

export const useProduksiStore = create<ProduksiState>((set) => ({
    items: [],
    isLoading: false,
    fetchProduksi: async () => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('order_details')
                .select(`
                    id,
                    o_pesanan,
                    product_id,
                    qty,
                    deskripsi_desain,
                    design_file,
                    status,
                    created_at,
                    products ( id, nama_produk ),
                    orders!inner ( 
                        no_pesanan, 
                        status, 
                        tanggal,
                        sumber_pesanan,
                        file_resi,
                        nama_penerima,
                        kontak_penerima,
                        alamat_penerima,
                        mitra ( id, nama_mitra ) 
                    )
                `)
                .in('orders.status', ['Diproses', 'Packing'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ items: data as unknown as ProduksiItem[], isLoading: false });
        } catch (error) {
            console.error('Error fetching produksi:', error);
            set({ isLoading: false });
        }
    }
}));
