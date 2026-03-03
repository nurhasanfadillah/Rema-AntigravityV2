import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { deleteOrderFile } from '../utils/orderStorage';
import { logActivity } from '../utils/activityLogger';
import type { Mitra } from './mitraStore';
import type { Product } from './productStore';
import { isValidOrderTransition, getOrderTransitionRule, isValidDetailTransition } from '../utils/orderRules';
import { useFinanceStore } from './financeStore';

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

/**
 * Logic Data: Representasi Status 'Dikonfirmasi'
 * Jika seluruh order_details berstatus 'Menunggu', maka tampilkan 'Dikonfirmasi' (khusus status Diproses).
 * Secara otomatis kembali menjadi 'Diproses' jika minimal satu detail sudah mulai dikerjakan.
 */
export const getOrderDisplayStatus = (order: Order): Order['status'] | 'Dikonfirmasi' => {
    if (order.status === 'Diproses') {
        const hasDetails = order.order_details && order.order_details.length > 0;
        const allWaiting = hasDetails && order.order_details!.every(d => d.status === 'Menunggu');
        if (allWaiting) return 'Dikonfirmasi';
    }
    return order.status;
};

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

export interface OrderFilters {
    startDate?: string;
    endDate?: string;
    mitraId?: string;
    productId?: string;
    status?: string;
    sortBy?: 'Baru ke Lama' | 'Lama ke Baru';
}

