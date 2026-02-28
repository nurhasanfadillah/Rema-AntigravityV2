import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, ShoppingCart, Calendar, MapPin, User, Tag, Edit2, Trash2, CheckCircle } from 'lucide-react';

export function PesananDetail() {
    const { id } = useParams<{ id: string }>();
    const { orders, fetchOrders, isLoading, updateOrderStatus, deleteOrder } = useOrderStore();
    const navigate = useNavigate();

    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    useEffect(() => {
        if (orders.length === 0) fetchOrders();
    }, [orders.length, fetchOrders]);

    const order = orders.find(o => o.no_pesanan === id);

    if (isLoading) {
        return <div className="p-8 text-center text-zinc-400">Memuat detail pesanan...</div>;
    }

    if (!order) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-zinc-400">Pesanan tidak ditemukan.</p>
                <Link to="/pesanan" className="text-orange-400 hover:underline">Kembali ke Daftar</Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Dibatalkan': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Diproses': return 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-300 border-blue-700/30';
            case 'Packing': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    const total = order.order_details?.reduce((acc, current) => acc + (current.qty * current.harga_satuan), 0) || 0;

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/pesanan" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-gradient-to-r hover:from-blue-800/40 hover:to-blue-700/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Detail Pesanan</h2>
                    <p className="text-orange-400 text-xs mt-0.5 font-mono">{order.no_pesanan}</p>
                </div>
                <button onClick={async () => {
                    if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
                        await deleteOrder(order.no_pesanan);
                        navigate('/pesanan');
                    }
                }} className="p-2 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <Card className="space-y-4 border-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[100px] pointer-events-none"></div>

                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-zinc-400" />
                            {!isEditingStatus ? (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            ) : (
                                <select
                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                    <option value="Diproses">Diproses</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                            )}

                            {!isEditingStatus ? (
                                <button onClick={() => { setIsEditingStatus(true); setNewStatus(order.status); }} className="p-1 text-zinc-400 hover:text-blue-300 rounded hover:bg-gradient-to-r from-blue-900/40 to-blue-800/40">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <button onClick={async () => {
                                    await updateOrderStatus(order.no_pesanan, newStatus as any);
                                    setIsEditingStatus(false);
                                }} className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-500/10">
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500">Total Transaksi</p>
                        <p className="font-bold text-orange-400 text-lg">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                    <div>
                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">Tanggal</span>
                        </div>
                        <p className="text-sm text-zinc-200">{new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            <Tag className="w-3.5 h-3.5" />
                            <span className="text-xs">Sumber</span>
                        </div>
                        <p className="text-sm text-zinc-200">{order.sumber_pesanan}</p>
                    </div>
                    <div className="col-span-2">
                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-xs">Pelanggan</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-200">
                            {order.sumber_pesanan === 'Online' ? order.mitra?.nama_mitra : order.nama_penerima}
                        </p>
                        {order.sumber_pesanan === 'Offline' && <p className="text-xs text-zinc-400">{order.kontak_penerima}</p>}
                    </div>
                    {order.sumber_pesanan === 'Offline' && order.alamat_penerima && (
                        <div className="col-span-2">
                            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-xs">Alamat Kirim</span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed">{order.alamat_penerima}</p>
                        </div>
                    )}
                </div>
            </Card>

            <div className="space-y-3">
                <h3 className="font-semibold text-lg text-zinc-200 pl-1">Daftar Item ({order.order_details?.length || 0})</h3>

                {order.order_details?.map((item) => (
                    <Card key={item.id} className="border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-zinc-100 pr-2">{item.products?.nama_produk || 'Produk Dihapus'}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap border ${item.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : item.status === 'Menunggu' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-300 border-blue-700/30'}`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500">Harga x Qty</p>
                                <p className="text-sm text-zinc-300">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.harga_satuan)} x <span className="font-mono text-white">{item.qty}</span>
                                </p>
                            </div>
                            <p className="font-bold text-zinc-200">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.harga_satuan * item.qty)}
                            </p>
                        </div>

                        {item.deskripsi_desain && (
                            <div className="mt-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-1">Instruksi Desain</p>
                                <p className="text-sm text-zinc-300 italic">"{item.deskripsi_desain}"</p>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
