import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, ArrowLeft, LayoutDashboard, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';

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
            notify.error('Gagal menyimpan kategori', toastId);
            console.error(error);
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
            notify.error('Gagal menghapus kategori', toastId);
            console.error(error);
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
                    <h2 className="page-title font-display">Kategori Produk</h2>
                    <p className="page-subtitle mt-0.5">Kelola tipe dan jenis produk</p>
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
                            {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
                        </h3>

                        <div className="space-y-1.5">
                            <label className="form-label">Nama Kategori</label>
                            <input
                                required
                                type="text"
                                value={namaKategori}
                                onChange={e => setNamaKategori(e.target.value)}
                                className="form-input"
                                placeholder="Misal: Pouch, Handbag, Tas Ransel"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" fullWidth onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setNamaKategori('');
                            }}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Memuat kategori...</p>
                ) : categories.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Belum ada kategori yang ditambahkan.</p>
                ) : (
                    categories.map(cat => (
                        <Card key={cat.id} className="hover:border-blue-700/40 hover:bg-zinc-900/60 transition-all duration-200 flex items-center gap-4">
                            <div className="p-2.5 bg-blue-900/30 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                                <LayoutDashboard className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-zinc-100 text-[15px] truncate">{cat.nama_kategori}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => handleEdit(cat)}
                                    className="p-1.5 text-zinc-500 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(cat)}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
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
