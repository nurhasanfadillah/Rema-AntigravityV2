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
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3">
                <Button variant="outline" className="!p-2 -ml-1 h-10 w-10 rounded-xl border-brand-border active:bg-brand-bg transition-colors" onClick={() => navigate(`/pesanan/${id}`)}>
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </Button>
                <div className="flex-1">
                    <h2 className="page-title font-display">Edit Pesanan</h2>
                    <p className="page-subtitle mt-0.5">Ubah data transaksi pesanan</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <Card className="bg-brand-surface border-brand-border shadow-sm">
                    <h3 className="font-bold border-b border-brand-border pb-3 mb-5 text-text-primary flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-brand-accent rounded-full" />
                        Data Transaksi
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 opacity-70">
                                <label className="form-label font-bold text-text-tertiary">No. Pesanan (Terkunci)</label>
                                <input disabled type="text" value={formData.no_pesanan} className="form-input bg-brand-bg border-brand-border cursor-not-allowed font-bold" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Tanggal</label>
                                <input required type="date" value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} className="form-input bg-brand-bg border-brand-border focus:ring-2 focus:ring-brand-accent/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Sumber Pesanan</label>
                                <select value={formData.sumber_pesanan} onChange={e => setFormData({ ...formData, sumber_pesanan: e.target.value as any })} className="form-input bg-brand-bg border-brand-border font-bold">
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Pilih Mitra</label>
                                <select required value={formData.mitra_id} onChange={e => setFormData({ ...formData, mitra_id: e.target.value })} className="form-input bg-brand-bg border-brand-border font-bold">
                                    <option value="" disabled>Pilih Mitra B2B</option>
                                    {mitras.map(m => (
                                        <option key={m.id} value={m.id}>{m.nama_mitra}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.sumber_pesanan === 'Online' ? (
                            <div className="space-y-2 pt-2">
                                <label className="form-label font-bold text-text-secondary">Update Resi (PDF)</label>
                                <FileResiUpload
                                    value={formData.file_resi || null}
                                    onChange={(path) => setFormData({ ...formData, file_resi: path })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 pt-2 border-t border-brand-border mt-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="form-label font-bold text-text-secondary">Nama Penerima</label>
                                        <input required type="text" value={formData.nama_penerima || ''} onChange={e => setFormData({ ...formData, nama_penerima: e.target.value })} className="form-input bg-brand-bg border-brand-border" placeholder="Nama lengkap" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="form-label font-bold text-text-secondary">Kontak Penerima</label>
                                        <input required type="tel" value={formData.kontak_penerima || ''} onChange={e => setFormData({ ...formData, kontak_penerima: e.target.value })} className="form-input bg-brand-bg border-brand-border" placeholder="0812...." />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Alamat Penerima</label>
                                    <textarea required rows={2} value={formData.alamat_penerima || ''} onChange={e => setFormData({ ...formData, alamat_penerima: e.target.value })} className="form-input bg-brand-bg border-brand-border" placeholder="Alamat lengkap pengiriman..." />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="bg-brand-surface border-brand-border shadow-sm">
                    <div className="flex justify-between items-center border-b border-brand-border pb-3 mb-5">
                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-400 rounded-full" />
                            Daftar Item Produk
                        </h3>
                    </div>

                    <div className="space-y-8">
                        {items.map((item, idx) => (
                            <div key={idx} className="space-y-4 pb-6 border-b border-brand-border last:border-0 last:pb-0 relative animate-fade-in">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="form-label font-bold text-text-tertiary uppercase tracking-widest text-[9px]">Produk Item #{idx + 1}</label>
                                        <select required value={item.product_id} onChange={e => handleProductSelect(idx, e.target.value)} className="form-input bg-brand-bg border-brand-border font-bold text-text-primary">
                                            <option value="" disabled>Pilih Produk</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.nama_produk}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {items.length > 1 && (
                                        <Button type="button" variant="ghost" className="!p-2 text-red-500 active:text-red-600 active:bg-red-50 rounded-xl mt-6 transition-colors border border-transparent active:border-red-100" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <NumberInput label="Harga Satuan" value={item.harga_satuan.toString()} onChange={(val) => { const newItems = [...items]; newItems[idx].harga_satuan = parseInt(val || '0', 10); setItems(newItems); }} />
                                    <NumberInput label="Jumlah (Qty)" value={item.qty.toString()} onChange={(val) => { const newItems = [...items]; newItems[idx].qty = parseInt(val || '0', 10); setItems(newItems); }} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Instruksi Desain & Sablon</label>
                                    <textarea rows={2} value={item.deskripsi_desain || ''} onChange={e => { const newItems = [...items]; newItems[idx].deskripsi_desain = e.target.value; setItems(newItems); }} className="form-input bg-brand-bg border-brand-border focus:ring-2 focus:ring-brand-accent/20" placeholder="Posisikan sablon di tengah dada..." />
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

                        <div className="pt-2">
                            <Button
                                type="button"
                                fullWidth
                                className="!bg-blue-600 !bg-none text-white hover:!bg-blue-700 active:!bg-blue-800 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm transition-colors border-none"
                                style={{ minHeight: '44px' }}
                                onClick={() => setItems([...items, { product_id: '', harga_satuan: 0, qty: 1, deskripsi_desain: '', design_file: [] }])}
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tambah Item Produk</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-brand-border flex justify-between items-center bg-brand-bg/50 -mx-3.5 px-3.5 -mb-3.5 rounded-b-2xl py-4">
                        <div>
                            <span className="section-label font-bold text-text-tertiary block mb-0.5">ESTIMASI TOTAL BARU</span>
                            <span className="text-2xl font-black text-text-primary tracking-tight tabular-nums">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculateTotal())}
                            </span>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 flex gap-3 pb-8">
                    <Button type="button" variant="outline" fullWidth onClick={() => navigate(`/pesanan/${id}`)} className="font-bold border-brand-border active:bg-brand-bg">Batal</Button>
                    <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 font-bold py-3">
                        <Save className="w-5 h-5 text-white/90" />
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
