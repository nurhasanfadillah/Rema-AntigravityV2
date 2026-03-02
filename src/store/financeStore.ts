import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { logActivity } from '../utils/activityLogger';

export interface FinanceSummary {
    mitra_id: string;
    nama_mitra: string;
    total_masuk: number;
    total_keluar: number;
    saldo: number;
    tagihan_pending: number;
}

export interface FinancialTransaction {
    id_transaksi: string;
    tanggal: string;
    mitra_id: string | null;
    deskripsi: string;
    masuk: number;
    keluar: number;
    reference_id: string | null;
    created_at: string;
    updated_at: string;
}

interface FinanceState {
    summaries: FinanceSummary[];
    transactions: FinancialTransaction[];
    isLoading: boolean;
    error: string | null;
    fetchSummaries: () => Promise<void>;
    fetchTransactionsByMitra: (mitraId: string, startDate?: string, endDate?: string) => Promise<void>;
    addTransactionKeluar: (mitraId: string, deskripsi: string, amount: number) => Promise<void>;
    updateTransactionKeluar: (id_transaksi: string, deskripsi: string, amount: number, mitraId: string) => Promise<void>;
    deleteTransactionKeluar: (id_transaksi: string, mitraId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    summaries: [],
    transactions: [],
    isLoading: false,
    error: null,

    fetchSummaries: async () => {
        set({ isLoading: true, error: null });

        // finance_summary adalah VIEW — mengambil nama_mitra langsung dari VIEW (sudah embedded di SQL)
        // Tidak menggunakan FK join PostgREST karena View tidak mendukung relational embed
        const { data, error } = await supabase
            .from('finance_summary')
            .select('mitra_id, nama_mitra, total_masuk, total_keluar, saldo, tagihan_pending');

        if (!error && data) {
            // Konversi nilai numerik yang mungkin datang sebagai string dari Supabase
            const mapped: FinanceSummary[] = data.map((d: any) => ({
                mitra_id: d.mitra_id,
                nama_mitra: d.nama_mitra || 'Tanpa Nama',
                total_masuk: Number(d.total_masuk) || 0,
                total_keluar: Number(d.total_keluar) || 0,
                saldo: Number(d.saldo) || 0,
                tagihan_pending: Number(d.tagihan_pending) || 0,
            }));
            set({ summaries: mapped, isLoading: false });
        } else {
            const msg = error?.message || 'Gagal memuat ringkasan keuangan';
            set({ isLoading: false, error: msg });
            if (error) throw error;
        }
    },

    fetchTransactionsByMitra: async (mitraId: string, startDate?: string, endDate?: string) => {
        set({ isLoading: true, error: null, transactions: [] });

        let query = supabase
            .from('financial_transactions')
            .select('id_transaksi, tanggal, mitra_id, deskripsi, masuk, keluar, reference_id, created_at, updated_at')
            .eq('mitra_id', mitraId);

        if (startDate) {
            query = query.gte('tanggal', startDate);
        }
        if (endDate) {
            query = query.lte('tanggal', endDate);
        }

        const { data, error } = await query
            .order('tanggal', { ascending: false })
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Pastikan nilai numerik dikonversi dari string (Supabase DECIMAL bisa datang sebagai string)
            const mapped: FinancialTransaction[] = data.map((d: any) => ({
                ...d,
                masuk: Number(d.masuk) || 0,
                keluar: Number(d.keluar) || 0,
            }));
            set({ transactions: mapped, isLoading: false });
        } else {
            const msg = error?.message || 'Gagal memuat transaksi';
            set({ isLoading: false, error: msg });
            if (error) throw error;
        }
    },

    addTransactionKeluar: async (mitraId, deskripsi, amount) => {
        set({ isLoading: true, error: null });
        const payload = {
            mitra_id: mitraId,
            tanggal: new Date().toISOString().split('T')[0],
            deskripsi: deskripsi.trim() || 'Pembayaran Mitra',
            keluar: amount,
            masuk: 0,
            // reference_id kosong = transaksi manual
        };

        const { data: inserted, error } = await supabase
            .from('financial_transactions')
            .insert([payload])
            .select('id_transaksi')
            .single();

        if (error) {
            set({ isLoading: false, error: error.message });
            throw error;
        }

        if (inserted) {
            logActivity({
                module: 'Keuangan',
                action: 'CREATE',
                description: `Menambahkan transaksi keluar: ${payload.deskripsi} (Rp ${amount.toLocaleString('id-ID')})`,
                referenceId: inserted.id_transaksi,
                newValue: { deskripsi: payload.deskripsi, keluar: amount, mitra_id: mitraId },
            });
        }

        // Re-fetch data terbaru setelah insert berhasil
        await get().fetchTransactionsByMitra(mitraId);
        await get().fetchSummaries();
    },

    updateTransactionKeluar: async (id_transaksi, deskripsi, amount, mitraId) => {
        set({ isLoading: true, error: null });

        // Capture old value
        const oldTx = get().transactions.find(t => t.id_transaksi === id_transaksi);

        const { error } = await supabase
            .from('financial_transactions')
            .update({
                deskripsi: deskripsi.trim(),
                keluar: amount,
                updated_at: new Date().toISOString()
            })
            .eq('id_transaksi', id_transaksi)
            .is('reference_id', null);

        if (error) {
            set({ isLoading: false, error: error.message });
            throw error;
        }

        logActivity({
            module: 'Keuangan',
            action: 'UPDATE',
            description: `Memperbarui transaksi keluar: ${deskripsi}`,
            referenceId: id_transaksi,
            oldValue: oldTx ? { deskripsi: oldTx.deskripsi, keluar: oldTx.keluar } : null,
            newValue: { deskripsi: deskripsi.trim(), keluar: amount },
        });

        // Re-fetch dengan mitraId yang sudah diketahui dari parameter
        await get().fetchTransactionsByMitra(mitraId);
        await get().fetchSummaries();
    },

    deleteTransactionKeluar: async (id_transaksi, mitraId) => {
        set({ isLoading: true, error: null });

        // Capture old value for audit
        const oldTx = get().transactions.find(t => t.id_transaksi === id_transaksi);

        const { error } = await supabase
            .from('financial_transactions')
            .delete()
            .eq('id_transaksi', id_transaksi)
            .is('reference_id', null);

        if (error) {
            set({ isLoading: false, error: error.message });
            throw error;
        }

        logActivity({
            module: 'Keuangan',
            action: 'DELETE',
            description: `Menghapus transaksi keluar: ${oldTx?.deskripsi || id_transaksi}`,
            referenceId: id_transaksi,
            oldValue: oldTx ? { deskripsi: oldTx.deskripsi, keluar: oldTx.keluar } : null,
        });

        // Re-fetch setelah delete
        await get().fetchTransactionsByMitra(mitraId);
        await get().fetchSummaries();
    },
}));
