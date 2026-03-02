import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { Plus, ArrowLeft, Package, Edit2, Trash2, X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductImageUpload } from '../../components/Produk/ProductImageUpload';
import { getImageUrl, deleteProductImage } from '../../utils/storage';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';

export function ProdukList() {
    const { categories, fetchCategories } = useCategoryStore();
    const { products, fetchProducts, isLoading, addProduct, updateProduct, deleteProduct, activeOrderQtyMap } = useProductStore();
    const { confirm, ConfirmDialog } = useConfirmation();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nama_produk: '',
        category_id: '',
        deskripsi: '',
        harga_default: '',
        status: 'Aktif' as 'Aktif' | 'Tidak Aktif',
        foto_produk: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ nama_produk: '', category_id: '', deskripsi: '', harga_default: '', status: 'Aktif', foto_produk: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nama_produk.trim()) {
            notify.warning('Nama produk wajib diisi');
            return;
        }

        const payload = {
            ...formData,
            nama_produk: formData.nama_produk.trim(),
            category_id: formData.category_id || null,
            harga_default: formData.harga_default ? parseInt(formData.harga_default.toString(), 10) : 0,
            foto_produk: formData.foto_produk || null
        };

        const toastId = notify.loading(editingId ? 'Memperbarui produk...' : 'Menyimpan produk...');
        try {
            if (editingId) {
                await updateProduct(editingId, payload);
                notify.success('Produk berhasil diperbarui', toastId);
            } else {
                await addProduct(payload);
                notify.success('Produk berhasil ditambahkan', toastId);
            }

            handleCancel();
        } catch (error) {
            handleBackendError(error, 'Gagal menyimpan data produk', toastId, 'Produk');
        }
    };

    const handleEdit = (prod: any) => {
        setFormData({
            nama_produk: prod.nama_produk,
            category_id: prod.category_id || '',
            deskripsi: prod.deskripsi || '',
            harga_default: prod.harga_default ? prod.harga_default.toString() : '',
            status: prod.status,
            foto_produk: prod.foto_produk || ''
        });
        setEditingId(prod.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (prod: any) => {
        const activeQty = activeOrderQtyMap[prod.id] || 0;
        const consequences = [
            'Foto produk juga akan dihapus dari storage.',
            'Produk tidak dapat dipulihkan setelah dihapus.',
        ];
        if (activeQty > 0) {
            consequences.unshift(`Produk ini memiliki ${activeQty} pcs pada pesanan aktif (Diproses).`);
        }
        consequences.push('Sistem akan mencegah penghapusan jika masih ada pesanan terkait.');

        const { confirmed } = await confirm({
            title: 'Hapus Produk?',
            description: 'Tindakan ini bersifat destruktif dan akan menghapus produk beserta foto yang telah diunggah.',
            subject: prod.nama_produk,
            variant: 'danger',
            confirmLabel: 'Hapus Permanen',
            requiresDoubleConfirm: true,
            consequences,
        });
        if (!confirmed) return;

        const toastId = notify.loading('Menghapus produk...');
        try {
            if (prod.foto_produk) {
                await deleteProductImage(prod.foto_produk);
            }
            await deleteProduct(prod.id);
            notify.success('Produk berhasil dihapus', toastId);
        } catch (error) {
            handleBackendError(error, 'Gagal menghapus produk', toastId, 'Produk');
        }
    };

    // Filter out item being edited
    const visibleProducts = products.filter(p => p.id !== editingId);

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full min-h-screen pb-24">
            <ConfirmDialog />
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-xl active:bg-brand-border/40 transition-all active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display tracking-tight">Data Produk</h2>
                    <p className="page-subtitle mt-0.5">Kelola daftar produk dan harga</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2.5 shadow-lg shadow-blue-600/20 active:scale-95" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Add / Edit Form */}
            {showAddForm && (
                <Card className="border-brand-accent/20 shadow-xl shadow-black/[0.04] bg-brand-surface animate-slide-up relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center justify-between border-b border-brand-border pb-3.5">
                            <h3 className="font-bold text-text-primary text-[17px] font-display">
                                {editingId ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                            </h3>
                            <button type="button" onClick={handleCancel} className="text-text-tertiary active:opacity-60 p-1 transition-opacity">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary flex items-center gap-1.5">
                                    Nama Produk <span className="text-red-500">*</span>
                                </label>
                                <input required type="text" value={formData.nama_produk}
                                    onChange={e => setFormData({ ...formData, nama_produk: e.target.value })}
                                    className="form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all" placeholder="Pouch Custom Logo..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary flex items-center gap-1.5">
                                        Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        className="form-input appearance-none bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all"
                                    >
                                        <option value="" disabled>Pilih Kategori</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Status</label>
                                    <select
                                        className="form-input bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Tidak Aktif">Tidak Aktif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Deskripsi</label>
                                <textarea rows={2} value={formData.deskripsi}
                                    onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                                    className="form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all resize-none" placeholder="Bahan kanvas, ukuran 20x15..." />
                            </div>

                            <ProductImageUpload
                                value={formData.foto_produk}
                                onChange={(path) => setFormData({ ...formData, foto_produk: path || '' })}
                            />

                            <NumberInput
                                label="Harga Default (Rp)"
                                value={formData.harga_default.toString()}
                                onChange={(val) => setFormData({ ...formData, harga_default: val })}
                                placeholder="45000"
                            />
                        </div>

                        <div className="flex gap-3 pt-3">
                            <Button type="button" variant="outline" fullWidth onClick={handleCancel} className="font-bold py-3">Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="font-bold py-3">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Produk')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="space-y-4">
                {isLoading && !showAddForm ? (
                    <div className="flex flex-col items-center py-16 gap-4">
                        <div className="w-10 h-10 border-[3px] border-brand-accent/10 border-t-brand-accent rounded-full animate-spin" />
                        <p className="text-center text-text-tertiary text-sm font-bold tracking-wide">Memuat produk...</p>
                    </div>
                ) : visibleProducts.length === 0 && !editingId ? (
                    <div className="text-center py-20 px-6 rounded-[32px] border-2 border-dashed border-brand-border bg-brand-surface/30">
                        <div className="bg-brand-bg w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-text-tertiary/40" />
                        </div>
                        <h4 className="text-text-primary font-bold text-lg font-display">Belum ada data produk</h4>
                        <p className="text-text-tertiary text-sm mt-1.5 max-w-[240px] mx-auto leading-relaxed">Gunakan tombol (+) untuk menambah produk baru.</p>
                        <Button variant="outline" size="sm" className="mt-6 font-bold border-brand-accent/20 text-brand-accent" onClick={() => setShowAddForm(true)}>
                            Tambah Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {visibleProducts.map(prod => {
                            const activeQty = activeOrderQtyMap[prod.id] || 0;

                            return (
                                <Card key={prod.id} className="transition-all duration-150 bg-brand-surface shadow-sm border-brand-border px-5 py-5 overflow-hidden active:scale-[0.99] relative">
                                    <div className="flex items-start gap-3.5">
                                        {/* Product Image */}
                                        <div className="relative aspect-square w-[72px] bg-brand-bg border border-brand-border rounded-xl shrink-0 overflow-hidden">
                                            {prod.foto_produk ? (
                                                <img src={getImageUrl(prod.foto_produk) || ''} alt={prod.nama_produk}
                                                    className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-brand-border">
                                                    <Package className="w-7 h-7 opacity-40" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-extrabold text-text-primary truncate pr-2 text-[15px] font-display">
                                                    {prod.nama_produk}
                                                </h4>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <StatusBadge status={prod.status as any} size="sm" />
                                                    <button onClick={() => handleEdit(prod)}
                                                        className="p-2 text-text-tertiary rounded-xl active:bg-brand-accent/10 active:text-brand-accent transition-all border border-transparent active:border-brand-accent/10 active:scale-90">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(prod)}
                                                        className="p-2 text-text-tertiary rounded-xl active:bg-status-error-bg active:text-status-error-text transition-all border border-transparent active:border-status-error-border/20 active:scale-90">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {prod.categories && (
                                                <p className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-1.5">{prod.categories.nama_kategori}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="mt-4 pt-3.5 border-t border-brand-border/60 flex justify-between items-center bg-brand-bg/30 -mx-5 px-5 -mb-5 py-3.5">
                                        <div className="flex flex-col">
                                            <span className="section-label font-bold text-text-tertiary uppercase tracking-[0.15em] text-[9px]">Harga Base</span>
                                            <span className="text-[15px] font-extrabold text-text-primary mt-0.5 tabular-nums font-display">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga_default)}
                                            </span>
                                        </div>
                                        {activeQty > 0 && (
                                            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-100">
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-bold tabular-nums">{activeQty} pcs aktif</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
