import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, ArrowLeft, LayoutDashboard, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';

export function KategoriList() {
    const { categories, fetchCategories, isLoading, addCategory, updateCategory, deleteCategory } = useCategoryStore();
    const { confirm, ConfirmDialog } = useConfirmation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [namaKategori, setNamaKategori] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!namaKategori.trim()) return;

        const toastId = notify.loading(editingId ? 'Memperbarui kategori...' : 'Menyimpan kategori...');
        try {
            if (editingId) {
                await updateCategory(editingId, { nama_kategori: namaKategori });
                notify.success('Kategori berhasil diperbarui', toastId);
            } else {
                await addCategory({ nama_kategori: namaKategori });
                notify.success('Kategori berhasil ditambahkan', toastId);
            }

            setShowAddForm(false);
            setEditingId(null);
            setNamaKategori('');
        } catch (error) {
            handleBackendError(error, 'Gagal menyimpan kategori', toastId, 'Kategori');
        }
    };

    const handleEdit = (cat: any) => {
        setNamaKategori(cat.nama_kategori);
        setEditingId(cat.id);
        setShowAddForm(true);
    };

    const handleDelete = async (cat: any) => {
        const { confirmed } = await confirm({
            title: 'Hapus Kategori?',
            description: 'Kategori ini akan dihapus. Produk yang menggunakan kategori ini tidak akan terpengaruh.',
            subject: cat.nama_kategori,
            variant: 'danger',
            confirmLabel: 'Hapus Kategori',
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

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            <ConfirmDialog />
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-full active:bg-brand-border/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Kategori Produk</h2>
                    <p className="page-subtitle mt-0.5">Kelola tipe dan jenis produk</p>
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
                            {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                        </h3>

                        <div className="space-y-1.5">
                            <label className="form-label font-bold text-text-secondary">Nama Kategori</label>
                            <input
                                required
                                type="text"
                                value={namaKategori}
                                onChange={e => setNamaKategori(e.target.value)}
                                className="form-input bg-brand-bg border-brand-border"
                                placeholder="Misal: Pouch, Handbag, Tas Ransel"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" fullWidth onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setNamaKategori('');
                            }} className="font-bold">Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="font-bold">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Kategori')}
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
                        <p className="text-center text-text-tertiary text-sm font-medium">Memuat kategori...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-brand-border bg-brand-surface/50">
                        <LayoutDashboard className="w-12 h-12 text-brand-border mx-auto mb-3" />
                        <p className="text-text-tertiary font-bold">Belum ada kategori</p>
                        <p className="text-text-muted text-xs mt-1">Gunakan tombol (+) di pojok kanan atas untuk menambah</p>
                    </div>
                ) : (
                    categories.map(cat => (
                        <Card key={cat.id} className="transition-all duration-150 flex items-center gap-4 bg-brand-surface shadow-sm border-brand-border active:border-brand-accent/40 active:scale-[0.99]">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-text-primary text-[15px] truncate">{cat.nama_kategori}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => handleEdit(cat)}
                                    className="p-1.5 text-text-tertiary rounded-lg active:bg-blue-50 active:text-blue-600 transition-colors border border-transparent active:border-blue-100">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(cat)}
                                    className="p-1.5 text-text-tertiary rounded-lg active:bg-red-50 active:text-red-600 transition-colors border border-transparent active:border-red-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
