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
                    <RefreshCw className="w-8 h-8 text-zinc-600 animate-spin" />
                    <p className="text-zinc-500 text-sm">Memuat ringkasan keuangan...</p>
                </div>
            );
        }

        if (localError || error) {
            return (
                <div className="flex flex-col items-center gap-3 py-12 px-4 rounded-2xl border border-red-900/30 bg-red-950/10">
                    <AlertCircle className="w-10 h-10 text-red-500/60" />
                    <div className="text-center">
                        <p className="text-red-400 font-medium text-sm">Gagal Memuat Data</p>
                        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{localError || error}</p>
                    </div>
                    <button
                        onClick={doFetch}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800/60 rounded-xl hover:bg-zinc-700/60 transition-colors border border-zinc-700/50"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Coba Lagi
                    </button>
                </div>
            );
        }

        if (summaries.length === 0) {
            return (
                <div className="text-center py-12 px-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/20">
                    <Wallet className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400 font-medium text-sm">Belum ada rekapan keuangan</p>
                    <p className="text-zinc-600 text-xs mt-1">Selesaikan item produksi untuk memicu arus kas masuk</p>
                </div>
            );
        }

        return summaries.map(summary => (
            <Card
                key={summary.mitra_id}
                className="hover:border-emerald-700/40 hover:bg-zinc-900/60 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/keuangan/${summary.mitra_id}`)}
            >
                {/* Header: Mitra name + Saldo */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Mitra</p>
                        <h4 className="font-bold text-zinc-100 text-lg truncate font-display group-hover:text-emerald-300 transition-colors">
                            {summary.nama_mitra}
                        </h4>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-[9px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md tracking-widest border border-emerald-500/20 block mb-1">
                            SALDO KAS
                        </span>
                        <p className={`text-xl font-bold font-display ${summary.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatRupiah(summary.saldo)}
                        </p>
                    </div>
                </div>

                {/* Metrics: Masuk & Keluar */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div className="bg-blue-950/20 p-2.5 rounded-xl border border-blue-900/30">
                        <div className="flex items-center gap-1.5 text-blue-400 mb-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Masuk</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-200">{formatRupiah(summary.total_masuk)}</span>
                    </div>
                    <div className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/30">
                        <div className="flex items-center gap-1.5 text-rose-400 mb-1.5">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Keluar</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-200">{formatRupiah(summary.total_keluar)}</span>
                    </div>
                </div>

                {/* Estimasi tagihan berjalan */}
                <div className="flex justify-between items-center bg-amber-500/5 px-3 py-2.5 rounded-xl border border-amber-500/15">
                    <div className="flex items-center gap-1.5 text-amber-400/80">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Estimasi Tagihan Aktif</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">
                        {formatRupiah(summary.estimasi_tagihan)}
                    </span>
                </div>
            </Card>
        ));
    };

    return (
        <div className="p-4 space-y-5 pb-24">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/lainnya" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Sistem Keuangan</h2>
                    <p className="page-subtitle mt-0.5">Ringkasan Arus Kas per Mitra</p>
                </div>
                <button
                    onClick={doFetch}
                    disabled={isLoading}
                    className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-xl hover:bg-zinc-800/50 disabled:opacity-40"
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
