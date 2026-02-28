import { useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ShoppingCart, Plus, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function PesananList() {
    const { orders, fetchOrders, isLoading } = useOrderStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)] text-white drop-shadow-sm border-blue-700/50';
            case 'Dibatalkan': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Diproses': return 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-300 border-blue-700/30';
            case 'Packing': return 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)] text-white drop-shadow-sm border-blue-700/50';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-gradient-to-r hover:from-blue-800/40 hover:to-blue-700/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Data Pesanan</h2>
                    <p className="text-zinc-400 text-xs mt-0.5">Kelola transaksi pesanan</p>
                </div>
                <Button variant="primary" className="!p-2 bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30" onClick={() => navigate('/pesanan/baru')}>
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <p className="text-center text-zinc-400 py-8">Memuat pesanan...</p>
                ) : orders.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Belum ada pesanan.</p>
                ) : (
                    orders.map(order => (
                        <Link key={order.no_pesanan} to={`/pesanan/${order.no_pesanan}`} className="block">
                            <Card className="hover:border-blue-700/50 hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-blue-800/40 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-white drop-shadow-sm" />
                                        <h4 className="font-bold text-zinc-100">{order.no_pesanan}</h4>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="text-sm text-zinc-300">
                                    <p>{order.sumber_pesanan === 'Online' ? (order.mitra?.nama_mitra || 'Online Customer') : order.nama_penerima}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>

                                {order.order_details && order.order_details.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                        <span className="text-xs text-zinc-500">{order.order_details.length} item(s)</span>
                                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                                    </div>
                                )}
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
