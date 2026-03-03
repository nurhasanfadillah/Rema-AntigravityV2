import { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Wallet, Clock, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function FinanceList() {
    const { summaries, fetchSummaries, isLoading, error } = useFinanceStore();
    const navigate = useNavigate();
    const [hasFetched, setHasFetched] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const doFetch = async () => {
        setLocalError(null);
        try {
            await fetchSummaries();
        } catch (e: any) {
            // Cek apakah ini karena tabel/view belum dibuat (migrasi SQL belum dijalankan)
            const msg = e?.message || '';
            if (msg.includes('does not exist') || msg.includes('relation')) {
                setLocalError('Tabel database belum tersedia. Pastikan anda sudah menjalankan script SQL migrasi Plan 3.');
            } else {
                setLocalError(msg || 'Gagal memuat data keuangan.');
            }
        } finally {
            setHasFetched(true);
        }
    };

    useEffect(() => {
        doFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const renderContent = () => {
        if (isLoading && !hasFetched) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw className="w-8 h-8 text-text-tertiary animate-spin" />
                    <p className="text-text-tertiary text-sm">Memuat ringkasan keuangan...</p>
                </div>
            );
        }

        if (localError || error) {
            return (
                <div className="flex flex-col items-center gap-3 py-12 px-4 rounded-2xl border border-red-100 bg-red-50">
                    <AlertCircle className="w-10 h-10 text-red-500/60" />
                    <div className="text-center">
                        <p className="text-red-700 font-bold text-sm">Gagal Memuat Data</p>
                        <p className="text-text-tertiary text-xs mt-1 leading-relaxed">{localError || error}</p>
                    </div>
                    <button
                        onClick={doFetch}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-secondary bg-brand-surface rounded-xl active:bg-brand-bg transition-colors border border-brand-border shadow-sm active:scale-95"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Coba Lagi
                    </button>
                </div>
            );
        }

        if (summaries.length === 0) {
            return (
                <div className="text-center py-12 px-4 rounded-2xl border border-brand-border border-dashed bg-brand-surface/50 shadow-sm">
                    <Wallet className="w-10 h-10 text-brand-border mx-auto mb-3" />
                    <p className="text-text-secondary font-bold text-sm">Belum ada rekapan keuangan</p>
                    <p className="text-text-tertiary text-xs mt-1">Selesaikan item produksi untuk memicu arus kas masuk</p>
                </div>
            );
        }

        return summaries.map(summary => (
            <Card
                key={summary.mitra_id}
                className="active:border-emerald-600/30 active:bg-emerald-50/10 transition-all duration-150 cursor-pointer group shadow-sm active:scale-[0.99]"
                onClick={() => navigate(`/keuangan/${summary.mitra_id}`)}
            >
                {/* Header: Mitra name + Saldo */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Mitra</p>
                        <h4 className="font-bold text-text-primary text-lg truncate font-display transition-colors">
                            {summary.nama_mitra}
                        </h4>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">
                            Saldo Tagihan
                        </span>
                        <p className={`text-xl font-extrabold font-display leading-tight ${summary.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatRupiah(summary.saldo)}
                        </p>
                    </div>
                </div>

                {/* Estimasi tagihan berjalan */}
                <div className="flex justify-between items-center bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-100 shadow-sm shadow-amber-600/5">
                    <div className="flex items-center gap-1.5 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Tagihan Pending</span>
                    </div>
                    <span className="text-sm font-extrabold text-amber-700">
                        {formatRupiah(summary.tagihan_pending)}
                    </span>
                </div>
            </Card>
        ));
    };

    const globalSaldo = summaries.reduce((acc, curr) => acc + curr.saldo, 0);
    const globalPending = summaries.reduce((acc, curr) => acc + curr.tagihan_pending, 0);
    const globalProyeksi = globalSaldo + globalPending;

    return (
        <div className="p-4 space-y-5 pb-24 max-w-2xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-full active:bg-brand-border/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Sistem Keuangan</h2>
                    <p className="page-subtitle mt-0.5">Ringkasan Arus Kas per Mitra</p>
                </div>
                <button
                    onClick={doFetch}
                    disabled={isLoading}
                    className="p-2 text-text-tertiary transition-colors rounded-xl active:bg-brand-border/40 disabled:opacity-40"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Global Statistics */}
            {summaries.length > 0 && !isLoading && !localError && !error && (
                <div className="space-y-3">
                    {/* Baris 1: Card Utama */}
                    <div className="bg-gradient-to-tr from-blue-600 to-blue-900 rounded-2xl p-4 shadow-lg shadow-blue-900/20 text-white">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-blue-100" />
                            <span className="text-sm font-semibold text-blue-50/90">Saldo Tagihan</span>
                        </div>
                        <div className="text-right mt-2">
                            <span className="text-3xl font-extrabold font-display tracking-tight text-white drop-shadow-sm">
                                {formatRupiah(globalSaldo)}
                            </span>
                        </div>
                    </div>

                    {/* Baris 2: Dua Card Sejajar */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Kolom 1: Pending */}
                        <div className="bg-brand-surface rounded-xl p-3.5 border border-brand-border flex flex-col justify-between shadow-sm">
                            <div className="flex items-center gap-1.5 text-text-secondary min-w-0">
                                <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                <span className="text-xs font-medium truncate">Pending</span>
                            </div>
                            <div className="text-right mt-2">
                                <span className="text-[13px] font-extrabold text-text-primary">
                                    {formatRupiah(globalPending)}
                                </span>
                            </div>
                        </div>
                        {/* Kolom 2: Proyeksi */}
                        <div className="bg-brand-surface rounded-xl p-3.5 border border-brand-border flex flex-col justify-between shadow-sm">
                            <div className="flex items-center gap-1.5 text-text-secondary min-w-0">
                                <TrendingUp className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                                <span className="text-xs font-medium truncate">Proyeksi Saldo</span>
                            </div>
                            <div className="text-right mt-2">
                                <span className="text-[13px] font-extrabold text-blue-600">
                                    {formatRupiah(globalProyeksi)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {renderContent()}
            </div>
        </div>
    );
}
