import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { Mitra } from './mitraStore';
import type { Product } from './productStore';

export interface Order {
    no_pesanan: string;
    tanggal: string;
    mitra_id: string | null;
    sumber_pesanan: 'Online' | 'Offline';
    file_resi: string | null;
    nama_penerima: string | null;
    kontak_penerima: string | null;
    alamat_penerima: string | null;
    status: 'Menunggu Konfirmasi' | 'Diproses' | 'Packing' | 'Selesai' | 'Dibatalkan';
    mitra?: Mitra | null;
    order_details?: OrderDetail[];
}

export interface OrderDetail {
    id: string;
    o_pesanan: string;
    product_id: string;
    harga_satuan: number;
    qty: number;
    deskripsi_desain: string | null;
    design_file: string[] | null;
    status: 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';
    products?: Product | null;
}

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
    addOrder: (order: Omit<Order, 'order_details' | 'mitra'>, items: Omit<OrderDetail, 'id' | 'o_pesanan' | 'products' | 'status'>[]) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    isLoading: false,
    fetchOrders: async () => {
        set({ isLoading: true });
        // Fetch orders with nested mitra and order_details (and nested products inside details)
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        mitra ( * ),
        order_details ( *, products ( * ) )
      `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            set({ orders: data as Order[], isLoading: false });
        } else {
            set({ isLoading: false });
            console.error(error);
        }
    },

    addOrder: async (order, items) => {
        set({ isLoading: true });

        try {
            // 1. Insert Header
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([order])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert Details
            if (orderData && items.length > 0) {
                const detailsToInsert = items.map(item => ({
                    ...item,
                    o_pesanan: orderData.no_pesanan,
                    status: 'Menunggu'
                }));

                const { error: detailError } = await supabase
                    .from('order_details')
                    .insert(detailsToInsert);

                if (detailError) throw detailError;
            }

            // Re-fetch
            const { data } = await supabase
                .from('orders')
                .select(`*, mitra ( * ), order_details ( *, products ( * ) )`)
                .order('created_at', { ascending: false });

            if (data) set({ orders: data as Order[] });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
