import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, ShoppingCart, Calendar, MapPin, User, Tag, Trash2, FileText, Package, Globe, Wallet } from 'lucide-react';
import { getOrderFileUrl } from '../../utils/orderStorage';
import { StatusConfirmationModal } from '../../components/orders/StatusConfirmationModal';
import { getOrderTransitionRule, getDetailTransitionRule } from '../../utils/orderRules';
import { StatusBadge, StatusStepper } from '../../components/ui/StatusBadge';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';

export function PesananDetail() {
    const { id } = useParams<{ id: string }>();
    const { orders, fetchOrders, isLoading, updateOrderStatus, updateOrderDetailStatus, deleteOrder } = useOrderStore();
    const navigate = useNavigate();
    const { confirm, ConfirmDialog } = useConfirmation();

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        targetStatus: string;
        currentStatus: string;
        prerequisiteError: string | null;
        consequences: string[];
        requiresReason: boolean;
        type: 'order' | 'detail';
        detailId?: string;
    } | null>(null);

    useEffect(() => {
        if (orders.length === 0) fetchOrders();
    }, [orders.length, fetchOrders]);

    const order = orders.find(o => o.no_pesanan === id);
    const canDelete = order ? order.status === 'Dibatalkan' : false;
    const canCancel = order ? order.status !== 'Dibatalkan' : false;

    const handleOpenStatusModal = (target: string, type: 'order' | 'detail', detailId?: string) => {
        if (!order) return;

        if (type === 'order') {
            const rule = getOrderTransitionRule(order.status as any, target as any);
            const error = rule ? rule.prerequisites(order) : (target === 'Dibatalkan' ? null : 'Transisi status tidak valid');

            setStatusModalConfig({
                targetStatus: target,
                currentStatus: order.status,
                prerequisiteError: error,
                consequences: rule?.consequences || (target === 'Dibatalkan' ? ['Pesanan akan dibatalkan secara permanen.'] : []),
                requiresReason: rule?.requiresReason || target === 'Dibatalkan',
                type: 'order'
            });
        } else {
            const item = order.order_details?.find(d => d.id === detailId);
            if (!item) return;

            const rule = getDetailTransitionRule(item.status as any, target as any);
            const error = rule ? rule.prerequisites(order, item) : 'Transisi status item tidak valid';

            setStatusModalConfig({
                targetStatus: target,
                currentStatus: item.status,
                prerequisiteError: error,
                consequences: rule?.consequences || [],
                requiresReason: false,
                type: 'detail',
                detailId
            });
        }
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatusChange = async (reason?: string) => {
        if (!statusModalConfig || !id) return;

        const toastId = notify.loading('Memperbarui status...');
        try {
            if (statusModalConfig.type === 'order') {
                await updateOrderStatus(id, statusModalConfig.targetStatus as any, reason);
                notify.success(`Status pesanan diubah ke ${statusModalConfig.targetStatus}`, toastId);
            } else if (statusModalConfig.detailId) {
                await updateOrderDetailStatus(id, statusModalConfig.detailId, statusModalConfig.targetStatus as any);
                notify.success(`Status item diubah ke ${statusModalConfig.targetStatus}`, toastId);
            }
            setIsStatusModalOpen(false);
        } catch (error: any) {
            handleBackendError(error, 'Gagal mengubah status', toastId, 'Pesanan');
        }
    };

    if (isLoading && orders.length === 0) {
        return <div className="p-8 text-center text-text-tertiary text-sm">Memuat detail pesanan...</div>;
    }

    if (!order) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-text-tertiary text-sm">Pesanan tidak ditemukan.</p>
                <Link to="/pesanan" className="text-brand-accent active:underline text-sm font-bold">Kembali ke Daftar</Link>
            </div>
        );
    }

    const total = order.order_details?.reduce((acc: number, current: any) => acc + (current.qty * current.harga_satuan), 0) || 0;

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            <ConfirmDialog />
            <StatusConfirmationModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleConfirmStatusChange}
                currentStatus={statusModalConfig?.currentStatus || ''}
                targetStatus={statusModalConfig?.targetStatus || ''}
                prerequisiteError={statusModalConfig?.prerequisiteError}
                consequences={statusModalConfig?.consequences || []}
                requiresReason={statusModalConfig?.requiresReason}
                isLoading={isLoading}
            />

            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/pesanan" className="p-2 -ml-2 text-text-tertiary rounded-full active:bg-brand-border/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Detail Pesanan</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={order.status} size="sm" />
                        <span className="text-brand-border">•</span>
                        <span className="section-label font-mono font-bold">{order.no_pesanan}</span>
                    </div>
                </div>
                {canCancel && (
                    <button onClick={() => handleOpenStatusModal('Dibatalkan', 'order')} className="p-2.5 text-orange-600 rounded-xl active:bg-orange-50 transition-all border border-orange-100 active:scale-95" title="Batalkan Pesanan">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
                {canDelete && (
                    <button onClick={async () => {
                        if (!order) return;
                        const { confirmed } = await confirm({
                            title: 'Hapus Pesanan?',
                            description: 'Pesanan ini akan dihapus secara permanen beserta data di dalamnya.',
                            subject: `${order.no_pesanan} — ${order.mitra?.nama_mitra || 'Tamu'}`,
                            variant: 'danger',
                            confirmLabel: 'Hapus Pesanan',
                            requiresDoubleConfirm: true,
                            consequences: [
                                'Semua item produksi akan dihapus.',
                                'Transaksi keuangan yang terhubung sudah dibersihkan.',
                                'Tindakan ini tidak dapat dibatalkan.',
                            ],
                        });
                        if (!confirmed) return;

                        const toastId = notify.loading('Menghapus pesanan...');
                        try {
                            await deleteOrder(order.no_pesanan);
                            notify.success('Pesanan berhasil dihapus permanen', toastId);
                            navigate('/pesanan');
                        } catch (error) {
                            handleBackendError(error, 'Gagal menghapus pesanan', toastId, 'Pesanan');
                        }
                    }} className="p-2.5 text-red-600 rounded-xl active:bg-red-50 transition-all border border-red-100 active:scale-95" title="Hapus Permanen">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Order Overview Card */}
            <Card className="border-brand-border bg-brand-surface relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/[0.03] rounded-bl-[120px] pointer-events-none"></div>

                {/* Primary: Mitra Name */}
                <div className="mb-5">
                    <span className="section-label mb-1 block">Pelanggan / Mitra</span>
                    <h3 className="text-2xl font-bold text-text-primary font-display leading-tight tracking-tight">{order.mitra?.nama_mitra || 'Tamu / Walk-in'}</h3>
                </div>

                {/* Total & Action Row */}
                <div className="grid grid-cols-2 gap-6 pb-5 border-b border-brand-border/60">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-text-tertiary">
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="section-label">Total Pembayaran</span>
                        </div>
                        <p className="font-extrabold text-brand-accent text-xl font-display leading-none">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total)}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        {(() => {
                            if (order.status === 'Menunggu Konfirmasi') {
                                return (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/pesanan/edit/${order.no_pesanan}`)}
                                            className="px-4 py-2 bg-brand-bg text-text-primary text-[11px] font-bold uppercase tracking-widest rounded-xl active:bg-brand-border active:scale-95 transition-all border border-brand-border"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleOpenStatusModal('Diproses', 'order')}
                                            className="px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all border border-blue-600/10"
                                        >
                                            Proses
                                        </button>
                                    </div>
                                );
                            }
                            if (order.status === 'Packing') {
                                return (
                                    <button
                                        onClick={() => handleOpenStatusModal('Selesai', 'order')}
                                        className="px-4 py-2 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all border border-emerald-600/10"
                                    >
                                        Selesaikan
                                    </button>
                                );
                            }
                            return <StatusBadge status={order.status} />;
                        })()}
                    </div>
                </div>

                {/* Secondary Meta Info Grid */}
                <div className="grid grid-cols-2 gap-y-5 pt-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-text-tertiary">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="section-label">Tanggal</span>
                        </div>
                        <p className="text-sm font-bold text-text-secondary">
                            {new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="space-y-1 justify-self-end text-right">
                        <div className="flex items-center gap-1.5 text-text-tertiary justify-end">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="section-label">Sumber</span>
                        </div>
                        <p className="text-sm font-bold text-text-secondary">{order.sumber_pesanan}</p>
                    </div>

                    {/* Offline: Receiver Info */}
                    {order.sumber_pesanan === 'Offline' && (
                        <div className="col-span-2 p-3 bg-brand-bg rounded-xl border border-brand-border/60">
                            <div className="flex items-center gap-1.5 text-text-tertiary mb-2">
                                <User className="w-3.5 h-3.5 text-brand-accent/70" />
                                <span className="section-label">Informasi Penerima</span>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-sm font-bold text-text-primary">{order.nama_penerima}</p>
                                <p className="text-xs text-text-tertiary font-medium">{order.kontak_penerima}</p>
                                {order.alamat_penerima && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-brand-border">
                                        <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                                        <p className="text-xs text-text-tertiary leading-relaxed italic">{order.alamat_penerima}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Online: Resi Document */}
                    {order.sumber_pesanan === 'Online' && (
                        <div className="col-span-2 pt-2">
                            <div className="flex items-center gap-1.5 text-text-tertiary mb-2.5">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="section-label">Dokumen Resi</span>
                            </div>
                            {order.file_resi ? (
                                <a
                                    href={getOrderFileUrl(order.file_resi) || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700 active:bg-blue-100 transition-all active:translate-y-0 shadow-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    Buka Resi Pengiriman
                                </a>
                            ) : (
                                <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                                    <p className="text-xs text-red-600/80 italic font-medium">Data resi pengiriman belum diunggah</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Production Items Section */}
            <div className="space-y-4 pt-2 pb-24">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold font-display text-text-primary text-lg">Informasi Produksi</h3>
                    <div className="px-2.5 py-1 bg-brand-surface rounded-lg border border-brand-border shadow-sm">
                        <span className="section-label font-bold text-text-secondary">{order.order_details?.length || 0} Item</span>
                    </div>
                </div>

                {order.order_details?.map((item: any) => {
                    return (
                        <Card key={item.id} className="border-brand-border bg-brand-surface group pb-6 cursor-pointer active:border-brand-accent/30 transition-all duration-150 shadow-sm active:scale-[0.99]" onClick={() => navigate(`/pesanan/detail-item/${item.id}`)}>
                            <div className="flex flex-col gap-5">
                                {/* Product Name & Qty — Core Info Level 1 */}
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg font-display text-text-primary leading-tight truncate transition-colors">
                                            {item.products?.nama_produk || 'Produk Dihapus'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex items-center gap-1 bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border border-brand-accent/10">
                                                <Package className="w-3 h-3" />
                                                <span>Qty: {item.qty} Pcs</span>
                                            </div>
                                            <span className="text-brand-border">•</span>
                                            <span className="text-xs text-text-tertiary font-medium">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.harga_satuan)} / pcs
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Action Button */}
                                    {(() => {
                                        if (order.status === 'Menunggu Konfirmasi') return null;
                                        if (item.status === 'Menunggu') {
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenStatusModal('Cetak DTF', 'detail', item.id); }}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                                                >
                                                    Cetak
                                                </button>
                                            );
                                        }
                                        if (item.status === 'Cetak DTF') {
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenStatusModal('Sablon', 'detail', item.id); }}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                                                >
                                                    Sablon
                                                </button>
                                            );
                                        }
                                        if (item.status === 'Sablon') {
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenStatusModal('Selesai', 'detail', item.id); }}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                                                >
                                                    Selesai
                                                </button>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* Status Progress Track */}
                                {order.status !== 'Menunggu Konfirmasi' && (
                                    <div className="bg-brand-bg p-5 rounded-3xl border border-brand-border/60">
                                        <div className="mb-3 px-1">
                                            <span className="section-label font-bold text-text-tertiary uppercase tracking-widest text-[10px]">Tahapan Produksi</span>
                                        </div>
                                        <StatusStepper currentStatus={item.status as any} type="detail" />
                                    </div>
                                )}

                                {/* Design Description — Compact Tag Style */}
                                {item.deskripsi_desain && (
                                    <div className="flex flex-wrap gap-1.5 px-0.5">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-bg border border-brand-border/60 rounded-lg max-w-full">
                                            <Tag className="w-2.5 h-2.5 text-text-muted shrink-0" />
                                            <span className="text-xs text-text-tertiary font-medium leading-tight italic truncate">
                                                {item.deskripsi_desain}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Asset Grid */}
                                {item.design_file && item.design_file.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 text-text-tertiary mb-3 ml-1">
                                            <ShoppingCart className="w-3 h-3" />
                                            <span className="section-label font-bold text-text-tertiary uppercase tracking-widest text-[10px]">Aset Desain ({item.design_file.length})</span>
                                        </div>
                                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
                                            {item.design_file.map((path: string, pIdx: number) => {
                                                const isImg = ['jpg', 'jpeg', 'png', 'webp'].includes(path.split('.').pop()?.toLowerCase() || '');
                                                return (
                                                    <a
                                                        key={pIdx}
                                                        href={getOrderFileUrl(path) || '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="relative w-24 aspect-square shrink-0 rounded-xl bg-brand-bg border border-brand-border overflow-hidden ring-1 ring-black/5 active:border-brand-accent transition-all shadow-sm"
                                                    >
                                                        {isImg ? (
                                                            <img
                                                                src={getOrderFileUrl(path) || ''}
                                                                alt="Design"
                                                                className="w-full h-full object-cover transition-all duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-brand-surface">
                                                                <FileText className="w-6 h-6 text-brand-accent/50" />
                                                                <span className="text-[9px] font-bold text-text-muted uppercase">File</span>
                                                            </div>
                                                        )}
                                                        {/* overlay removed — hover-reveal not suitable for mobile */}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Item Subtotal */}
                                <div className="mt-2 pt-4 border-t border-brand-border/60 flex justify-between items-center px-1">
                                    <span className="section-label font-bold text-text-tertiary uppercase tracking-widest text-[10px]">Subtotal Item</span>
                                    <span className="text-sm font-extrabold text-text-primary">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.harga_satuan * item.qty)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
