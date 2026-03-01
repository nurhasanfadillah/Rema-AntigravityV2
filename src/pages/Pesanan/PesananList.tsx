import { useEffect, useState } from 'react';
import { useOrderStore, type Order } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Plus, ChevronDown, ShoppingBag, Package, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

function PesananListItem({ order }: { order: Order }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const totalQty = order.order_details?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

    return (
        <Card className={`group relative overflow-hidden flex flex-col border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 !p-0 ${isExpanded ? 'border-zinc-700/80 bg-zinc-900/40' : 'bg-transparent hover:bg-zinc-900/20'}`}>
            {/* Accent left edge */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl transition-colors duration-300 ${isExpanded ? 'bg-gradient-to-b from-blue-500 to-blue-700' : 'bg-gradient-to-b from-zinc-700 to-zinc-800 group-hover:from-blue-600/50 group-hover:to-blue-900/50'}`}></div>

            {/* Main Clickable Area — Navigate to Order Detail */}
            <div
                className="flex-1 cursor-pointer select-none active:bg-zinc-800/20 transition-colors"
                onClick={() => navigate(`/pesanan/${order.no_pesanan}`)}
            >
                {/* Main Row / Header */}
                <div className="flex items-start justify-between pt-4 pb-3 px-4 pl-5">
                    {/* Left: Mitra, Meta Info */}
                    <div className="flex flex-col gap-1 items-start flex-1 min-w-0 pr-4">
                        <h3 className="text-[15px] font-bold text-zinc-100 font-display truncate w-full group-hover:text-blue-400 transition-colors tracking-tight leading-tight">
                            {order.mitra?.nama_mitra || 'Pelanggan'}
                        </h3>
                        {/* Meta row: tanggal • no pesanan • qty */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 w-full">
                            <span className="shrink-0 flex items-center gap-1 text-xs text-zinc-500">
                                <History className="w-3 h-3 text-zinc-600" />
                                {new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
                            <span className="font-mono text-xs text-zinc-500 shrink-0 uppercase tracking-wider">{order.no_pesanan}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
                            <span className="text-xs text-zinc-400 shrink-0 flex items-center gap-1 font-semibold">
                                <Package className="w-2.5 h-2.5 text-zinc-600" />
                                {totalQty} Pcs
                            </span>
                        </div>
                    </div>

                    {/* Right: Status Badge */}
                    <div className="flex flex-col items-end shrink-0">
                        <StatusBadge status={order.status} size="sm" />
                    </div>
                </div>

                {/* Expanded Content */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 pb-2' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="px-4 pl-5">
                            <div className="pt-3 border-t border-zinc-800/80">
                                {order.order_details && order.order_details.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {order.order_details.map((detail, idx) => (
                                            <div
                                                key={detail.id || idx}
                                                className="flex gap-2.5 items-start border-l-2 border-zinc-800 pl-2.5 py-1.5 group/detail hover:border-blue-500/50 hover:bg-zinc-800/40 active:bg-zinc-800/60 rounded-r-lg transition-all cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/pesanan/detail-item/${detail.id}`);
                                                }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <h4 className="text-sm font-semibold text-zinc-300 truncate pr-2 group-hover/detail:text-blue-400 transition-colors">
                                                            {detail.products?.nama_produk || 'Produk Tanpa Nama'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded transition-colors group-hover/detail:bg-zinc-700 shrink-0">
                                                            {detail.qty} Pcs
                                                        </span>
                                                    </div>
                                                    {detail.deskripsi_desain ? (
                                                        <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed italic">
                                                            {detail.deskripsi_desain}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-zinc-600 italic">Tanpa deskripsi</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-2 text-center">
                                        <p className="text-xs text-zinc-600 italic">Detail pesanan kosong.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expand / Collapse Handle */}
            <div
                className="w-full flex flex-col items-center justify-center py-1.5 cursor-pointer hover:bg-zinc-800/40 active:bg-zinc-800/60 transition-all border-t border-zinc-900 min-h-[22px]"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
            >
                <div className={`w-10 h-1 rounded-full transition-all duration-300 ${isExpanded ? 'bg-blue-500/40' : 'bg-zinc-800 group-hover:bg-zinc-700'}`}></div>
                <ChevronDown className={`w-3 h-3 mt-1 text-zinc-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`} />
            </div>
        </Card>
    );
}

export function PesananList() {
    const { orders, fetchOrders, isLoading } = useOrderStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="p-4 flex flex-col min-h-screen pb-24 max-w-2xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-5">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Data Pesanan</h2>
                    <p className="page-subtitle mt-0.5">Kelola transaksi dan progres pesanan</p>
                </div>
                <Button
                    variant="primary"
                    className="!p-2.5 bg-gradient-to-br from-blue-600 to-blue-900 border-none shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all"
                    onClick={() => navigate('/pesanan/baru')}
                >
                    <Plus className="w-5 h-5 text-white" />
                </Button>
            </div>

            {/* List Section */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4"></div>
                        <p className="text-sm text-zinc-500">Memuat pesanan...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                        <ShoppingBag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">Belum ada pesanan yang dicatat.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <PesananListItem key={order.no_pesanan} order={order} />
                    ))
                )}
            </div>
        </div>
    );
}
