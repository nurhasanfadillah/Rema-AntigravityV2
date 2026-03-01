import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, FileText, Globe, User, MapPin, Search, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store/orderStore';
import { StatusBadge, StatusStepper } from '../../components/ui/StatusBadge';
import { getOrderFileUrl } from '../../utils/orderStorage';
import { StatusConfirmationModal } from '../../components/orders/StatusConfirmationModal';
import { getDetailTransitionRule } from '../../utils/orderRules';

export function PesananDetailItem() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { orders, fetchOrders, isLoading, updateOrderDetailStatus } = useOrderStore();

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        targetStatus: string;
        currentStatus: string;
        prerequisiteError: string | null;
        consequences: string[];
    } | null>(null);

    useEffect(() => {
        if (orders.length === 0) {
            fetchOrders();
        }
    }, [orders.length, fetchOrders]);

    const parentOrder = orders.find(o => o.order_details?.some(d => d.id === id));
    const item = parentOrder?.order_details?.find(d => d.id === id);

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!item || !parentOrder) {
        return (
            <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center p-4">
                <p className="text-zinc-500 text-sm mb-4">Item pesanan tidak ditemukan atau sedang dimuat.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-zinc-800 text-zinc-200 text-sm rounded-xl hover:bg-zinc-700 transition-colors">
                    Kembali
                </button>
            </div>
        );
    }

    const otherItems = parentOrder.order_details?.filter(d => d.id !== id) || [];

    const getNextStatus = (currentStatus: string): string | null => {
        if (currentStatus === 'Menunggu') return 'Cetak DTF';
        if (currentStatus === 'Cetak DTF') return 'Sablon';
        if (currentStatus === 'Sablon') return 'Selesai';
        return null;
    };

    const nextState = getNextStatus(item.status);

    const handleOpenStatusModal = (target: string) => {
        if (!item || !parentOrder) return;

        const rule = getDetailTransitionRule(item.status as any, target as any);
        const error = rule ? rule.prerequisites(parentOrder, item) : 'Transisi tidak valid';

        setStatusModalConfig({
            targetStatus: target,
            currentStatus: item.status,
            prerequisiteError: error,
            consequences: rule?.consequences || [],
        });
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        if (!statusModalConfig || !item || !parentOrder) return;

        try {
            await updateOrderDetailStatus(parentOrder.no_pesanan, item.id, statusModalConfig.targetStatus as any);
            toast.success(`Status item berhasil diubah menjadi ${statusModalConfig.targetStatus}`);
            setIsStatusModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui status');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 animate-in slide-in-from-right-4 duration-300 pb-12">
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

            {/* Page Header */}
            <div className="bg-zinc-950 border-b border-zinc-900 p-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="page-title font-display truncate">Detail Item</h2>
                    <p className="page-subtitle truncate">{item.products?.nama_produk || 'Produk'}</p>
                </div>
                <StatusBadge status={item.status} size="sm" />
            </div>

            <div className="p-5 space-y-8 no-scrollbar">
                {/* Status Stepper Flow */}
                <div className="bg-zinc-900/20 p-5 rounded-3xl border border-zinc-900/50">
                    <div className="mb-3 px-1">
                        <span className="section-label">Tahapan Produksi</span>
                    </div>
                    <StatusStepper currentStatus={item.status as any} type="detail" />
                </div>

                {/* Section: Design Description */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="section-label text-blue-400">Deskripsi Desain</span>
                    </div>
                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 leading-relaxed italic text-zinc-300 text-sm">
                        "{item.deskripsi_desain || 'Tidak ada deskripsi'}"
                    </div>
                </div>

                {/* Section: Design Files */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="section-label text-indigo-400">Aset File Desain</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {item.design_file && item.design_file.length > 0 ? (
                            item.design_file.map((file, idx) => {
                                const isImg = ['jpg', 'jpeg', 'png', 'webp'].includes(file.split('.').pop()?.toLowerCase() || '');
                                return (
                                    <a key={idx} href={getOrderFileUrl(file) || '#'} target="_blank" rel="noreferrer"
                                        className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-all">
                                        {isImg ? (
                                            <img src={getOrderFileUrl(file) || ''} alt="Design" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                <FileText className="w-6 h-6 text-zinc-700" />
                                                <span className="text-[10px] font-semibold text-zinc-600 uppercase">Dokumen</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-5 h-5 text-white" />
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="col-span-2 py-8 text-center bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                                <p className="text-xs text-zinc-600 italic">Belum ada file desain yang diunggah</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Fulfillment Info */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="section-label text-emerald-400">
                            {parentOrder.sumber_pesanan === 'Online' ? 'File Resi (Online)' : 'Detail Pengiriman (Offline)'}
                        </span>
                    </div>

                    {parentOrder.sumber_pesanan === 'Online' ? (
                        parentOrder.file_resi ? (
                            <a href={getOrderFileUrl(parentOrder.file_resi) || '#'} target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span>Lihat Dokumen Resi Pengiriman</span>
                                <ExternalLink className="w-4 h-4 ml-auto text-zinc-600" />
                            </a>
                        ) : (
                            <div className="p-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
                                <p className="text-xs text-zinc-600 italic">Resi belum tersedia</p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-zinc-500 shrink-0" />
                                <span className="text-sm font-semibold text-zinc-200">{parentOrder.nama_penerima || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 pl-7">
                                <span className="text-xs text-zinc-500">{parentOrder.kontak_penerima || '-'}</span>
                            </div>
                            {parentOrder.alamat_penerima && (
                                <div className="flex items-start gap-3 pt-2 border-t border-zinc-900">
                                    <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                    <span className="text-xs text-zinc-400 leading-relaxed italic">{parentOrder.alamat_penerima}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Section: Related Items */}
                <div className="pt-6 border-t border-zinc-900 pb-10">
                    <div className="flex items-center gap-2 mb-4 text-zinc-500">
                        <Search className="w-3.5 h-3.5" />
                        <span className="section-label">Item Lain dalam Pesanan Ini</span>
                    </div>
                    <div className="space-y-2">
                        {otherItems.length > 0 ? (
                            otherItems.map(other => (
                                <button
                                    key={other.id}
                                    onClick={() => navigate(`/pesanan/detail-item/${other.id}`)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/80 transition-all border border-zinc-800/50 text-left group"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-zinc-300 truncate">{other.products?.nama_produk}</span>
                                        <span className="text-zinc-700 text-xs">–</span>
                                        <span className="text-[10px] text-zinc-500 truncate max-w-[80px] italic">
                                            {other.deskripsi_desain || 'Tanpa deskripsi'}
                                        </span>
                                        <span className="text-zinc-700 text-xs">–</span>
                                        <span className="text-[10px] font-bold text-zinc-600 shrink-0">{other.qty} Pcs</span>
                                        <span className="text-zinc-700 text-xs">–</span>
                                        <StatusBadge status={other.status} size="sm" className="shrink-0 scale-90 origin-left" />
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all ml-1 shrink-0" />
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-zinc-600 italic pl-1">Tidak ada item lain</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Button for Status Progress */}
            {nextState && parentOrder.status !== 'Menunggu Konfirmasi' && (
                <div className="px-5 pb-10">
                    <button
                        onClick={() => handleOpenStatusModal(nextState)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-95 border border-blue-400/20"
                    >
                        Lanjut ke {nextState}
                    </button>
                </div>
            )}
        </div>
    );
}
