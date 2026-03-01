import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, FileText, Globe, User, MapPin, Search, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { StatusBadge, StatusStepper } from '../../components/ui/StatusBadge';
import { getOrderFileUrl } from '../../utils/orderStorage';
import { StatusConfirmationModal } from '../../components/orders/StatusConfirmationModal';
import { getDetailTransitionRule } from '../../utils/orderRules';
import { notify } from '../../utils/notify';

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
            <div className="flex flex-col min-h-screen bg-brand-bg items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
        );
    }

    if (!item || !parentOrder) {
        return (
            <div className="flex flex-col min-h-screen bg-brand-bg items-center justify-center p-4">
                <p className="text-text-tertiary text-sm mb-4">Item pesanan tidak ditemukan atau sedang dimuat.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-brand-surface text-text-primary text-sm font-bold rounded-xl hover:bg-brand-border transition-colors border border-brand-border shadow-sm">
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

        const toastId = notify.loading('Memperbarui status item...');
        try {
            await updateOrderDetailStatus(parentOrder.no_pesanan, item.id, statusModalConfig.targetStatus as any);
            notify.success(`Status item diubah ke ${statusModalConfig.targetStatus}`, toastId);
            setIsStatusModalOpen(false);
        } catch (error: any) {
            notify.error(error.message || 'Gagal memperbarui status', toastId);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-text-primary animate-in slide-in-from-right-4 duration-300 pb-12 max-w-2xl mx-auto w-full">
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
            <div className="bg-brand-surface border-b border-brand-border p-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-brand-border/40 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="page-title font-display truncate">Detail Item</h2>
                    <p className="page-subtitle truncate font-bold text-brand-accent">{item.products?.nama_produk || 'Produk'}</p>
                </div>
                <StatusBadge status={item.status} size="sm" />
            </div>

            <div className="p-5 space-y-8 no-scrollbar">
                {/* Status Stepper Flow */}
                <div className="bg-brand-surface p-5 rounded-3xl border border-brand-border shadow-sm">
                    <div className="mb-3 px-1">
                        <span className="section-label font-bold text-text-tertiary uppercase tracking-widest text-[10px]">Tahapan Produksi</span>
                    </div>
                    <StatusStepper currentStatus={item.status as any} type="detail" />
                </div>

                {/* Section: Design Description */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brand-accent">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="section-label font-bold uppercase tracking-widest text-[10px]">Deskripsi Desain</span>
                    </div>
                    <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border leading-relaxed italic text-text-secondary text-sm shadow-sm ring-1 ring-black/[0.02]">
                        "{item.deskripsi_desain || 'Tidak ada deskripsi'}"
                    </div>
                </div>

                {/* Section: Design Files */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="section-label font-bold uppercase tracking-widest text-[10px]">Aset File Desain</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {item.design_file && item.design_file.length > 0 ? (
                            item.design_file.map((file, idx) => {
                                const isImg = ['jpg', 'jpeg', 'png', 'webp'].includes(file.split('.').pop()?.toLowerCase() || '');
                                return (
                                    <a key={idx} href={getOrderFileUrl(file) || '#'} target="_blank" rel="noreferrer"
                                        className="group relative aspect-video rounded-xl overflow-hidden bg-brand-surface border border-brand-border hover:border-indigo-500/50 transition-all shadow-sm">
                                        {isImg ? (
                                            <img src={getOrderFileUrl(file) || ''} alt="Design" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-brand-bg">
                                                <FileText className="w-6 h-6 text-text-muted" />
                                                <span className="text-[10px] font-bold text-text-tertiary uppercase">Dokumen</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-5 h-5 text-indigo-600" />
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="col-span-2 py-8 text-center bg-brand-surface/50 rounded-2xl border border-dashed border-brand-border">
                                <p className="text-xs text-text-tertiary italic font-medium">Belum ada file desain yang diunggah</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Fulfillment Info */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="section-label font-bold uppercase tracking-widest text-[10px]">
                            {parentOrder.sumber_pesanan === 'Online' ? 'File Resi (Online)' : 'Detail Pengiriman (Offline)'}
                        </span>
                    </div>

                    {parentOrder.sumber_pesanan === 'Online' ? (
                        parentOrder.file_resi ? (
                            <a href={getOrderFileUrl(parentOrder.file_resi) || '#'} target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 p-4 bg-brand-surface rounded-2xl border border-brand-border text-sm font-bold text-text-secondary hover:bg-brand-bg transition-colors shadow-sm">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span>Lihat Dokumen Resi Pengiriman</span>
                                <ExternalLink className="w-4 h-4 ml-auto text-text-tertiary" />
                            </a>
                        ) : (
                            <div className="p-4 bg-brand-surface/50 border border-dashed border-brand-border rounded-2xl">
                                <p className="text-xs text-text-tertiary italic font-medium">Resi belum tersedia</p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-3 p-4 bg-brand-surface rounded-2xl border border-brand-border shadow-sm">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-text-tertiary shrink-0" />
                                <span className="text-sm font-extrabold text-text-primary">{parentOrder.nama_penerima || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 pl-7">
                                <span className="text-xs text-text-tertiary font-bold">{parentOrder.kontak_penerima || '-'}</span>
                            </div>
                            {parentOrder.alamat_penerima && (
                                <div className="flex items-start gap-3 pt-2 border-t border-brand-border">
                                    <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                                    <span className="text-xs text-text-tertiary font-medium leading-relaxed italic">{parentOrder.alamat_penerima}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Section: Related Items */}
                <div className="pt-6 border-t border-brand-border pb-10">
                    <div className="flex items-center gap-2 mb-4 text-text-tertiary">
                        <Search className="w-3.5 h-3.5" />
                        <span className="section-label font-bold uppercase tracking-widest text-[10px]">Item Lain dalam Pesanan Ini</span>
                    </div>
                    <div className="space-y-2">
                        {otherItems.length > 0 ? (
                            otherItems.map(other => (
                                <button
                                    key={other.id}
                                    onClick={() => navigate(`/pesanan/detail-item/${other.id}`)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-surface hover:bg-brand-bg transition-all border border-brand-border text-left group shadow-sm"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-xs font-bold text-text-primary truncate">{other.products?.nama_produk}</span>
                                        <span className="text-brand-border text-xs">–</span>
                                        <span className="text-[10px] text-text-tertiary truncate max-w-[80px] italic font-medium">
                                            {other.deskripsi_desain || 'Tanpa deskripsi'}
                                        </span>
                                        <span className="text-brand-border text-xs">–</span>
                                        <span className="text-[10px] font-extrabold text-text-muted shrink-0">{other.qty} Pcs</span>
                                        <span className="text-brand-border text-xs">–</span>
                                        <StatusBadge status={other.status} size="sm" className="shrink-0 scale-90 origin-left" />
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all ml-1 shrink-0" />
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-text-muted italic pl-1 font-medium">Tidak ada item lain</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Button for Status Progress */}
            {nextState && parentOrder.status !== 'Menunggu Konfirmasi' && (
                <div className="px-5 pb-10">
                    <button
                        onClick={() => handleOpenStatusModal(nextState)}
                        className="w-full py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 border border-blue-600/10"
                    >
                        Lanjut ke {nextState}
                    </button>
                </div>
            )}
        </div>
    );
}
