import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, ArrowLeft, LayoutDashboard, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function KategoriList() {
    const { categories, fetchCategories, isLoading, addCategory, updateCategory, deleteCategory } = useCategoryStore();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [namaKategori, setNamaKategori] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!namaKategori.trim()) return;

        if (editingId) {
            await updateCategory(editingId, { nama_kategori: namaKategori });
        } else {
            await addCategory({ nama_kategori: namaKategori });
        }

        setShowAddForm(false);
        setEditingId(null);
        setNamaKategori('');
    };

    const handleEdit = (cat: any) => {
        setNamaKategori(cat.nama_kategori);
        setEditingId(cat.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            await deleteCategory(id);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-gradient-to-r hover:from-blue-800/40 hover:to-blue-700/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Kategori Produk</h2>
                    <p className="text-zinc-400 text-xs mt-0.5">Kelola tipe dan jenis produk</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {showAddForm && (
                <Card className="border-blue-700/50 shadow-lg shadow-blue-900/20 bg-gradient-to-b from-blue-950/30 to-blue-900/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold text-lg border-b border-zinc-800 pb-2 text-blue-100">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-zinc-300 ml-1">Nama Kategori</label>
                            <input
                                required
                                type="text"
                                value={namaKategori}
                                onChange={e => setNamaKategori(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                placeholder="Misal: Pouch, Handbag, Tas Ransel"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" fullWidth onClick={() => { setShowAddForm(false); setEditingId(null); setNamaKategori(''); }}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-zinc-400 py-8">Memuat kategori...</p>
                ) : categories.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Belum ada kategori yang ditambahkan.</p>
                ) : (
                    categories.map(cat => (
                        <Card key={cat.id} className="hover:border-blue-700/50 hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-blue-800/40 transition-colors flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)] rounded-lg">
                                <LayoutDashboard className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-zinc-100 text-lg">{cat.nama_kategori}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(cat)} className="p-1.5 text-zinc-400 hover:text-white drop-shadow-sm rounded-md hover:bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-[0.5px] border-blue-700/30 shadow-inner shadow-blue-500/20 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-zinc-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors">
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
