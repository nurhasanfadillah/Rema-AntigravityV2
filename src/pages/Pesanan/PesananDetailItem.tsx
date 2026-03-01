import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, FileText, Globe, User, MapPin, Search, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getOrderFileUrl } from '../../utils/orderStorage';

export function PesananDetailItem() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { orders, fetchOrders, isLoading } = useOrderStore();

    useEffect(() => {
        if (orders.length === 0) {
            fetchOrders();
        }
    }, [orders.length, fetchOrders]);

    // Find the parent order and the specific detail item
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
                <p className="text-zinc-400 mb-4">Item pesanan tidak ditemukan atau sedang dimuat.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-xl hover:bg-zinc-700 transition-colors">
                    Kembali
                </button>
            </div>
        );
    }

    const otherItems = parentOrder.order_details?.filter(d => d.id !== id) || [];

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 animate-in slide-in-from-right-4 duration-300 pb-10">
            {/* Header Sticky */}
            <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40 border-b border-zinc-900 p-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold tracking-tight truncate">Detail Item</h2>
                    <p className="text-[11px] text-zinc-400 truncate">{item.products?.nama_produk || 'Produk'}</p>
                </div>
                <StatusBadge status={item.status} size="sm" />
            </div>

            <div className="p-5 space-y-8 hide-scrollbar">
                {/* Section: Design Information */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Tag className="w-4 h-4" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Deskripsi Desain</h4>
                    </div>
                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 leading-relaxed italic text-zinc-300 text-sm">
                        "{item.deskripsi_desain || 'Tidak ada deskripsi'}"
                    </div>
                </div>

                {/* Section: Design Files */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <FileText className="w-4 h-4" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Aset File Desain</h4>
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
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase">Dokumen</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="w-5 h-5 text-white" />
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="col-span-2 py-8 text-center bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-xs italic">
                                Belum ada file desain yang diunggah
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Fulfillment Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Globe className="w-4 h-4" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">
                            {parentOrder.sumber_pesanan === 'Online' ? 'File Resi (Online)' : 'Detail Pengiriman (Offline)'}
                        </h4>
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
                            <div className="p-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 text-xs">
                                Resi belum tersedia
                            </div>
                        )
                    ) : (
                        <div className="space-y-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-sm">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-zinc-500" />
                                <span className="font-bold text-zinc-200">{parentOrder.nama_penerima || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-zinc-600 ml-7 tracking-wider">{parentOrder.kontak_penerima || '-'}</span>
                            </div>
                            <div className="flex items-start gap-3 pt-2">
                                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                <span className="text-zinc-400 leading-relaxed italic">{parentOrder.alamat_penerima || '-'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section: Related Items */}
                <div className="pt-6 border-t border-zinc-900 pb-10">
                    <div className="flex items-center gap-2 mb-4 text-zinc-500">
                        <Search className="w-3.5 h-3.5" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Item Lain dalam Pesanan Ini</h4>
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
                                        <span className="text-[11px] font-bold text-zinc-300 truncate">{other.products?.nama_produk}</span>
                                        <span className="text-zinc-600 text-[11px]"> – </span>
                                        <span className="text-[9px] text-zinc-500 truncate max-w-[100px] italic">
                                            {other.deskripsi_desain || 'Tanpa deskripsi'}
                                        </span>
                                        <span className="text-zinc-600 text-[11px]"> – </span>
                                        <span className="text-[10px] font-black text-zinc-600 shrink-0">{other.qty} PCS</span>
                                        <span className="text-zinc-600 text-[11px]"> – </span>
                                        <StatusBadge status={other.status} size="sm" className="shrink-0 scale-90 origin-left" />
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all ml-1 shrink-0" />
                                </button>
                            ))
                        ) : (
                            <p className="text-[10px] text-zinc-600 italic pl-1">Tidak ada item lain</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
