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

export interface ProduksiFilters {
    startDate?: string;
    endDate?: string;
    mitraId?: string;
    productId?: string;
    statusDetail?: string;
    sortBy?: 'Baru ke Lama' | 'Lama ke Baru';
}

interface ProduksiState {
    items: ProduksiItem[];
    totalItems: number;
    totalFilteredQty: number;
    isLoading: boolean;
    fetchProduksi: (page?: number, limit?: number, filters?: ProduksiFilters) => Promise<void>;
}

export const useProduksiStore = create<ProduksiState>((set) => ({
    items: [],
    totalItems: 0,
    totalFilteredQty: 0,
    isLoading: false,
    fetchProduksi: async (page = 1, limit = 10, filters = {}) => {
        set({ isLoading: true });
        try {
            let query = supabase
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
                        mitra_id,
                        mitra ( id, nama_mitra ) 
                    )
                `, { count: 'exact' })
                .in('orders.status', ['Diproses', 'Packing']);

            if (filters.statusDetail && filters.statusDetail !== 'Semua') {
                query = query.eq('status', filters.statusDetail);
            }
            if (filters.productId) {
                query = query.eq('product_id', filters.productId);
            }
            if (filters.startDate) {
                query = query.gte('orders.tanggal', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('orders.tanggal', filters.endDate);
            }
            if (filters.mitraId) {
                query = query.eq('orders.mitra_id', filters.mitraId);
            }

            const isAscending = filters.sortBy === 'Lama ke Baru';
            query = query.order('created_at', { ascending: isAscending });

            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;

            let calculatedTotalQty = 0;

            if (count && count > 0) {
                let qtyQuery = supabase.from('order_details').select(`
                    qty,
                    orders!inner ( status, tanggal, mitra_id )
                `);
                qtyQuery = qtyQuery.in('orders.status', ['Diproses', 'Packing']);
                if (filters.statusDetail && filters.statusDetail !== 'Semua') {
                    qtyQuery = qtyQuery.eq('status', filters.statusDetail);
                }
                if (filters.productId) {
                    qtyQuery = qtyQuery.eq('product_id', filters.productId);
                }
                if (filters.startDate) {
                    qtyQuery = qtyQuery.gte('orders.tanggal', filters.startDate);
                }
                if (filters.endDate) {
                    qtyQuery = qtyQuery.lte('orders.tanggal', filters.endDate);
                }
                if (filters.mitraId) {
                    qtyQuery = qtyQuery.eq('orders.mitra_id', filters.mitraId);
                }

                const { data: qtyData, error: qtyError } = await qtyQuery;
                if (!qtyError && qtyData) {
                    calculatedTotalQty = qtyData.reduce((sum, item) => sum + (item.qty || 0), 0);
                }
            }

            set({
                items: data as unknown as ProduksiItem[],
                totalItems: count || 0,
                totalFilteredQty: calculatedTotalQty,
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching produksi:', error);
            set({ items: [], totalItems: 0, totalFilteredQty: 0, isLoading: false });
        }
    }
}));
