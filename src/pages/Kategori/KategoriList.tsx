import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export function KategoriList() {
    const { categories, fetchCategories, isLoading, addCategory } = useCategoryStore();
    const [showAddForm, setShowAddForm] = useState(false);
    const [namaKategori, setNamaKategori] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!namaKategori.trim()) return;
        await addCategory({ nama_kategori: namaKategori });
        setShowAddForm(false);
        setNamaKategori('');
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Kategori Produk</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Kelola tipe dan jenis produk</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {showAddForm && (
                <Card className="border-purple-500/30 bg-purple-500/5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold text-lg border-b border-gray-800 pb-2 text-purple-100">Tambah Kategori</h3>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-300 ml-1">Nama Kategori</label>
                            <input
                                required
                                type="text"
                                value={namaKategori}
                                onChange={e => setNamaKategori(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-purple-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="Misal: Pouch, Handbag, Tas Ransel"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" fullWidth onClick={() => setShowAddForm(false)}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 border-purple-600/50">
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-gray-400 py-8">Memuat kategori...</p>
                ) : categories.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">Belum ada kategori yang ditambahkan.</p>
                ) : (
                    categories.map(cat => (
                        <Card key={cat.id} className="hover:border-gray-700 transition-colors flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <LayoutDashboard className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-100 text-lg">{cat.nama_kategori}</h4>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
