import { useEffect, useState } from 'react';
import { useOrderStore, type Order } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, ShoppingBag, ExternalLink, Package, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

function PesananListItem({ order }: { order: Order }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalQty = order.order_details?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

    return (
        <Card className={`group relative overflow-hidden flex flex-col border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 ${isExpanded ? 'border-zinc-700/80 bg-zinc-900/40' : 'bg-transparent hover:bg-zinc-900/20'}`}>
            {/* Accent background effect left edge */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl transition-colors duration-300 ${isExpanded ? 'bg-gradient-to-b from-blue-500 to-blue-700' : 'bg-gradient-to-b from-zinc-700 to-zinc-800 group-hover:from-blue-600/50 group-hover:to-blue-900/50'}`}></div>

            {/* Main Row / Header */}
            <div
                className="flex items-start justify-between p-4 pl-5 cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Left Side: Mitra, Date, Package Info */}
                <div className="flex flex-col gap-1 items-start flex-1 min-w-0 pr-4">
                    <h3 className="text-[17px] font-bold text-white font-display truncate w-full group-hover:text-blue-400 transition-colors tracking-tight leading-none mb-0.5">
                        {order.mitra?.nama_mitra || 'Pelanggan'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1 text-zinc-500 text-[11px] font-medium tracking-wide w-full">
                        <span className="shrink-0 flex items-center gap-1">
                            <History className="w-3 h-3 text-zinc-600" />
                            {new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
                        <span className="font-mono text-zinc-400 shrink-0 uppercase tracking-wider">{order.no_pesanan}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
                        <span className="text-zinc-300 shrink-0 flex items-center gap-1 font-semibold">
                            <Package className="w-3 h-3 text-zinc-500" />
                            {totalQty} Pcs
                        </span>
                    </div>
                </div>

                {/* Right Side: Status Badge & Actions */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                    <StatusBadge status={order.status} size="sm" />

                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Link
                            to={`/pesanan/${order.no_pesanan}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center justify-center"
                            title="Buka Detail Lengkap"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${isExpanded ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                            title={isExpanded ? "Tutup Detail" : "Buka Detail"}
                        >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-1 pb-4 pl-5">
                        <div className="pt-3 border-t border-zinc-800/80">
                            {order.order_details && order.order_details.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {order.order_details.map((detail, idx) => (
                                        <div key={detail.id || idx} className="flex gap-3 items-start border-l-2 border-zinc-800 pl-3 py-0.5 group/detail hover:border-zinc-600 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-zinc-200 truncate pr-2 group-hover/detail:text-white transition-colors">
                                                        {detail.products?.nama_produk || 'Produk Tanpa Nama'}
                                                    </h4>
                                                    <span className="text-xs font-bold text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                        {detail.qty} Pcs
                                                    </span>
                                                </div>
                                                {detail.deskripsi_desain ? (
                                                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed max-w-[90%]">
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
        <div className="p-4 flex flex-col min-h-screen pb-24">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-6">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight font-display">Data Pesanan</h2>
                    <p className="text-zinc-500 text-xs mt-0.5">Kelola transaksi dan progres pesanan</p>
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
            <div className="grid gap-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4"></div>
                        <p className="text-center text-zinc-500">Memuat pesanan...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                        <ShoppingBag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">Belum ada pesanan yang dicatat.</p>
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