interface OrderState {
    orders: Order[];
    totalOrders: number;
    isLoading: boolean;
    fetchOrders: (page?: number, limit?: number, filters?: OrderFilters) => Promise<void>;
    addOrder: (order: Omit<Order, 'order_details' | 'mitra'>, items: Omit<OrderDetail, 'id' | 'o_pesanan' | 'products' | 'status'>[]) => Promise<void>;
    updateOrderData: (no_pesanan: string, orderData: Partial<Order>, items: Omit<OrderDetail, 'id' | 'o_pesanan' | 'products' | 'status'>[]) => Promise<void>;
    updateOrderStatus: (no_pesanan: string, status: Order['status'], reason?: string) => Promise<void>;
    updateOrderDetailStatus: (order_id: string, detail_id: string, status: OrderDetail['status']) => Promise<void>;
    deleteOrder: (no_pesanan: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    totalOrders: 0,
    isLoading: false,
    fetchOrders: async (page = 1, limit = 999999, filters = {}) => {
        set({ isLoading: true });
        // Fetch orders with nested mitra and order_details (and nested products inside details)
        let query = supabase
            .from('orders')
            .select(`
                *,
                mitra ( * ),
                order_details ( *, products ( * ) )
            `, { count: 'exact' });

        // Apply filters
        if (filters.startDate) {
            query = query.gte('tanggal', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('tanggal', filters.endDate);
        }
        if (filters.mitraId) {
            query = query.eq('mitra_id', filters.mitraId);
        }
        if (filters.status && filters.status !== 'Semua') {
            query = query.eq('status', filters.status);
        }

        // Apply productId filter if specified
        if (filters.productId) {
            // Because order_details is a child table, filtering on the parent based on child's field
            // requires either a join query or fetching matching order IDs first.
            // Using RPC or separate query is better for Supabase. Let's do a subquery-like approach:
            const { data: matchedDetails } = await supabase
                .from('order_details')
                .select('o_pesanan')
                .eq('product_id', filters.productId);

            if (matchedDetails && matchedDetails.length > 0) {
                const orderIds = matchedDetails.map(d => d.o_pesanan);
                query = query.in('no_pesanan', orderIds);
            } else {
                // If product filter matches no detail, return empty
                set({ orders: [], totalOrders: 0, isLoading: false });
                return;
            }
        }

        // Apply sorting
        const isAscending = filters.sortBy === 'Lama ke Baru';
        query = query.order('created_at', { ascending: isAscending });

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (!error && data) {
            set({ orders: data as Order[], totalOrders: count || 0, isLoading: false });
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

            // Activity Log
            logActivity({
                module: 'Pesanan',
                action: 'CREATE',
                description: `Membuat pesanan baru: ${orderData.no_pesanan}`,
                referenceId: orderData.no_pesanan,
                newValue: { no_pesanan: orderData.no_pesanan, sumber_pesanan: order.sumber_pesanan, status: order.status, jumlah_item: items.length },
            });

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
    updateOrderStatus: async (no_pesanan, status, reason?: string) => {
        set({ isLoading: true });

        // 1. Get current status for audit
        const { data: currentOrder } = await supabase
            .from('orders')
            .select('status')
            .eq('no_pesanan', no_pesanan)
            .single();

        const oldStatus = currentOrder?.status;

        // Validation: Prevent invalid status jumps
        if (oldStatus && !isValidOrderTransition(oldStatus, status)) {
            set({ isLoading: false });
            throw new Error(`Transisi status dari ${oldStatus} ke ${status} tidak valid.`);
        }

        // Validation: Prerequisites check
        const rule = getOrderTransitionRule(oldStatus as any, status as any);
        if (rule) {
            const fullOrder = get().orders.find(o => o.no_pesanan === no_pesanan);
            const error = rule.prerequisites(fullOrder);
            if (error) {
                set({ isLoading: false });
                throw new Error(error);
            }
        }

        // 2. Update status
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('no_pesanan', no_pesanan);

        if (!error) {
            // 3. Create Audit Trail (existing order_audit_trail)
            await supabase.from('order_audit_trail').insert([{
                no_pesanan,
                status_lama: oldStatus,
                status_baru: status,
                alasan: reason || 'Perubahan status manual',
                aksi_oleh: 'Admin'
            }]);

            // 4. Activity Log (centralized)
            logActivity({
                module: 'Pesanan',
                action: status === 'Dibatalkan' ? 'CANCEL' : 'STATUS_CHANGE',
                description: `${status === 'Dibatalkan' ? 'Membatalkan' : 'Mengubah status'} pesanan ${no_pesanan}: ${oldStatus} → ${status}`,
                referenceId: no_pesanan,
                oldValue: { status: oldStatus },
                newValue: { status },
                metadata: reason ? { alasan: reason } : null,
            });

            const { data } = await supabase.from('orders').select('*, mitra ( * ), order_details ( *, products ( * ) )').order('created_at', { ascending: false });
            if (data) set({ orders: data as Order[] });

            // Refresh finance summaries when order status changes
            useFinanceStore.getState().fetchSummaries();
        } else {
            console.error(error);
            throw error;
        }
        set({ isLoading: false });
    },
    updateOrderDetailStatus: async (order_id, detail_id, status) => {
        set({ isLoading: true });

        // Get current data for audit and logic check
        const { data: currentOrder } = await supabase.from('orders').select('status').eq('no_pesanan', order_id).single();
        const { data: currentDetail } = await supabase.from('order_details').select('status').eq('id', detail_id).single();

        if (!currentDetail) {
            set({ isLoading: false });
            throw new Error('Detail pesanan tidak ditemukan');
        }

        const oldDetailStatus = currentDetail.status;

        // Validation: Prevent invalid status jumps for details
        if (!isValidDetailTransition(oldDetailStatus, status)) {
            set({ isLoading: false });
            throw new Error(`Transisi status item dari ${oldDetailStatus} ke ${status} tidak valid (Wajib Progresif: Menunggu -> Cetak DTF -> Sablon -> Selesai).`);
        }

        // Logic Data #5: status dorder_details dari 'Menunggu' hanya bisa dikonfirmasi jika status ordernya 'Diproses'
        if (oldDetailStatus === 'Menunggu' && currentOrder && currentOrder.status !== 'Diproses') {
            set({ isLoading: false });
            throw new Error('Item hanya dapat diproses (dipindahkan dari status Menunggu) jika status Pesanan adalah Diproses.');
        }

        const { error } = await supabase.from('order_details').update({ status }).eq('id', detail_id);

        if (!error) {
            // Audit Trail for detail change
            await supabase.from('order_audit_trail').insert([{
                no_pesanan: order_id,
                status_lama: `Detail (${oldDetailStatus})`,
                status_baru: `Detail (${status})`,
                alasan: 'Perubahan status item',
                aksi_oleh: 'Admin'
            }]);

            // Activity Log (centralized)
            logActivity({
                module: 'Detail Pesanan',
                action: 'STATUS_CHANGE',
                description: `Mengubah status item pesanan ${order_id}: ${oldDetailStatus} → ${status}`,
                referenceId: detail_id,
                oldValue: { status: oldDetailStatus },
                newValue: { status },
                metadata: { no_pesanan: order_id },
            });

            // Logic Data #1: Status orders otomatis menjadi 'Packing' hanya jika SEMUA order_details sudah 'Selesai'
            const { data: orderData } = await supabase.from('orders').select('*, order_details(*)').eq('no_pesanan', order_id).single();
            if (orderData && orderData.order_details) {
                const allDone = orderData.order_details.every((d: any) => d.status === 'Selesai');
                if (allDone && orderData.status !== 'Packing' && orderData.status !== 'Selesai' && orderData.status !== 'Dibatalkan') {
                    // Update Order to Packing with audit
                    await supabase.from('orders').update({ status: 'Packing' }).eq('no_pesanan', order_id);
                    await supabase.from('order_audit_trail').insert([{
                        no_pesanan: order_id,
                        status_lama: orderData.status,
                        status_baru: 'Packing',
                        alasan: 'Otomatis: Semua item selesai dikerjakan',
                        aksi_oleh: 'System'
                    }]);
                    logActivity({
                        module: 'Pesanan',
                        action: 'STATUS_CHANGE',
                        description: `Status pesanan ${order_id} otomatis berubah ke Packing (semua item selesai)`,
                        referenceId: order_id,
                        oldValue: { status: orderData.status },
                        newValue: { status: 'Packing' },
                        metadata: { trigger: 'auto_packing' },
                    });
                }
            }

            const { data } = await supabase.from('orders').select('*, mitra ( * ), order_details ( *, products ( * ) )').order('created_at', { ascending: false });
            if (data) set({ orders: data as Order[] });
        } else {
            console.error(error);
            throw error;
        }
        set({ isLoading: false });
    },
    updateOrderData: async (no_pesanan, orderData, items) => {
        set({ isLoading: true });

        // Logic check: order can only be edited if status is 'Menunggu Konfirmasi'
        const { data: currentOrder } = await supabase.from('orders').select('status').eq('no_pesanan', no_pesanan).single();
        if (currentOrder && currentOrder.status !== 'Menunggu Konfirmasi') {
            set({ isLoading: false });
            throw new Error('Pesanan hanya dapat diedit saat status "Menunggu Konfirmasi".');
        }

        try {
            // 1. Update Header
            const { error: orderError } = await supabase
                .from('orders')
                .update(orderData)
                .eq('no_pesanan', no_pesanan);

            if (orderError) throw orderError;

            // 2. Clear old Details (we replace entirely for simplicity of edit, relying on CASCADE for related cleanup if any, though during Menunggu Konfirmasi there shouldn't be related transaction data)
            const { error: deleteDetailsError } = await supabase
                .from('order_details')
                .delete()
                .eq('o_pesanan', no_pesanan);

            if (deleteDetailsError) throw deleteDetailsError;

            // 3. Insert new Details
            if (items.length > 0) {
                const detailsToInsert = items.map(item => ({
                    ...item,
                    o_pesanan: no_pesanan,
                    status: 'Menunggu' // Default back to Menunggu
                }));

                const { error: detailError } = await supabase
                    .from('order_details')
                    .insert(detailsToInsert);

                if (detailError) throw detailError;
            }

            // Create Audit Trail for Edit
            if (currentOrder) {
                await supabase.from('order_audit_trail').insert([{
                    no_pesanan,
                    status_lama: currentOrder.status,
                    status_baru: currentOrder.status,
                    alasan: 'Edit keseluruhan data pesanan oleh Admin',
                    aksi_oleh: 'Admin'
                }]);

                logActivity({
                    module: 'Pesanan',
                    action: 'UPDATE',
                    description: `Mengedit data pesanan: ${no_pesanan}`,
                    referenceId: no_pesanan,
                    oldValue: { status: currentOrder.status },
                    newValue: { ...orderData, jumlah_item: items.length },
                });
            }

            // Re-fetch
            const { data } = await supabase
                .from('orders')
                .select(`*, mitra ( * ), order_details ( *, products ( * ) )`)
                .order('created_at', { ascending: false });

            if (data) set({ orders: data as Order[] });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    deleteOrder: async (no_pesanan) => {
        set({ isLoading: true });

        // Logic Data #2: Hanya pesanan berstatus 'Menunggu Konfirmasi' atau 'Dibatalkan' yang bisa dihapus permanen
        const { data: orderToDelete } = await supabase.from('orders').select('*, order_details(*)').eq('no_pesanan', no_pesanan).single();
        if (orderToDelete && orderToDelete.status !== 'Menunggu Konfirmasi' && orderToDelete.status !== 'Dibatalkan') {
            set({ isLoading: false });
            throw new Error('Hanya pesanan dengan status "Menunggu Konfirmasi" atau "Dibatalkan" yang dapat dihapus secara permanen.');
        }

        // Cleanup storage files
        if (orderToDelete) {
            if (orderToDelete.file_resi) {
                await deleteOrderFile(orderToDelete.file_resi);
            }
            if (orderToDelete.order_details) {
                for (const detail of orderToDelete.order_details) {
                    if (detail.design_file) {
                        for (const path of detail.design_file) {
                            await deleteOrderFile(path);
                        }
                    }
                }
            }
        }

        const { error } = await supabase.from('orders').delete().eq('no_pesanan', no_pesanan);
        if (!error) {
            logActivity({
                module: 'Pesanan',
                action: 'DELETE',
                description: `Menghapus pesanan: ${no_pesanan}`,
                referenceId: no_pesanan,
                oldValue: orderToDelete ? { no_pesanan, status: orderToDelete.status } : null,
            });
            const { data } = await supabase.from('orders').select('*, mitra ( * ), order_details ( *, products ( * ) )').order('created_at', { ascending: false });
            if (data) set({ orders: data as Order[] });
        } else {
            console.error(error);
        }
        set({ isLoading: false });
    }
}));
