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
    RefreshCw, Wallet, AlertCircle, Filter, Calendar, X, Check
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

    // Filter states
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [tempDates, setTempDates] = useState({ start: '', end: '' });
    const [showFilterModal, setShowFilterModal] = useState(false);

    const isFiltered = startDate !== '' || endDate !== '';

    const doFetch = useCallback(async () => {
        if (!id) return;
        setFetchError(null);
        try {
            await fetchTransactionsByMitra(id, startDate || undefined, endDate || undefined);
            // Pastikan summaries juga ter-fetch untuk summary banner (saldo tagihan all-time)
            await fetchSummaries();
        } catch (e: any) {
            setFetchError(e?.message || 'Gagal memuat data transaksi');
        }
    }, [id, fetchTransactionsByMitra, fetchSummaries, startDate, endDate]);

    useEffect(() => {
        doFetch();
    }, [doFetch]);

    const activePeriodLabel = () => {
        if (!startDate && !endDate) return null;
        if (startDate && endDate) {
            if (startDate === endDate) return formatTanggal(startDate);
            return `${formatTanggal(startDate)} — ${formatTanggal(endDate)}`;
        }
        if (startDate) return `Sejak ${formatTanggal(startDate)}`;
        if (endDate) return `Hingga ${formatTanggal(endDate)}`;
        return null;
    };

    const applyFilter = () => {
        setStartDate(tempDates.start);
        setEndDate(tempDates.end);
        setShowFilterModal(false);
    };

    const resetFilter = () => {
        setStartDate('');
        setEndDate('');
        setTempDates({ start: '', end: '' });
        setShowFilterModal(false);
    };

    // Calculate dynamic totals from current transaction list
    const { filteredMasuk, filteredKeluar } = transactions.reduce(
        (acc, tx) => ({
            filteredMasuk: acc.filteredMasuk + Number(tx.masuk),
            filteredKeluar: acc.filteredKeluar + Number(tx.keluar),
        }),
        { filteredMasuk: 0, filteredKeluar: 0 }
    );

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
            doFetch();
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
            doFetch();
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
        <div className="p-4 space-y-5 pb-24 max-w-2xl mx-auto w-full">
            <ConfirmDialog />

            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to="/keuangan" className="p-2 -ml-2 text-text-tertiary rounded-full active:bg-brand-border/40 transition-colors">
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
                        onClick={() => {
                            setTempDates({ start: startDate, end: endDate });
                            setShowFilterModal(true);
                        }}
                        className={`p-2.5 transition-all rounded-xl border active:scale-95 shadow-sm ${isFiltered
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-brand-surface border-brand-border text-text-tertiary active:bg-brand-border/40'
                            }`}
                    >
                        <Filter className={`w-4 h-4 ${isFiltered ? 'fill-blue-600/10' : ''}`} />
                    </button>
                    <button
                        onClick={() => doFetch()}
                        disabled={isLoading}
                        className="p-2.5 text-text-tertiary transition-all rounded-xl border border-brand-border bg-brand-surface active:bg-brand-border/40 disabled:opacity-40 active:scale-95 shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {!showForm && (
                        <Button variant="primary" className="!p-2.5 shadow-md shadow-blue-600/20 active:scale-95" onClick={() => {
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
                <div className="space-y-2.5">
                    {/* Saldo Utama - Selalu Tampil */}
                    <div className="bg-gradient-to-r from-emerald-50 via-brand-surface to-brand-surface px-4 py-3 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Wallet className="w-5 h-5" />
                            <span className="font-extrabold uppercase tracking-wider text-[11px]">Saldo Tagihan</span>
                        </div>
                        <span className={`font-display font-extrabold text-xl ${summary.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatRupiah(summary.saldo)}
                        </span>
                    </div>

                    {/* Filter Period Indicator + Contextual Totals */}
                    {isFiltered ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between px-1 mb-2">
                                <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-[10px] font-bold truncate max-w-[180px]">
                                        {activePeriodLabel()}
                                    </span>
                                    <button onClick={resetFilter} className="ml-1 p-0.5 hover:bg-blue-100 rounded-full transition-colors">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-brand-bg px-2 py-1 rounded-lg border border-brand-border/40">
                                    Total Periode
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Tagihan</span>
                                    </div>
                                    <p className="text-sm font-extrabold text-text-primary">{formatRupiah(filteredMasuk)}</p>
                                </div>
                                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 shadow-sm">
                                    <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Pembayaran</span>
                                    </div>
                                    <p className="text-sm font-extrabold text-text-primary">{formatRupiah(filteredKeluar)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Placeholder or hint when not filtered? No, user said only when filtered */
                        null
                    )}
                </div>
            )}

            {/* Date Picker Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-text-primary/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFilterModal(false)}>
                    <Card
                        className="w-full max-w-sm border-brand-border shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-text-primary text-lg">Filter Periode</h3>
                            </div>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="p-2 text-text-tertiary hover:bg-brand-bg rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={tempDates.start}
                                        onChange={(e) => setTempDates(prev => ({ ...prev, start: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">S/D Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={tempDates.end}
                                        onChange={(e) => setTempDates(prev => ({ ...prev, end: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2.5 pt-2">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={resetFilter}
                                    className="font-bold !py-3 rounded-xl"
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={applyFilter}
                                    className="font-bold !py-3 rounded-xl shadow-lg shadow-blue-600/20"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Terapkan
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Form Tambah / Edit Kas Keluar */}
            {showForm && (
                <Card className="border-rose-100 bg-brand-surface shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                            <h3 className="font-bold text-text-primary">
                                {editingId ? '✏️ Edit Transaksi' : '➕ Tambah Kas Keluar'}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                Manual Input
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="form-label font-bold text-text-secondary">Deskripsi</label>
                                <input
                                    required
                                    type="text"
                                    className="form-input bg-brand-bg border-brand-border"
                                    placeholder={`Pembayaran Mitra ${summary?.nama_mitra || ''}`}
                                    value={formData.deskripsi}
                                    onChange={e => setFormData(f => ({ ...f, deskripsi: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="form-label font-bold text-text-secondary">Nominal Keluar (Rp)</label>
                                <NumberInput
                                    placeholder="Contoh: 500000"
                                    value={formData.amount}
                                    onChange={val => setFormData(f => ({ ...f, amount: val }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2.5 pt-1">
                            <Button type="button" variant="outline" fullWidth onClick={resetForm} className="font-bold">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                className="!bg-rose-600 active:!bg-rose-700 !shadow-rose-600/20 font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Daftar Transaksi */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        Riwayat Transaksi
                    </h3>
                    {transactions.length > 0 && (
                        <span className="text-xs text-text-tertiary font-bold">{transactions.length} transaksi</span>
                    )}
                </div>

                {/* Loading */}
                {isLoading && transactions.length === 0 && !showForm && (
                    <div className="flex flex-col items-center py-12 gap-3">
                        <RefreshCw className="w-7 h-7 text-text-tertiary animate-spin" />
                        <p className="text-text-tertiary text-sm">Memuat transaksi...</p>
                    </div>
                )}

                {/* Fetch Error */}
                {!isLoading && fetchError && (
                    <div className="flex flex-col items-center gap-3 py-10 px-4 rounded-2xl border border-red-100 bg-red-50">
                        <AlertCircle className="w-9 h-9 text-red-500/60" />
                        <div className="text-center">
                            <p className="text-red-700 font-bold text-sm">Gagal Memuat Data</p>
                            <p className="text-text-tertiary text-xs mt-1">{fetchError}</p>
                        </div>
                        <button onClick={() => doFetch()} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-secondary bg-brand-surface rounded-xl border border-brand-border shadow-sm active:bg-brand-bg transition-colors active:scale-95">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !fetchError && transactions.length === 0 && (
                    <div className="text-center py-12 rounded-2xl border border-brand-border border-dashed bg-brand-surface/50">
                        <Wallet className="w-9 h-9 text-brand-border mx-auto mb-3" />
                        <p className="text-text-secondary text-sm font-bold">Belum ada transaksi</p>
                        <p className="text-text-tertiary text-xs mt-1">
                            Transaksi masuk muncul otomatis saat item produksi selesai
                        </p>
                    </div>
                )}

                {/* Transaction List */}
                {txWithBalance.length > 0 && (
                    <div className="space-y-3">
                        {txWithBalance.map((tx) => {
                            const isMasuk = Number(tx.masuk) > 0;
                            const amount = isMasuk ? Number(tx.masuk) : Number(tx.keluar);
                            const isAuto = tx.reference_id !== null;

                            return (
                                <div
                                    key={tx.id_transaksi}
                                    className={`rounded-2xl border transition-all duration-300 shadow-sm ${isMasuk
                                        ? 'bg-brand-surface border-blue-100 active:border-blue-300'
                                        : 'bg-brand-surface border-rose-100 active:border-rose-300'
                                        }`}
                                >
                                    <div className="p-3.5 flex items-start gap-3.5">
                                        {/* Icon */}
                                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isMasuk ? 'bg-blue-50' : 'bg-rose-50'}`}>
                                            {isMasuk
                                                ? <TrendingUp className="w-5 h-5 text-blue-600" />
                                                : <TrendingDown className="w-5 h-5 text-rose-600" />
                                            }
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Row 1: Deskripsi + Nominal */}
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold text-text-primary text-[13px] leading-snug flex-1 min-w-0 break-words">
                                                    {tx.deskripsi}
                                                </p>
                                                <p className={`font-extrabold font-display text-sm shrink-0 ${isMasuk ? 'text-blue-600' : 'text-rose-600'}`}>
                                                    {isMasuk ? '+' : '−'}{formatRupiah(amount)}
                                                </p>
                                            </div>

                                            {/* Row 2: Tanggal + Badge + Saldo Berjalan */}
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className="text-[10px] text-text-tertiary font-bold tabular-nums">
                                                    {formatTanggal(tx.tanggal)}
                                                </span>

                                                {isAuto ? (
                                                    <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-extrabold uppercase tracking-widest">
                                                        Auto
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 font-extrabold uppercase tracking-widest">
                                                        Manual
                                                    </span>
                                                )}

                                                <span className="text-[10px] text-text-muted font-bold tabular-nums ml-auto bg-brand-bg px-2 py-0.5 rounded-lg border border-brand-border/40">
                                                    Saldo: {formatRupiah(tx.balance)}
                                                </span>
                                            </div>

                                            {/* Row 3: Edit / Delete actions (hanya untuk transaksi manual) */}
                                            {!isAuto && (
                                                <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-brand-border">
                                                    <button
                                                        onClick={() => handleEdit(tx)}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-text-tertiary active:text-amber-700 active:bg-amber-50 rounded-lg transition-colors border border-brand-border/60 active:border-amber-200"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tx)}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-text-tertiary active:text-red-700 active:bg-red-50 rounded-lg transition-colors border border-brand-border/60 active:border-red-200"
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
