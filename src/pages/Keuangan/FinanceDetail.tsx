import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFinanceStore, type FinancialTransaction } from '../../store/financeStore';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import {
    ArrowLeft, TrendingUp, TrendingDown, Plus, Edit2, Trash2,
    RefreshCw, Wallet, AlertCircle
} from 'lucide-react';

const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const formatTanggal = (dateStr: string) => {
    // date di DB adalah type DATE (YYYY-MM-DD), tanpa timezone
    // parse manual agar tidak ke-offset oleh timezone browser
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

export function FinanceDetail() {
    const { id } = useParams<{ id: string }>();
    const {
        transactions,
        summaries,
        fetchTransactionsByMitra,
        fetchSummaries,
        addTransactionKeluar,
        updateTransactionKeluar,
        deleteTransactionKeluar,
        isLoading,
    } = useFinanceStore();
    const { confirm, ConfirmDialog } = useConfirmation();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ deskripsi: '', amount: '' });
    const [fetchError, setFetchError] = useState<string | null>(null);

    const doFetch = useCallback(async () => {
        if (!id) return;
        setFetchError(null);
        try {
            await fetchTransactionsByMitra(id);
            // Pastikan summaries juga ter-fetch untuk summary banner
            await fetchSummaries();
        } catch (e: any) {
            setFetchError(e?.message || 'Gagal memuat data transaksi');
        }
    }, [id, fetchTransactionsByMitra, fetchSummaries]);

    useEffect(() => {
        doFetch();
    }, [doFetch]);

    const summary = summaries.find(s => s.mitra_id === id);

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ deskripsi: '', amount: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const val = parseFloat(formData.amount.replace(/[^0-9.]/g, '')) || 0;
        if (val <= 0) {
            notify.error('Nominal harus lebih dari 0');
            return;
        }
        const desc = formData.deskripsi.trim() || `Pembayaran Mitra`;

        const toastId = notify.loading(editingId ? 'Menyimpan perubahan...' : 'Mencatat kas keluar...');
        try {
            if (editingId) {
                await updateTransactionKeluar(editingId, desc, val, id);
                notify.success('Transaksi keluar berhasil diubah', toastId);
            } else {
                await addTransactionKeluar(id, desc, val);
                notify.success('Transaksi keluar berhasil dicatat', toastId);
            }
            resetForm();
        } catch (error) {
            handleBackendError(error, 'Gagal menyimpan transaksi', toastId, 'Transaksi');
        }
    };

    const handleEdit = (tx: FinancialTransaction) => {
        setFormData({ deskripsi: tx.deskripsi, amount: tx.keluar.toString() });
        setEditingId(tx.id_transaksi);
        setShowForm(true);
        // Scroll ke form
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    const handleDelete = async (tx: FinancialTransaction) => {
        const { confirmed } = await confirm({
            title: 'Hapus Transaksi Keluar?',
            description: 'Transaksi manual ini akan dihapus. Saldo dan rekap mitra akan dihitung ulang secara otomatis.',
            subject: `${tx.deskripsi} — ${formatRupiah(tx.keluar)}`,
            variant: 'danger',
            confirmLabel: 'Hapus Transaksi',
            consequences: [
                'Data transaksi tidak dapat dikembalikan.',
                'Saldo dan total kas keluar mitra akan diperbarui.',
            ],
            requiresDoubleConfirm: false,
        });
        if (!confirmed) return;

        const toastId = notify.loading('Menghapus transaksi...');
        try {
            // Kirim mitraId sebagai parameter agar tidak bergantung pada state
            await deleteTransactionKeluar(tx.id_transaksi, tx.mitra_id || id!);
            notify.success('Transaksi berhasil dihapus', toastId);
        } catch (error) {
            handleBackendError(error, 'Gagal menghapus transaksi', toastId, 'Transaksi');
        }
    };

    // Hitung running balance untuk tampilan saldo berjalan
    // Transactions sudah diurutkan descending, balik dulu untuk perhitungan
    const txWithBalance = [...transactions].reverse().reduce<(FinancialTransaction & { balance: number })[]>(
        (acc, tx) => {
            const prev = acc[acc.length - 1]?.balance ?? 0;
            return [...acc, { ...tx, balance: prev + Number(tx.masuk) - Number(tx.keluar) }];
        }, []
    ).reverse(); // Balik lagi ke descending

    return (
        <div className="p-4 space-y-5 pb-24">
            <ConfirmDialog />

            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to="/keuangan" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="page-title font-display truncate">
                        {summary?.nama_mitra || 'Arus Kas Mitra'}
                    </h2>
                    <p className="page-subtitle mt-0.5">Riwayat Transaksi Keuangan</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={doFetch}
                        disabled={isLoading}
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-xl hover:bg-zinc-800/50 disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {!showForm && (
                        <Button variant="primary" className="!p-2.5" onClick={() => {
                            setFormData({ deskripsi: '', amount: '' });
                            setEditingId(null);
                            setShowForm(true);
                        }}>
                            <Plus className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="col-span-2 bg-gradient-to-r from-emerald-950/50 via-emerald-900/20 to-transparent px-4 py-3 rounded-2xl border border-emerald-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Wallet className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-[11px]">Saldo Kas</span>
                        </div>
                        <span className={`font-display font-bold text-xl ${summary.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatRupiah(summary.saldo)}
                        </span>
                    </div>
                    <div className="bg-blue-950/20 p-3 rounded-xl border border-blue-900/30">
                        <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Masuk</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-200">{formatRupiah(summary.total_masuk)}</p>
                    </div>
                    <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
                        <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Keluar</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-200">{formatRupiah(summary.total_keluar)}</p>
                    </div>
                </div>
            )}

            {/* Form Tambah / Edit Kas Keluar */}
            {showForm && (
                <Card className="border-rose-900/30 bg-rose-950/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold text-zinc-100 border-b border-zinc-800/60 pb-2.5">
                            {editingId ? '✏️ Edit Transaksi Keluar' : '➕ Catat Kas Keluar Manual'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="form-label">Deskripsi</label>
                                <input
                                    required
                                    type="text"
                                    className="form-input"
                                    placeholder={`Pembayaran Mitra ${summary?.nama_mitra || ''}`}
                                    value={formData.deskripsi}
                                    onChange={e => setFormData(f => ({ ...f, deskripsi: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="form-label">Nominal Keluar (Rp)</label>
                                <NumberInput
                                    placeholder="Contoh: 500000"
                                    value={formData.amount}
                                    onChange={val => setFormData(f => ({ ...f, amount: val }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2.5 pt-1">
                            <Button type="button" variant="ghost" fullWidth onClick={resetForm}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                className="!bg-rose-600 hover:!bg-rose-500"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Daftar Transaksi */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Riwayat Transaksi
                    </h3>
                    {transactions.length > 0 && (
                        <span className="text-xs text-zinc-600 font-medium">{transactions.length} transaksi</span>
                    )}
                </div>

                {/* Loading */}
                {isLoading && transactions.length === 0 && !showForm && (
                    <div className="flex flex-col items-center py-12 gap-3">
                        <RefreshCw className="w-7 h-7 text-zinc-600 animate-spin" />
                        <p className="text-zinc-500 text-sm">Memuat transaksi...</p>
                    </div>
                )}

                {/* Fetch Error */}
                {!isLoading && fetchError && (
                    <div className="flex flex-col items-center gap-3 py-10 px-4 rounded-2xl border border-red-900/30 bg-red-950/10">
                        <AlertCircle className="w-9 h-9 text-red-500/60" />
                        <div className="text-center">
                            <p className="text-red-400 font-medium text-sm">Gagal Memuat Data</p>
                            <p className="text-zinc-500 text-xs mt-1">{fetchError}</p>
                        </div>
                        <button onClick={doFetch} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800/60 rounded-xl border border-zinc-700/50 hover:bg-zinc-700/60 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !fetchError && transactions.length === 0 && (
                    <div className="text-center py-12 rounded-2xl border border-zinc-800/40 bg-zinc-900/20">
                        <Wallet className="w-9 h-9 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm font-medium">Belum ada transaksi</p>
                        <p className="text-zinc-600 text-xs mt-1">
                            Transaksi masuk muncul otomatis saat item produksi selesai
                        </p>
                    </div>
                )}

                {/* Transaction List */}
                {txWithBalance.length > 0 && (
                    <div className="space-y-2.5">
                        {txWithBalance.map((tx) => {
                            const isMasuk = Number(tx.masuk) > 0;
                            const amount = isMasuk ? Number(tx.masuk) : Number(tx.keluar);
                            const isAuto = tx.reference_id !== null;

                            return (
                                <div
                                    key={tx.id_transaksi}
                                    className={`rounded-2xl border transition-colors ${isMasuk
                                        ? 'bg-zinc-900/30 border-blue-900/20 hover:border-blue-800/30'
                                        : 'bg-rose-950/10 border-rose-900/20 hover:border-rose-800/30'
                                        }`}
                                >
                                    <div className="p-3.5 flex items-start gap-3.5">
                                        {/* Icon */}
                                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isMasuk ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}>
                                            {isMasuk
                                                ? <TrendingUp className="w-4.5 h-4.5 text-blue-400 w-5 h-5" />
                                                : <TrendingDown className="w-4.5 h-4.5 text-rose-400 w-5 h-5" />
                                            }
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Row 1: Deskripsi + Nominal */}
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-zinc-100 text-[13px] leading-snug flex-1 min-w-0 break-words">
                                                    {tx.deskripsi}
                                                </p>
                                                <p className={`font-bold font-display text-sm shrink-0 ${isMasuk ? 'text-blue-400' : 'text-rose-400'}`}>
                                                    {isMasuk ? '+' : '−'}{formatRupiah(amount)}
                                                </p>
                                            </div>

                                            {/* Row 2: Tanggal + Badge + Saldo Berjalan */}
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className="text-[10px] text-zinc-500 font-medium tabular-nums">
                                                    {formatTanggal(tx.tanggal)}
                                                </span>

                                                {isAuto ? (
                                                    <span className="text-[9px] bg-blue-500/10 text-blue-400/80 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold uppercase tracking-widest">
                                                        Auto
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] bg-rose-500/10 text-rose-400/80 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold uppercase tracking-widest">
                                                        Manual
                                                    </span>
                                                )}

                                                <span className="text-[10px] text-zinc-600 tabular-nums ml-auto">
                                                    Saldo: {formatRupiah(tx.balance)}
                                                </span>
                                            </div>

                                            {/* Row 3: Edit / Delete actions (hanya untuk transaksi manual) */}
                                            {!isAuto && (
                                                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
                                                    <button
                                                        onClick={() => handleEdit(tx)}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-amber-500/20"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tx)}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
