import { useEffect, useState } from 'react';
import {
    PackageOpen, Clock, Printer, Palette, CheckCircle2, AlertCircle,
    Tag, User, Calendar, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useProduksiStore } from '../../store/produksiStore';
import type { ProduksiItem } from '../../store/produksiStore';
import { useOrderStore } from '../../store/orderStore';
import toast from 'react-hot-toast';
import { getDetailTransitionRule } from '../../utils/orderRules';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusConfirmationModal } from '../../components/orders/StatusConfirmationModal';
import { getRelativeTimeString } from '../../utils/dateUtils';

type TabStatus = 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';

export function ProduksiList() {
    const { items, isLoading, fetchProduksi } = useProduksiStore();
    const { updateOrderDetailStatus } = useOrderStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabStatus>('Menunggu');

    // Status Confirmation Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        targetStatus: string;
        currentStatus: string;
        prerequisiteError: string | null;
        consequences: string[];
        item: ProduksiItem;
    } | null>(null);

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

    const handleOpenStatusModal = (item: ProduksiItem, target: string) => {
        const rule = getDetailTransitionRule(item.status, target as any);
        // We mock the order object for prerequisites check if needed, 
        // but ProduksiItem already has orders info.
        const error = rule ? rule.prerequisites(item.orders, item) : 'Transisi tidak valid';

        setStatusModalConfig({
            targetStatus: target,
            currentStatus: item.status,
            prerequisiteError: error,
            consequences: rule?.consequences || [],
            item
        });
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        if (!statusModalConfig) return;
        const { item, targetStatus } = statusModalConfig;

        try {
            await updateOrderDetailStatus(item.o_pesanan, item.id, targetStatus as any);
            await fetchProduksi();
            toast.success('Status berhasil diperbarui');
            setIsStatusModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui status');
        }
    };

    const handleOpenDetail = (item: ProduksiItem) => {
        navigate(`/pesanan/detail-item/${item.id}`);
    };

    const getNextStatus = (currentStatus: TabStatus): TabStatus | null => {
        if (currentStatus === 'Menunggu') return 'Cetak DTF';
        if (currentStatus === 'Cetak DTF') return 'Sablon';
        if (currentStatus === 'Sablon') return 'Selesai';
        return null;
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 pb-20">
            <StatusConfirmationModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleConfirmStatusChange}
                currentStatus={statusModalConfig?.currentStatus || ''}
                targetStatus={statusModalConfig?.targetStatus || ''}
                prerequisiteError={statusModalConfig?.prerequisiteError}
                consequences={statusModalConfig?.consequences || []}
                isLoading={isLoading}
            />

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
                            const nextState = getNextStatus(item.status);
                            const relativeTime = getRelativeTimeString(item.created_at);

                            return (
                                <Card key={item.id} className="p-0 bg-zinc-900/40 border-zinc-800/60 overflow-hidden relative group hover:border-zinc-700/60 transition-colors">
                                    {/* Link and Info Area */}
                                    <div className="p-4 space-y-3 cursor-pointer" onClick={() => handleOpenDetail(item)}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors truncate">
                                                    {item.products?.nama_produk || 'Produk Dihapus'}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="w-3 h-3 text-zinc-600" />
                                                        <span className="text-xs font-medium text-zinc-400">{item.orders?.mitra?.nama_mitra || 'Tamu'}</span>
                                                    </div>
                                                    <span className="text-zinc-800">•</span>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">
                                                        {item.qty} PCS
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-2 py-0.5 bg-zinc-950 rounded text-[9px] font-mono text-zinc-500 border border-zinc-800/50 uppercase tracking-tighter">
                                                {item.orders?.no_pesanan}
                                            </div>
                                        </div>

                                        {/* Design Description Tag - Requirement 2 */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.deskripsi_desain ? (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg max-w-full">
                                                    <Tag className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                                                    <span className="text-[11px] text-zinc-300 leading-tight italic truncate">
                                                        {item.deskripsi_desain}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-zinc-600 italic">Tanpa catatan desain</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action and Time Area - Requirement 3 */}
                                    <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800/50 flex justify-between items-center">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-1.5 text-zinc-500">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                                        {new Date(item.orders?.tanggal || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-blue-500/60 px-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span className="text-[10px] font-medium italic lowercase">{relativeTime}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {nextState && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenStatusModal(item, nextState);
                                                }}
                                                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-95 border border-blue-400/20"
                                            >
                                                Lanjut ke {nextState}
                                            </button>
                                        )}
                                        {item.status === 'Selesai' && (
                                            <StatusBadge status="Selesai" size="sm" />
                                        )}
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
