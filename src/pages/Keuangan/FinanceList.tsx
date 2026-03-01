import { useEffect, useState } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, RefreshCw, AlertCircle } from 'lucide-react';
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
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-secondary bg-brand-surface rounded-xl hover:bg-brand-bg transition-colors border border-brand-border shadow-sm"
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
                className="hover:border-emerald-600/30 hover:bg-emerald-50/10 transition-all duration-300 cursor-pointer group shadow-sm"
                onClick={() => navigate(`/keuangan/${summary.mitra_id}`)}
            >
                {/* Header: Mitra name + Saldo */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Mitra</p>
                        <h4 className="font-bold text-text-primary text-lg truncate font-display group-hover:text-emerald-700 transition-colors">
                            {summary.nama_mitra}
                        </h4>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-[9px] uppercase font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-widest border border-emerald-100 block mb-1 shadow-sm">
                            SALDO KAS
                        </span>
                        <p className={`text-xl font-extrabold font-display leading-tight ${summary.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatRupiah(summary.saldo)}
                        </p>
                    </div>
                </div>

                {/* Metrics: Masuk & Keluar */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-1.5 text-blue-600 mb-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Masuk</span>
                        </div>
                        <span className="text-sm font-extrabold text-text-primary">{formatRupiah(summary.total_masuk)}</span>
                    </div>
                    <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                        <div className="flex items-center gap-1.5 text-rose-600 mb-1.5">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Keluar</span>
                        </div>
                        <span className="text-sm font-extrabold text-text-primary">{formatRupiah(summary.total_keluar)}</span>
                    </div>
                </div>

                {/* Estimasi tagihan berjalan */}
                <div className="flex justify-between items-center bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-100 shadow-sm shadow-amber-600/5">
                    <div className="flex items-center gap-1.5 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Estimasi Tagihan Aktif</span>
                    </div>
                    <span className="text-sm font-extrabold text-amber-700">
                        {formatRupiah(summary.estimasi_tagihan)}
                    </span>
                </div>
            </Card>
        ));
    };

    return (
        <div className="p-4 space-y-5 pb-24 max-w-2xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-brand-border/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Sistem Keuangan</h2>
                    <p className="page-subtitle mt-0.5">Ringkasan Arus Kas per Mitra</p>
                </div>
                <button
                    onClick={doFetch}
                    disabled={isLoading}
                    className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-xl hover:bg-brand-border/40 disabled:opacity-40"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3">
                {renderContent()}
            </div>
        </div>
    );
}
