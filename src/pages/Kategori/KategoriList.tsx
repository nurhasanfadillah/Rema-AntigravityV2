import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Plus, ArrowLeft, LayoutDashboard, Edit2, Trash2, X, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';
import { getImageUrl } from '../../utils/storage';

export function KategoriList() {
    const { categories, fetchCategories, isLoading, addCategory, updateCategory, deleteCategory, fetchProductsByCategory, categoryProducts } = useCategoryStore();
    const { confirm, ConfirmDialog } = useConfirmation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [namaKategori, setNamaKategori] = useState('');
    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
    const [loadingProducts, setLoadingProducts] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingId(null);
        setNamaKategori('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!namaKategori.trim()) {
            notify.warning('Nama kategori wajib diisi');
            return;
        }

        const toastId = notify.loading(editingId ? 'Memperbarui kategori...' : 'Menyimpan kategori...');
        try {
            if (editingId) {
                await updateCategory(editingId, { nama_kategori: namaKategori.trim() });
                notify.success('Kategori berhasil diperbarui', toastId);
            } else {
                await addCategory({ nama_kategori: namaKategori.trim() });
                notify.success('Kategori berhasil ditambahkan', toastId);
            }

            handleCancel();
        } catch (error) {
            handleBackendError(error, 'Gagal menyimpan kategori', toastId, 'Kategori');
        }
    };

    const handleEdit = (cat: any) => {
        setNamaKategori(cat.nama_kategori);
        setEditingId(cat.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (cat: any) => {
        const productCount = cat.products?.length || 0;
        const consequences = [
            'Kategori yang dihapus tidak dapat dipulihkan.',
        ];
        if (productCount > 0) {
            consequences.unshift(`Kategori ini masih memiliki ${productCount} produk terkait.`);
            consequences.push('Sistem akan mencegah penghapusan jika masih ada produk terkait.');
        }

        const { confirmed } = await confirm({
            title: 'Hapus Kategori?',
            description: 'Tindakan ini bersifat destruktif dan akan menghapus kategori secara permanen.',
            subject: cat.nama_kategori,
            variant: 'danger',
            confirmLabel: 'Hapus Permanen',
            requiresDoubleConfirm: productCount > 0,
            consequences,
        });
        if (!confirmed) return;

        const toastId = notify.loading('Menghapus kategori...');
        try {
            await deleteCategory(cat.id);
            notify.success('Kategori berhasil dihapus', toastId);
        } catch (error) {
            handleBackendError(error, 'Gagal menghapus kategori', toastId, 'Kategori');
        }
    };

    const handleCategoryClick = async (catId: string) => {
        if (expandedCategoryId === catId) {
            setExpandedCategoryId(null);
            return;
        }
        setExpandedCategoryId(catId);
        setLoadingProducts(catId);
        await fetchProductsByCategory(catId);
        setLoadingProducts(null);
    };

    // Filter out item being edited
    const visibleCategories = categories.filter(cat => cat.id !== editingId);

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full min-h-screen pb-24">
            <ConfirmDialog />
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-xl active:bg-brand-border/40 transition-all active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display tracking-tight">Kategori Produk</h2>
                    <p className="page-subtitle mt-0.5">Kelola tipe dan jenis produk</p>
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
                                {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <button type="button" onClick={handleCancel} className="text-text-tertiary active:opacity-60 p-1 transition-opacity">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="form-label font-bold text-text-secondary flex items-center gap-1.5">
                                Nama Kategori <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                type="text"
                                value={namaKategori}
                                onChange={e => setNamaKategori(e.target.value)}
                                className="form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all"
                                placeholder="Misal: Pouch, Handbag, Tas Ransel"
                            />
                        </div>

                        <div className="flex gap-3 pt-3">
                            <Button type="button" variant="outline" fullWidth onClick={handleCancel} className="font-bold py-3">Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="font-bold py-3">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Kategori')}
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
                        <p className="text-center text-text-tertiary text-sm font-bold tracking-wide">Memuat kategori...</p>
                    </div>
                ) : visibleCategories.length === 0 && !editingId ? (
                    <div className="text-center py-20 px-6 rounded-[32px] border-2 border-dashed border-brand-border bg-brand-surface/30">
                        <div className="bg-brand-bg w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <LayoutDashboard className="w-8 h-8 text-text-tertiary/40" />
                        </div>
                        <h4 className="text-text-primary font-bold text-lg font-display">Belum ada kategori</h4>
                        <p className="text-text-tertiary text-sm mt-1.5 max-w-[240px] mx-auto leading-relaxed">Buat kategori baru untuk mengelompokkan produk Anda.</p>
                        <Button variant="outline" size="sm" className="mt-6 font-bold border-brand-accent/20 text-brand-accent" onClick={() => setShowAddForm(true)}>
                            Tambah Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {visibleCategories.map(cat => {
                            const productCount = cat.products?.length || 0;
                            const isExpanded = expandedCategoryId === cat.id;
                            const products = categoryProducts[cat.id] || [];
                            const isLoadingCatProducts = loadingProducts === cat.id;

                            return (
                                <div key={cat.id}>
                                    <Card className="transition-all duration-150 bg-brand-surface shadow-sm border-brand-border overflow-hidden active:scale-[0.99] relative">
                                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleCategoryClick(cat.id)}>
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                                                <LayoutDashboard className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-extrabold text-text-primary text-[16px] truncate font-display">{cat.nama_kategori}</h4>
                                                <p className="text-[12px] text-text-tertiary font-bold mt-0.5">
                                                    {productCount} produk
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                                                    className="p-2.5 text-text-tertiary rounded-xl active:bg-brand-accent/10 active:text-brand-accent transition-all border border-transparent active:border-brand-accent/10 active:scale-90"
                                                    title="Edit Kategori">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(cat); }}
                                                    className="p-2.5 text-text-tertiary rounded-xl active:bg-status-error-bg active:text-status-error-text transition-all border border-transparent active:border-status-error-border/20 active:scale-90"
                                                    title="Hapus Kategori">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="p-1.5 text-text-tertiary">
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Drill-down: Daftar Produk Terkait */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-brand-border/60 -mx-5 px-5 -mb-5 pb-5 bg-brand-bg/30">
                                                {isLoadingCatProducts ? (
                                                    <div className="flex items-center justify-center py-4 gap-2">
                                                        <div className="w-5 h-5 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                                                        <span className="text-xs text-text-tertiary font-medium">Memuat produk...</span>
                                                    </div>
                                                ) : products.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <Package className="w-6 h-6 text-text-tertiary/30 mx-auto mb-1.5" />
                                                        <p className="text-xs text-text-tertiary font-medium">Belum ada produk dalam kategori ini</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-tertiary mb-2">
                                                            Daftar Produk ({products.length})
                                                        </p>
                                                        {products.map((prod: any) => (
                                                            <div key={prod.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-brand-surface border border-brand-border/60">
                                                                <div className="w-10 h-10 bg-brand-bg border border-brand-border rounded-lg shrink-0 overflow-hidden">
                                                                    {prod.foto_produk ? (
                                                                        <img src={getImageUrl(prod.foto_produk) || ''} alt={prod.nama_produk} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="flex items-center justify-center w-full h-full">
                                                                            <Package className="w-4 h-4 text-brand-border" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[13px] font-bold text-text-primary truncate">{prod.nama_produk}</p>
                                                                    <p className="text-[11px] text-text-tertiary font-medium">
                                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga_default)}
                                                                    </p>
                                                                </div>
                                                                <StatusBadge status={prod.status as any} size="sm" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
