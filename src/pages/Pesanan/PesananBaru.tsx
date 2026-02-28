import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import type { OrderDetail } from '../../store/orderStore';
import { useMitraStore } from '../../store/mitraStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PesananBaru() {
    const navigate = useNavigate();
    const { addOrder, isLoading } = useOrderStore();
    const { mitras, fetchMitras } = useMitraStore();
    const { products, fetchProducts } = useProductStore();

    const [formData, setFormData] = useState({
        no_pesanan: `RBM-${Math.floor(Math.random() * 10000)}`,
        tanggal: new Date().toISOString().split('T')[0],
        sumber_pesanan: 'Online' as 'Online' | 'Offline',
        mitra_id: '',
        nama_penerima: '',
        kontak_penerima: '',
        alamat_penerima: ''
    });

    const [items, setItems] = useState<Omit<OrderDetail, 'id' | 'o_pesanan' | 'products' | 'status'>[]>([{
        product_id: '',
        harga_satuan: 0,
        qty: 1,
        deskripsi_desain: '',
        design_file: []
    }]);

    useEffect(() => {
        fetchMitras();
        fetchProducts();
    }, [fetchMitras, fetchProducts]);

    const handleProductSelect = (index: number, productId: string) => {
        const prod = products.find(p => p.id === productId);
        const newItems = [...items];
        newItems[index].product_id = productId;
        if (prod) {
            newItems[index].harga_satuan = prod.harga_default;
        }
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.harga_satuan * item.qty), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.some(i => !i.product_id)) {
            alert('Pilih produk untuk semua item sebelum menyimpan.');
            return;
        }

        await addOrder({
            ...formData,
            mitra_id: formData.sumber_pesanan === 'Online' ? formData.mitra_id : null,
            file_resi: null,
            status: 'Menunggu Konfirmasi'
        }, items);

        navigate('/pesanan');
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" className="!p-2 -ml-2" onClick={() => navigate('/pesanan')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Pesanan Baru</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <Card>
                    <h3 className="font-semibold text-lg border-b border-zinc-800 pb-2 mb-4">Data Transaksi</h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-zinc-300">No. Pesanan</label>
                            <input required type="text" value={formData.no_pesanan} onChange={e => setFormData({ ...formData, no_pesanan: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-zinc-300">Tanggal</label>
                            <input required type="date" value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-zinc-300">Sumber Pesanan</label>
                            <select value={formData.sumber_pesanan} onChange={e => setFormData({ ...formData, sumber_pesanan: e.target.value as any })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600">
                                <option value="Online">Online / Mitra</option>
                                <option value="Offline">Offline / Non-Mitra</option>
                            </select>
                        </div>

                        {formData.sumber_pesanan === 'Online' ? (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-zinc-300">Pilih Mitra</label>
                                <select required value={formData.mitra_id} onChange={e => setFormData({ ...formData, mitra_id: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600">
                                    <option value="" disabled>Pilih Mitra B2B</option>
                                    {mitras.map(m => (
                                        <option key={m.id} value={m.id}>{m.nama_mitra}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-300">Nama Penerima</label>
                                    <input required type="text" value={formData.nama_penerima} onChange={e => setFormData({ ...formData, nama_penerima: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-300">Kontak Penerima</label>
                                    <input required type="tel" value={formData.kontak_penerima} onChange={e => setFormData({ ...formData, kontak_penerima: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-300">Alamat Penerima</label>
                                    <textarea required rows={2} value={formData.alamat_penerima} onChange={e => setFormData({ ...formData, alamat_penerima: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-600" />
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4">
                        <h3 className="font-semibold text-lg text-blue-100">Daftar Item</h3>
                        <Button type="button" variant="ghost" className="!p-1.5 text-white drop-shadow-sm" onClick={() => setItems([...items, { product_id: '', harga_satuan: 0, qty: 1, deskripsi_desain: '', design_file: [] }])}>
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="space-y-4 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="block text-sm font-medium text-zinc-300">Produk</label>
                                        <select required value={item.product_id} onChange={e => handleProductSelect(idx, e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-600 truncate">
                                            <option value="" disabled>Pilih Produk</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.nama_produk}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {items.length > 1 && (
                                        <Button type="button" variant="ghost" className="!p-2 text-red-500 hover:text-red-400 mt-6" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <NumberInput label="Harga" value={item.harga_satuan.toString()} onChange={(val) => { const newItems = [...items]; newItems[idx].harga_satuan = parseInt(val || '0', 10); setItems(newItems); }} />
                                    <NumberInput label="Qty" value={item.qty.toString()} onChange={(val) => { const newItems = [...items]; newItems[idx].qty = parseInt(val || '0', 10); setItems(newItems); }} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-zinc-300">Instruksi Desain (Opsional)</label>
                                    <textarea rows={1} value={item.deskripsi_desain || ''} onChange={e => { const newItems = [...items]; newItems[idx].deskripsi_desain = e.target.value; setItems(newItems); }} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-600" placeholder="Letak sablon depan..." />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900 sticky bottom-0">
                        <span className="font-medium text-zinc-400">Total Transaksi</span>
                        <span className="font-bold text-white drop-shadow-sm text-lg">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
                        </span>
                    </div>
                </Card>

                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 flex justify-end gap-3 z-40">
                    <Button type="button" variant="ghost" onClick={() => navigate('/pesanan')}>Batal</Button>
                    <Button type="submit" variant="primary" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30 flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
