import { useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Plus, ChevronRight, Hash, Globe, ShoppingBag, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

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
                    orders.map(order => {
                        const totalQty = order.order_details?.reduce((acc, curr) => acc + curr.qty, 0) || 0;
                        const totalPrice = order.order_details?.reduce((acc, curr) => acc + (curr.qty * curr.harga_satuan), 0) || 0;

                        return (
                            <Link key={order.no_pesanan} to={`/pesanan/${order.no_pesanan}`} className="block transform transition-active active:scale-[0.98]">
                                <Card className="group relative overflow-hidden p-4 border-zinc-800/80 hover:border-blue-700/50 hover:bg-zinc-900/60 transition-all duration-300">
                                    {/* Accent background effect */}
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                            {/* Primary Heading: Nama Mitra */}
                                            <h3 className="text-lg font-bold text-white font-display truncate pr-2 group-hover:text-blue-400 transition-colors">
                                                {order.mitra?.nama_mitra || 'Pelanggan'}
                                            </h3>

                                            {/* Primary Meta: Tanggal */}
                                            <p className="text-zinc-500 text-xs font-medium">
                                                {new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <StatusBadge status={order.status} size="sm" />
                                    </div>

                                    {/* Secondary Info Grid */}
                                    <div className="grid grid-cols-2 gap-y-3 mt-4 pt-4 border-t border-zinc-900">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-zinc-900 rounded-lg text-zinc-500">
                                                <Hash className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">No. Pesanan</span>
                                                <span className="text-xs font-mono text-zinc-400 truncate max-w-[100px]">{order.no_pesanan}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-self-end">
                                            <div className="p-1.5 bg-zinc-900 rounded-lg text-zinc-500">
                                                <Globe className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Sumber</span>
                                                <span className="text-xs text-zinc-400 font-medium">{order.sumber_pesanan}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-zinc-900 rounded-lg text-zinc-500">
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Total Qty</span>
                                                <span className="text-xs text-zinc-300 font-bold">{totalQty} <span className="text-zinc-500 font-normal">Pcs</span></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 justify-self-end">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                                                <Wallet className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Total Harga</span>
                                                <span className="text-xs text-blue-400 font-bold">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Indicator */}
                                    <div className="absolute bottom-4 right-4 text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
