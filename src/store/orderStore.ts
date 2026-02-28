import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { Mitra } from './mitraStore';
import type { Product } from './productStore';

export interface Order {
    no_pesanan: string;
    tanggal: string;
    mitra_id: string; // Mandatory non-nullable
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
    updateOrderStatus: (no_pesanan: string, status: Order['status']) => Promise<void>;
    updateOrderDetailStatus: (order_id: string, detail_id: string, status: OrderDetail['status']) => Promise<void>;
    deleteOrder: (no_pesanan: string) => Promise<void>;
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
    },
    updateOrderStatus: async (no_pesanan, status) => {
        set({ isLoading: true });
        const { error } = await supabase.from('orders').update({ status }).eq('no_pesanan', no_pesanan);
        if (!error) {
            const { data } = await supabase.from('orders').select('*, mitra ( * ), order_details ( *, products ( * ) )').order('created_at', { ascending: false });
            if (data) set({ orders: data as Order[] });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    },
    updateOrderDetailStatus: async (order_id, detail_id, status) => {
        set({ isLoading: true });

        // Logic Data #5: status dorder_details dari 'Menunggu' hanya bisa dikonfirmasi jika status ordernya 'Diproses'
        const { data: currentOrder } = await supabase.from('orders').select('status').eq('no_pesanan', order_id).single();
        const { data: currentDetail } = await supabase.from('order_details').select('status').eq('id', detail_id).single();

        if (currentDetail && currentDetail.status === 'Menunggu' && currentOrder && currentOrder.status !== 'Diproses') {
            set({ isLoading: false });
            throw new Error('Item hanya dapat diproses (dipindahkan dari status Menunggu) jika status Pesanan adalah Diproses.');
        }

        const { error } = await supabase.from('order_details').update({ status }).eq('id', detail_id);
        if (!error) {
            // Logic Data #1: Status orders otomatis menjadi 'Packing' hanya jika SEMUA order_details sudah 'Selesai'
            const { data: orderData } = await supabase.from('orders').select('*, order_details(*)').eq('no_pesanan', order_id).single();
            if (orderData && orderData.order_details) {
                const allDone = orderData.order_details.every((d: any) => d.status === 'Selesai');
                if (allDone && orderData.status !== 'Packing' && orderData.status !== 'Selesai' && orderData.status !== 'Dibatalkan') {
                    await supabase.from('orders').update({ status: 'Packing' }).eq('no_pesanan', order_id);
                }
            }

            const { data } = await supabase.from('orders').select('*, mitra ( * ), order_details ( *, products ( * ) )').order('created_at', { ascending: false });
            if (data) set({ orders: data as Order[] });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    },
    deleteOrder: async (no_pesanan) => {
        set({ isLoading: true });

        // Logic Data #2: Pesanan 'Diproses', 'Packing' dan 'Selesai' hanya bisa ‘Dibatalkan’ tidak bisa dihapus
        const { data: order } = await supabase.from('orders').select('status').eq('no_pesanan', no_pesanan).single();
        if (order && ['Diproses', 'Packing', 'Selesai'].includes(order.status)) {
            set({ isLoading: false });
            throw new Error('Pesanan yang sudah diproses tidak dapat dihapus, hanya bisa dibatalkan.');
        }

        const { error } = await supabase.from('orders').delete().eq('no_pesanan', no_pesanan);
        if (!error) {
            const { data } = await supabase.from('orders').select('*, mitra ( * ), order_details ( *, products ( * ) )').order('created_at', { ascending: false });
            if (data) set({ orders: data as Order[] });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    }
}));
