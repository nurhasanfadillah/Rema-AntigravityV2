import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import type { OrderDetail, Order } from '../../store/orderStore';
import { useMitraStore } from '../../store/mitraStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileResiUpload } from '../../components/Pesanan/FileResiUpload';
import { DesignFileUpload } from '../../components/Pesanan/DesignFileUpload';
import { notify } from '../../utils/notify';

export function PesananEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { orders, fetchOrders, updateOrderData, isLoading } = useOrderStore();
    const { mitras, fetchMitras } = useMitraStore();
    const { products, fetchProducts } = useProductStore();

    const [formData, setFormData] = useState<Partial<Order>>({
        no_pesanan: '',
        tanggal: new Date().toISOString().split('T')[0],
        sumber_pesanan: 'Online' as 'Online' | 'Offline',
        mitra_id: '',
        file_resi: null as string | null,
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


    const [initialLoaded, setInitialLoaded] = useState(false);

    useEffect(() => {
        fetchMitras();
        fetchProducts();
        if (orders.length === 0) {
            fetchOrders();
        }
    }, [fetchMitras, fetchProducts, fetchOrders, orders.length]);

    useEffect(() => {
        if (!initialLoaded && orders.length > 0 && id) {
            const existingOrder = orders.find(o => o.no_pesanan === id);
            if (existingOrder) {
                if (existingOrder.status !== 'Menunggu Konfirmasi') {
                    notify.error('Hanya pesanan berstatus Menunggu Konfirmasi yang dapat diedit.');
                    navigate(`/pesanan/${id}`);
                    return;
                }
                setFormData({
                    no_pesanan: existingOrder.no_pesanan,
                    tanggal: existingOrder.tanggal,
                    sumber_pesanan: existingOrder.sumber_pesanan,
                    mitra_id: existingOrder.mitra_id,
                    file_resi: existingOrder.file_resi,
                    nama_penerima: existingOrder.nama_penerima,
                    kontak_penerima: existingOrder.kontak_penerima,
                    alamat_penerima: existingOrder.alamat_penerima
                });

                if (existingOrder.order_details && existingOrder.order_details.length > 0) {
                    setItems(existingOrder.order_details.map(d => ({
                        product_id: d.product_id,
                        harga_satuan: d.harga_satuan,
                        qty: d.qty,
                        deskripsi_desain: d.deskripsi_desain || '',
                        design_file: d.design_file || []
                    })));
                }
                setInitialLoaded(true);
            }
        }
    }, [orders, id, initialLoaded, navigate]);

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

        if (formData.sumber_pesanan === 'Online' && !formData.file_resi) {
            notify.warning('File Resi (PDF) wajib diunggah untuk pesanan Online.');
            return;
        }

        if (items.some(i => !i.product_id)) {
            notify.warning('Pilih produk untuk semua item sebelum menyimpan.');
            return;
        }

        const toastId = notify.loading('Menyimpan perubahan pesanan...');
        try {
            await updateOrderData(formData.no_pesanan as string, {
                tanggal: formData.tanggal,
                sumber_pesanan: formData.sumber_pesanan,
                mitra_id: formData.mitra_id,
                file_resi: formData.file_resi,
                nama_penerima: formData.nama_penerima,
                kontak_penerima: formData.kontak_penerima,
                alamat_penerima: formData.alamat_penerima
            }, items);

            notify.success('Pesanan berhasil diperbarui', toastId);
            navigate(`/pesanan/${formData.no_pesanan}`);
        } catch (error: any) {
            notify.error(error.message || 'Gagal menyimpan perubahan pesanan.', toastId);
            console.error(error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" className="!p-2 -ml-2" onClick={() => navigate('/pesanan')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="page-title font-display">Pesanan Baru</h2>
                    <p className="page-subtitle mt-0.5">Buat transaksi pesanan baru</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <Card>
                    <h3 className="font-semibold border-b border-zinc-800 pb-2.5 mb-4 text-zinc-100">Data Transaksi</h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5 opacity-60">
                            <label className="form-label">No. Pesanan</label>
                            <input disabled type="text" value={formData.no_pesanan} className="form-input cursor-not-allowed" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="form-label">Tanggal</label>
                            <input required type="date" value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} className="form-input" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="form-label">Sumber Pesanan</label>
                            <select value={formData.sumber_pesanan} onChange={e => setFormData({ ...formData, sumber_pesanan: e.target.value as any })} className="form-input">
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="form-label">Pilih Mitra</label>
                            <select required value={formData.mitra_id} onChange={e => setFormData({ ...formData, mitra_id: e.target.value })} className="form-input">
                                <option value="" disabled>Pilih Mitra B2B</option>
                                {mitras.map(m => (
                                    <option key={m.id} value={m.id}>{m.nama_mitra}</option>
                                ))}
                            </select>
                        </div>

                        {formData.sumber_pesanan === 'Online' ? (
                            <div className="space-y-1.5 pt-2">
                                <label className="form-label">Upload Resi (PDF)</label>
                                <FileResiUpload
                                    value={formData.file_resi || null}
                                    onChange={(path) => setFormData({ ...formData, file_resi: path })}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="form-label">Nama Penerima</label>
                                    <input required type="text" value={formData.nama_penerima || ''} onChange={e => setFormData({ ...formData, nama_penerima: e.target.value })} className="form-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="form-label">Kontak Penerima</label>
                                    <input required type="tel" value={formData.kontak_penerima || ''} onChange={e => setFormData({ ...formData, kontak_penerima: e.target.value })} className="form-input" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="form-label">Alamat Penerima</label>
                                    <textarea required rows={2} value={formData.alamat_penerima || ''} onChange={e => setFormData({ ...formData, alamat_penerima: e.target.value })} className="form-input" />
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 mb-4">
                        <h3 className="font-semibold text-zinc-100">Daftar Item</h3>
                        <Button type="button" variant="ghost" className="!p-1.5 text-white drop-shadow-sm" onClick={() => setItems([...items, { product_id: '', harga_satuan: 0, qty: 1, deskripsi_desain: '', design_file: [] }])}>
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="space-y-4 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="form-label">Produk</label>
                                        <select required value={item.product_id} onChange={e => handleProductSelect(idx, e.target.value)} className="form-input bg-zinc-900">
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
                                    <label className="form-label">Instruksi Desain (Opsional)</label>
                                    <textarea rows={1} value={item.deskripsi_desain || ''} onChange={e => { const newItems = [...items]; newItems[idx].deskripsi_desain = e.target.value; setItems(newItems); }} className="form-input bg-zinc-900 mb-2" placeholder="Letak sablon depan..." />
                                </div>

                                <DesignFileUpload
                                    value={item.design_file}
                                    onChange={(paths) => {
                                        const newItems = [...items];
                                        newItems[idx].design_file = paths;
                                        setItems(newItems);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                        <span className="section-label">Total Transaksi</span>
                        <span className="font-bold text-zinc-100 text-lg">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
                        </span>
                    </div>
                </Card>

                <div className="mt-8 flex justify-end gap-3 pb-8">
                    <Button type="button" variant="ghost" onClick={() => navigate('/pesanan')}>Batal</Button>
                    <Button type="submit" variant="primary" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 active:from-blue-700 active:to-blue-900 border-blue-700/50 shadow-lg shadow-blue-900/40 flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
