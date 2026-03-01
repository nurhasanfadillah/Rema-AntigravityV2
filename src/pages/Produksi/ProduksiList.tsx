import { useEffect, useState } from 'react';
import {
    PackageOpen, Clock, Printer, Palette, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useProduksiStore } from '../../store/produksiStore';
import type { ProduksiItem } from '../../store/produksiStore';
import { getRelativeTimeString } from '../../utils/dateUtils';

type TabStatus = 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';

export function ProduksiList() {
    const { items, isLoading, fetchProduksi } = useProduksiStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabStatus>('Menunggu');

    useEffect(() => {
        fetchProduksi();
    }, [fetchProduksi]);

    const tabs: { id: TabStatus; label: string; icon: React.ElementType; color: string }[] = [
        { id: 'Menunggu', label: 'Menunggu', icon: Clock, color: 'text-zinc-400' },
        { id: 'Cetak DTF', label: 'Cetak', icon: Printer, color: 'text-purple-400' },
        { id: 'Sablon', label: 'Sablon', icon: Palette, color: 'text-cyan-400' },
        { id: 'Selesai', label: 'Selesai', icon: CheckCircle2, color: 'text-emerald-400' },
    ];

    const filteredItems = items.filter(item => item.status === activeTab);

    const handleOpenDetail = (item: ProduksiItem) => {
        navigate(`/pesanan/detail-item/${item.id}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 pb-20">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl border border-blue-500/20">
                        <PackageOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Produksi</h1>
                        <p className="text-xs text-zinc-400">Pusat kelola item pesanan</p>
                    </div>
                </div>

                {/* Segmented Control / Tabs */}
                <div className="flex w-full mt-4 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const count = items.filter(i => i.status === tab.id).length;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 relative shrink-0 min-w-[80px] ${activeTab === tab.id
                                    ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                                    }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </div>
                                <span className="text-lg font-bold leading-none">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* List */}
            <main className="flex-1 p-4 space-y-4">
                {isLoading && items.length === 0 ? (
                    <div className="flex justify-center items-center py-10 text-blue-500">
                        <Loader2 className="animate-spin w-8 h-8" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/50 mt-4">
                        <AlertCircle className="w-12 h-12 text-zinc-600 mb-3" />
                        <p className="text-zinc-400">Tidak ada item di status ini</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const relativeTime = getRelativeTimeString(item.created_at);

                            return (
                                <Card key={item.id} className="p-4 bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/60 transition-colors cursor-pointer group" onClick={() => handleOpenDetail(item)}>
                                    {/* Primary Info */}
                                    <div className="flex flex-col mb-3">
                                        <h3 className="font-bold text-lg text-zinc-100 leading-tight mb-1 truncate group-hover:text-blue-400 transition-colors">
                                            {item.orders?.mitra?.nama_mitra || 'Tamu'}
                                        </h3>
                                        <p className="font-medium text-[13px] text-zinc-300 truncate">
                                            {item.products?.nama_produk || 'Produk Dihapus'} <span className="text-zinc-500 mx-1">x</span> {item.qty}
                                        </p>
                                        {/* Inline Deskripsi Tanpa Box */}
                                        {item.deskripsi_desain ? (
                                            <p className="text-[11px] text-zinc-400 italic line-clamp-1 mt-1 font-medium">
                                                {item.deskripsi_desain}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-zinc-600 italic line-clamp-1 mt-1">
                                                Tanpa catatan desain
                                            </p>
                                        )}
                                    </div>

                                    {/* Secondary Info */}
                                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <span>{new Date(item.orders?.tanggal || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                            <span className="text-zinc-700 mx-0.5">•</span>
                                            <span className="text-zinc-400">{relativeTime}</span>
                                        </div>
                                        <span className="font-mono uppercase tracking-tighter text-zinc-600">
                                            #{item.orders?.no_pesanan}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
