import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/orderStore';
import type { OrderDetail } from '../../store/orderStore';
import { useMitraStore } from '../../store/mitraStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Trash2, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileResiUpload } from '../../components/Pesanan/FileResiUpload';
import { DesignFileUpload } from '../../components/Pesanan/DesignFileUpload';
import { deleteOrderFile } from '../../utils/orderStorage';
import { notify } from '../../utils/notify';

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

        if (formData.sumber_pesanan === 'Online' && !formData.file_resi) {
            notify.warning('File Resi (PDF) wajib diunggah untuk pesanan Online.');
            return;
        }

        if (items.some(i => !i.product_id)) {
            notify.warning('Pilih produk untuk semua item sebelum menyimpan.');
            return;
        }

        if (items.some(i => !i.harga_satuan || i.harga_satuan <= 0 || !i.qty || i.qty <= 0)) {
            notify.warning('Pastikan Qty dan Harga Satuan pada semua produk lebih dari 0.');
            return;
        }

        const toastId = notify.loading('Menyimpan pesanan baru...');
        try {
            await addOrder({
                ...formData,
                status: 'Menunggu Konfirmasi'
            }, items);

            notify.success('Pesanan berhasil dibuat', toastId);
            navigate('/pesanan');
        } catch (error) {
            // Prevent orphan files: attempt to rollback uploaded files
            if (formData.file_resi) {
                await deleteOrderFile(formData.file_resi);
            }
            for (const item of items) {
                if (item.design_file && item.design_file.length > 0) {
                    for (const path of item.design_file) {
                        await deleteOrderFile(path);
                    }
                }
            }

            notify.error('Gagal membuat pesanan. File yang diupload telah dibersihkan.', toastId);
            console.error(error);
        }
    };

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3">
                <Button variant="outline" className="!p-2 -ml-1 h-10 w-10 rounded-xl border-brand-border active:bg-brand-bg transition-colors" onClick={() => navigate('/pesanan')}>
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </Button>
                <div className="flex-1">
                    <h2 className="page-title font-display">Pesanan Baru</h2>
                    <p className="page-subtitle mt-0.5">Buat transaksi pesanan baru</p>
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
                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">No. Pesanan</label>
                                <div className="form-input bg-brand-bg/50 border-brand-border text-text-primary font-bold h-11 flex items-center">{formData.no_pesanan}</div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Tanggal</label>
                                <div className="form-input bg-brand-bg/50 border-brand-border text-text-primary font-bold h-11 flex items-center">
                                    {new Date(formData.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
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
                                <label className="form-label font-bold text-text-secondary">Upload Resi (PDF)</label>
                                <FileResiUpload
                                    value={formData.file_resi}
                                    onChange={(path) => setFormData({ ...formData, file_resi: path })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 pt-2 border-t border-brand-border mt-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="form-label font-bold text-text-secondary">Nama Penerima</label>
                                        <input required type="text" value={formData.nama_penerima} onChange={e => setFormData({ ...formData, nama_penerima: e.target.value })} className="form-input bg-brand-bg border-brand-border" placeholder="Nama lengkap" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="form-label font-bold text-text-secondary">Kontak Penerima</label>
                                        <input required type="tel" value={formData.kontak_penerima} onChange={e => setFormData({ ...formData, kontak_penerima: e.target.value })} className="form-input bg-brand-bg border-brand-border" placeholder="0812...." />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Alamat Penerima</label>
                                    <textarea required rows={2} value={formData.alamat_penerima} onChange={e => setFormData({ ...formData, alamat_penerima: e.target.value })} className="form-input bg-brand-bg border-brand-border" placeholder="Alamat lengkap pengiriman..." />
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
                                    <div className="space-y-1.5 relative w-full">
                                        <label className="form-label font-bold text-text-secondary">Harga Satuan</label>
                                        <input
                                            required
                                            type="text"
                                            inputMode="numeric"
                                            value={item.harga_satuan || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const newAmt = parseInt(val, 10);
                                                const newItems = [...items];
                                                newItems[idx].harga_satuan = isNaN(newAmt) ? 0 : newAmt;
                                                setItems(newItems);
                                            }}
                                            className={`form-input bg-brand-bg border-brand-border focus:ring-2 focus:ring-brand-accent/20 ${!item.harga_satuan || item.harga_satuan <= 0 ? 'border-status-error-text/50 focus:ring-status-error-text/20 !bg-status-error-bg' : ''}`}
                                            placeholder="0"
                                        />
                                        {(!item.harga_satuan || item.harga_satuan <= 0) && <p className="text-[10px] text-status-error-text mt-1 font-bold">Harga harus &gt; 0</p>}
                                    </div>
                                    <div className="space-y-1.5 relative w-full">
                                        <label className="form-label font-bold text-text-secondary">Jumlah (Qty)</label>
                                        <input
                                            required
                                            type="text"
                                            inputMode="numeric"
                                            value={item.qty || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const newAmt = parseInt(val, 10);
                                                const newItems = [...items];
                                                newItems[idx].qty = isNaN(newAmt) ? 0 : newAmt;
                                                setItems(newItems);
                                            }}
                                            className={`form-input bg-brand-bg border-brand-border focus:ring-2 focus:ring-brand-accent/20 ${!item.qty || item.qty <= 0 ? 'border-status-error-text/50 focus:ring-status-error-text/20 !bg-status-error-bg' : ''}`}
                                            placeholder="1"
                                        />
                                        {(!item.qty || item.qty <= 0) && <p className="text-[10px] text-status-error-text mt-1 font-bold">Qty minimal 1</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Catatan & Deskripsi Desain</label>
                                    <textarea rows={2} value={item.deskripsi_desain || ''} onChange={e => { const newItems = [...items]; newItems[idx].deskripsi_desain = e.target.value; setItems(newItems); }} className="form-input bg-brand-bg border-brand-border focus:ring-2 focus:ring-brand-accent/20" placeholder="Contoh: Logo depan dada kiri, tulisan belakang punggung..." />
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
                                <PackagePlus className="w-5 h-5" />
                                <span>Tambah Item Produk</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-brand-border flex justify-between items-center bg-brand-bg/50 -mx-3.5 px-3.5 -mb-3.5 rounded-b-2xl py-4">
                        <div>
                            <span className="section-label font-bold text-text-tertiary block mb-0.5">ESTIMASI TOTAL</span>
                            <span className="text-2xl font-black text-text-primary tracking-tight tabular-nums">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculateTotal())}
                            </span>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 flex gap-3 pb-8">
                    <Button type="button" variant="outline" fullWidth onClick={() => navigate('/pesanan')} className="font-bold border-brand-border active:bg-brand-bg">Batal</Button>
                    <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 font-bold py-3">
                        {isLoading ? 'Menyimpan...' : 'Buat Pesanan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
