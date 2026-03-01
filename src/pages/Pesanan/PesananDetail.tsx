import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, ShoppingCart, Calendar, MapPin, User, Tag, Trash2, FileText, Package, Globe, Wallet } from 'lucide-react';
import { getOrderFileUrl } from '../../utils/orderStorage';
import { StatusConfirmationModal } from '../../components/orders/StatusConfirmationModal';
import { getOrderTransitionRule, getDetailTransitionRule } from '../../utils/orderRules';
import { StatusBadge, StatusStepper } from '../../components/ui/StatusBadge';

export function PesananDetail() {
    const { id } = useParams<{ id: string }>();
    const { orders, fetchOrders, isLoading, updateOrderStatus, updateOrderDetailStatus, deleteOrder } = useOrderStore();
    const navigate = useNavigate();


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
    const canDelete = order ? !['Diproses', 'Packing', 'Selesai'].includes(order.status) : false;

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

        try {
            if (statusModalConfig.type === 'order') {
                await updateOrderStatus(id, statusModalConfig.targetStatus as any, reason);
                toast.success(`Status pesanan berhasil diubah menjadi ${statusModalConfig.targetStatus}`);
            } else if (statusModalConfig.detailId) {
                await updateOrderDetailStatus(id, statusModalConfig.detailId, statusModalConfig.targetStatus as any);
                toast.success(`Status item berhasil diubah menjadi ${statusModalConfig.targetStatus}`);
            }
            setIsStatusModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengubah status');
        }
    };

    if (isLoading && orders.length === 0) {
        return <div className="p-8 text-center text-zinc-400">Memuat detail pesanan...</div>;
    }

    if (!order) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-zinc-400">Pesanan tidak ditemukan.</p>
                <Link to="/pesanan" className="text-blue-400 hover:underline">Kembali ke Daftar</Link>
            </div>
        );
    }



    const total = order.order_details?.reduce((acc: number, current: any) => acc + (current.qty * current.harga_satuan), 0) || 0;

    return (
        <div className="p-4 space-y-6">
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

            <div className="flex items-center gap-3">
                <Link to="/pesanan" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight font-display">Detail Pesanan</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={order.status} size="sm" />
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">{order.no_pesanan}</span>
                    </div>
                </div>
                {canDelete && (
                    <button onClick={async () => {
                        if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
                            try {
                                await deleteOrder(order.no_pesanan);
                                toast.success('Pesanan berhasil dihapus');
                                navigate('/pesanan');
                            } catch (error) {
                                toast.error('Gagal menghapus pesanan');
                                console.error(error);
                            }
                        }
                    }} className="p-2.5 text-red-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            <Card className="border-blue-900/30 bg-zinc-900/40 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-[120px] pointer-events-none"></div>

                {/* Primary Information Section */}
                <div className="mb-6">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1 block">Pelanggan / Mitra</span>
                    <h1 className="text-2xl font-bold text-white font-display leading-tight">{order.mitra?.nama_mitra || 'Tamu / Walk-in'}</h1>
                </div>

                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-zinc-800/50">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <Wallet className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pembayaran</span>
                        </div>
                        <p className="font-bold text-blue-400 text-xl font-display leading-none">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total)}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {(() => {
                            if (order.status === 'Menunggu Konfirmasi') {
                                return (
                                    <button
                                        onClick={() => handleOpenStatusModal('Diproses', 'order')}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all border border-blue-400/20"
                                    >
                                        Proses Sekarang
                                    </button>
                                );
                            }
                            if (order.status === 'Packing') {
                                return (
                                    <button
                                        onClick={() => handleOpenStatusModal('Selesai', 'order')}
                                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-800 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all border border-emerald-400/20"
                                    >
                                        Selesaikan
                                    </button>
                                );
                            }
                            return <StatusBadge status={order.status} />;
                        })()}
                    </div>
                </div>

                {/* Secondary Meta Info */}
                <div className="grid grid-cols-2 gap-y-5 pt-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Tanggal</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-200">{new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="space-y-1 justify-self-end text-right">
                        <div className="flex items-center gap-1.5 text-zinc-500 justify-end">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Sumber</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-200">{order.sumber_pesanan}</p>
                    </div>

                    {order.sumber_pesanan === 'Offline' && (
                        <div className="col-span-2 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
                            <div className="flex items-center gap-1.5 text-zinc-500 mb-2">
                                <User className="w-3.5 h-3.5 text-blue-500/70" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Informasi Penerima</span>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-sm font-bold text-zinc-100">{order.nama_penerima}</p>
                                <p className="text-xs text-zinc-400">{order.kontak_penerima}</p>
                                {order.alamat_penerima && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-900">
                                        <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-zinc-500 leading-relaxed italic">{order.alamat_penerima}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {order.sumber_pesanan === 'Online' && (
                        <div className="col-span-2 pt-2">
                            <div className="flex items-center gap-1.5 text-zinc-500 mb-2.5">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Dokumen Resi</span>
                            </div>
                            {order.file_resi ? (
                                <a
                                    href={getOrderFileUrl(order.file_resi) || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-900/30 border border-blue-700/30 rounded-xl text-xs font-bold text-blue-300 hover:bg-blue-800/30 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                >
                                    <FileText className="w-4 h-4" />
                                    Buka Resi Pengiriman
                                </a>
                            ) : (
                                <div className="px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <p className="text-[11px] text-red-400/80 italic font-medium">Data resi pengiriman belum diunggah</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <div className="space-y-4 pt-2 pb-24">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg text-white font-display">Informasi Produksi</h3>
                    <div className="px-2.5 py-1 bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-500 border border-zinc-800 uppercase tracking-widest">
                        {order.order_details?.length || 0} Item
                    </div>
                </div>

                {order.order_details?.map((item: any) => {
                    return (
                        <Card key={item.id} className="border-zinc-800/80 bg-zinc-900/20 group pb-6 cursor-pointer hover:border-zinc-700/60 transition-colors" onClick={() => navigate(`/pesanan/detail-item/${item.id}`)}>
                            <div className="flex flex-col gap-5">
                                {/* Product Name & Qty Section - Core Info Level 1 */}
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg text-white font-display leading-tight truncate-multiline group-hover:text-blue-400 transition-colors">
                                            {item.products?.nama_produk || 'Produk Dihapus'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-blue-500/10">
                                                <Package className="w-3 h-3" />
                                                <span>Qty: {item.qty} Pcs</span>
                                            </div>
                                            <span className="text-zinc-700">•</span>
                                            <span className="text-[10px] text-zinc-500 font-medium">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.harga_satuan)} / pcs
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {(() => {
                                        if (order.status === 'Menunggu Konfirmasi') return null;

                                        if (item.status === 'Menunggu') {
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenStatusModal('Cetak DTF', 'detail', item.id); }}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Cetak
                                                </button>
                                            );
                                        }

                                        if (item.status === 'Cetak DTF') {
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenStatusModal('Sablon', 'detail', item.id); }}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-900/30 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Sablon
                                                </button>
                                            );
                                        }

                                        if (item.status === 'Sablon') {
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenStatusModal('Selesai', 'detail', item.id); }}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all"
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
                                    <div className="px-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Tahapan Produksi</span>
                                            <StatusBadge status={item.status} size="sm" />
                                        </div>
                                        <StatusStepper currentStatus={item.status} type="detail" />
                                    </div>
                                )}

                                {/* Design Description - Compact Tag Style */}
                                {item.deskripsi_desain && (
                                    <div className="flex flex-wrap gap-1.5 px-0.5">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-950/60 border border-zinc-800/60 rounded-lg max-w-full">
                                            <Tag className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                                            <span className="text-[11px] text-zinc-300 leading-tight italic truncate">
                                                {item.deskripsi_desain}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Assets Grid */}
                                {item.design_file && item.design_file.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 mb-3 ml-1">
                                            <ShoppingCart className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Aset Desain ({item.design_file.length})</span>
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
                                                        className="relative w-24 aspect-square shrink-0 rounded-xl bg-zinc-950 border border-zinc-800/50 overflow-hidden ring-1 ring-white/5 hover:ring-blue-500 transition-all group"
                                                    >
                                                        {isImg ? (
                                                            <img
                                                                src={getOrderFileUrl(path) || ''}
                                                                alt="Design"
                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                                                                <FileText className="w-6 h-6 text-blue-400/50" />
                                                                <span className="text-[8px] font-bold text-zinc-600 uppercase">File Assets</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-full h-1 bg-blue-500/30 rounded-full overflow-hidden">
                                                                <div className="w-full h-full bg-blue-500"></div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Item Total */}
                                <div className="mt-2 pt-4 border-t border-zinc-800/50 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Subtotal Item</span>
                                    <span className="text-sm font-black text-white">
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
