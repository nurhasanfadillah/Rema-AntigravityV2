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
        <div className="p-4 space-y-6">
            <ConfirmDialog />
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Data Produk</h2>
                    <p className="page-subtitle mt-0.5">Kelola daftar produk dan harga</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2.5" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Add / Edit Form */}
            {showAddForm && (
                <Card className="border-blue-700/40 shadow-lg shadow-blue-900/20 bg-gradient-to-b from-blue-950/20 to-transparent">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold border-b border-zinc-800 pb-2.5 text-zinc-100">
                            {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label">Nama Produk</label>
                                <input required type="text" value={formData.nama_produk}
                                    onChange={e => setFormData({ ...formData, nama_produk: e.target.value })}
                                    className="form-input" placeholder="Pouch Custom Logo..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label">Kategori</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="form-input appearance-none"
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label">Deskripsi</label>
                                <textarea rows={2} value={formData.deskripsi}
                                    onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                                    className="form-input" placeholder="Bahan kanvas, ukuran 20x15..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-input"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>
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
                            <Button type="button" variant="ghost" fullWidth onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setFormData({ nama_produk: '', category_id: '', deskripsi: '', harga_default: '', status: 'Aktif', foto_produk: '' });
                            }}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Produk')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Memuat produk...</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Belum ada produk yang ditambahkan.</p>
                ) : (
                    products.map(prod => (
                        <Card key={prod.id} className="hover:border-blue-700/40 hover:bg-zinc-900/60 transition-all duration-200 flex items-start gap-3.5 group p-3">
                            {/* Product Image */}
                            <div className="relative aspect-square w-[72px] bg-zinc-800/50 border border-zinc-700/50 rounded-xl shrink-0 overflow-hidden group-hover:shadow-[0_0_12px_rgba(59,130,246,0.12)] transition-all">
                                {prod.foto_produk ? (
                                    <img src={getImageUrl(prod.foto_produk) || ''} alt={prod.nama_produk}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-zinc-700">
                                        <Package className="w-7 h-7 opacity-40" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-zinc-100 truncate pr-2 group-hover:text-blue-200 transition-colors text-[15px]">
                                        {prod.nama_produk}
                                    </h4>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Status standardized to StatusBadge */}
                                        <StatusBadge status={prod.status as any} size="sm" />
                                        <button onClick={() => handleEdit(prod)}
                                            className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(prod)}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {prod.categories && (
                                    <p className="text-xs font-medium text-blue-400/80 mb-1.5">{prod.categories.nama_kategori}</p>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50 group-hover:border-blue-800/30 transition-colors">
                                    <span className="section-label">Harga Base</span>
                                    <span className="text-sm font-bold text-zinc-100 group-hover:text-blue-100 transition-colors">
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
