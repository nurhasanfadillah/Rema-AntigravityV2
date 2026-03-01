import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { Plus, ArrowLeft, Package, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductImageUpload } from '../../components/Produk/ProductImageUpload';
import { getImageUrl, deleteProductImage } from '../../utils/storage';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';

export function ProdukList() {
    const { categories, fetchCategories } = useCategoryStore();
    const { products, fetchProducts, isLoading, addProduct, updateProduct, deleteProduct } = useProductStore();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
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

            setShowAddForm(false);
            setEditingId(null);
            setFormData({ nama_produk: '', category_id: '', deskripsi: '', harga_default: '', status: 'Aktif', foto_produk: '' });
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
    };

    const handleDelete = async (prod: any) => {
        const { confirmed } = await confirm({
            title: 'Hapus Produk?',
            description: 'Produk ini akan dihapus secara permanen beserta foto yang telah diunggah.',
            subject: prod.nama_produk,
            variant: 'danger',
            confirmLabel: 'Hapus Produk',
            consequences: [
                'Foto produk juga akan dihapus dari storage.',
                'Produk tidak dapat dipulihkan setelah dihapus.',
            ],
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

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            <ConfirmDialog />
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-brand-border/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Data Produk</h2>
                    <p className="page-subtitle mt-0.5">Kelola daftar produk dan harga</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2.5 shadow-md shadow-blue-600/20" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Add / Edit Form */}
            {showAddForm && (
                <Card className="border-brand-accent/20 shadow-lg shadow-black/[0.04] bg-brand-surface">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-bold border-b border-brand-border pb-2.5 text-text-primary">
                            {editingId ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Nama Produk</label>
                                <input required type="text" value={formData.nama_produk}
                                    onChange={e => setFormData({ ...formData, nama_produk: e.target.value })}
                                    className="form-input bg-brand-bg border-brand-border" placeholder="Pouch Custom Logo..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Kategori</label>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        className="form-input appearance-none bg-brand-bg border-brand-border font-bold"
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
                                        className="form-input bg-brand-bg border-brand-border font-bold"
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
                                    className="form-input bg-brand-bg border-brand-border" placeholder="Bahan kanvas, ukuran 20x15..." />
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

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" fullWidth onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setFormData({ nama_produk: '', category_id: '', deskripsi: '', harga_default: '', status: 'Aktif', foto_produk: '' });
                            }} className="font-bold">Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="font-bold">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Produk')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <div className="flex flex-col items-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                        <p className="text-center text-text-tertiary text-sm font-medium">Memuat produk...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-brand-border bg-brand-surface/50">
                        <Package className="w-12 h-12 text-brand-border mx-auto mb-3" />
                        <p className="text-text-tertiary font-bold">Belum ada data produk</p>
                        <p className="text-text-muted text-xs mt-1">Gunakan tombol (+) untuk menambah produk baru</p>
                    </div>
                ) : (
                    products.map(prod => (
                        <Card key={prod.id} className="hover:border-brand-accent/40 hover:bg-brand-bg/40 transition-all duration-200 flex items-start gap-3.5 group p-3 bg-brand-surface shadow-sm border-brand-border">
                            {/* Product Image */}
                            <div className="relative aspect-square w-[72px] bg-brand-bg border border-brand-border rounded-xl shrink-0 overflow-hidden group-hover:shadow-[0_0_12px_rgba(59,130,246,0.12)] transition-all">
                                {prod.foto_produk ? (
                                    <img src={getImageUrl(prod.foto_produk) || ''} alt={prod.nama_produk}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-brand-border">
                                        <Package className="w-7 h-7 opacity-40" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-extrabold text-text-primary truncate pr-2 group-hover:text-brand-accent transition-colors text-[15px]">
                                        {prod.nama_produk}
                                    </h4>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <StatusBadge status={prod.status as any} size="sm" />
                                        <button onClick={() => handleEdit(prod)}
                                            className="p-1.5 text-text-tertiary hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(prod)}
                                            className="p-1.5 text-text-tertiary hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {prod.categories && (
                                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-1.5">{prod.categories.nama_kategori}</p>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-brand-border group-hover:border-brand-accent/20 transition-colors mt-2">
                                    <span className="section-label font-bold text-text-tertiary uppercase tracking-widest text-[10px]">Harga Base</span>
                                    <span className="text-sm font-extrabold text-text-primary group-hover:text-brand-accent transition-colors tabular-nums">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga_default)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
