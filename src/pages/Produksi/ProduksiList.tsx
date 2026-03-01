import { useEffect, useState } from 'react';
import {
    PackageOpen, AlertCircle, Loader2
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

    const tabs: { id: TabStatus; label: string }[] = [
        { id: 'Menunggu', label: 'Antri' },
        { id: 'Cetak DTF', label: 'Cetak' },
        { id: 'Sablon', label: 'Sablon' },
        { id: 'Selesai', label: 'Selesai' },
    ];

    const filteredItems = items.filter(item => item.status === activeTab);

    const handleOpenDetail = (item: ProduksiItem) => {
        navigate(`/pesanan/detail-item/${item.id}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-text-primary pb-20">

            {/* Header */}
            <header className="bg-brand-surface border-b border-brand-border pt-4 pb-3 shadow-sm">
                <div className="px-4 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-brand-accent-light rounded-xl border border-brand-accent/20 shadow-sm shadow-brand-accent/5">
                        <PackageOpen className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight font-display text-text-primary leading-tight">Produksi</h2>
                        <p className="page-subtitle mt-0.5">Pusat kelola item produksi</p>
                    </div>
                </div>

                {/* Compact Segmented Control / Tabs */}
                <div className="px-4">
                    <div className="flex w-full bg-brand-bg/50 p-1 rounded-xl border border-brand-border/60">
                        {tabs.map((tab) => {
                            const count = items.filter(i => i.status === tab.id).length;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-300 relative ${isActive
                                        ? 'bg-brand-surface text-text-primary shadow-sm ring-1 ring-black/5'
                                        : 'text-text-tertiary active:text-text-secondary'
                                        }`}
                                >
                                    {/* Count badge */}
                                    <span className={`text-[11px] font-bold leading-none mb-0.5 transition-colors ${isActive ? 'text-brand-accent' : 'text-text-muted'}`}>
                                        {count}
                                    </span>
                                    {/* Tab label */}
                                    <span className={`text-[10px] uppercase font-extrabold tracking-tight transition-colors ${isActive ? 'text-text-primary' : 'text-text-tertiary'}`}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute -bottom-[-2px] w-6 h-[1.5px] bg-brand-accent rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* List */}
            <main className="flex-1 p-4 space-y-4">
                {isLoading && items.length === 0 ? (
                    <div className="flex justify-center items-center py-10 text-brand-accent">
                        <Loader2 className="animate-spin w-8 h-8" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-brand-surface/50 rounded-2xl border border-brand-border border-dashed mt-4 shadow-sm">
                        <AlertCircle className="w-10 h-10 text-text-muted mb-3" />
                        <p className="text-sm text-text-tertiary">Tidak ada item di status ini</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const relativeTime = getRelativeTimeString(item.created_at);

                            return (
                                <Card key={item.id} className="p-4 bg-brand-surface border-brand-border/60 active:border-brand-accent/30 transition-colors cursor-pointer group shadow-sm active:scale-[0.99]" onClick={() => handleOpenDetail(item)}>
                                    {/* Primary Info */}
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-start gap-4">
                                            {/* Mitra name — primary info level 1 */}
                                            <h4 className="font-bold text-text-primary leading-tight truncate transition-colors">
                                                {item.orders?.mitra?.nama_mitra || 'Tamu'}
                                            </h4>
                                            {/* Produk x Qty — primary info level 1, right aligned */}
                                            <p className="font-bold text-sm text-text-secondary shrink-0 text-right mt-0">
                                                {item.products?.nama_produk || 'Produk Dihapus'} <span className="text-text-muted mx-0.5">×</span> {item.qty}
                                            </p>
                                        </div>

                                        {/* Deskripsi Desain — inline note, secondary info */}
                                        {item.deskripsi_desain ? (
                                            <p className="text-xs text-text-tertiary italic line-clamp-1 mt-1">
                                                {item.deskripsi_desain}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-text-muted italic line-clamp-1 mt-1">
                                                Tanpa catatan desain
                                            </p>
                                        )}
                                    </div>

                                    <div className="h-px bg-brand-border/40 my-3"></div>

                                    {/* Secondary Info — waktu, tanggal, no pesanan */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-text-tertiary">
                                                {new Date(item.orders?.tanggal || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-brand-border">•</span>
                                            <span className="text-xs text-text-muted font-medium">{relativeTime}</span>
                                        </div>
                                        <span className="section-label text-text-muted">
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
