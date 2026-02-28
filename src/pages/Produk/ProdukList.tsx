import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { Plus, ArrowLeft, Package, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProdukList() {
    const { categories, fetchCategories } = useCategoryStore();
    const { products, fetchProducts, isLoading, addProduct, updateProduct, deleteProduct } = useProductStore();

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

        if (editingId) {
            await updateProduct(editingId, payload);
        } else {
            await addProduct(payload);
        }

        setShowAddForm(false);
        setEditingId(null);
        setFormData({ nama_produk: '', category_id: '', deskripsi: '', harga_default: '', status: 'Aktif', foto_produk: '' });
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

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Data Produk</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Kelola daftar produk dan harga</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600/50" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {showAddForm && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold text-lg border-b border-gray-800 pb-2 text-emerald-100">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Nama Produk</label>
                                <input required type="text" value={formData.nama_produk} onChange={e => setFormData({ ...formData, nama_produk: e.target.value })} className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Pouch Custom Logo..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Kategori</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Deskripsi</label>
                                <textarea rows={2} value={formData.deskripsi} onChange={e => setFormData({ ...formData, deskripsi: e.target.value })} className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Bahan kanvas, ukuran 20x15..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Status</label>
                                <select
                                    className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>
                            </div>

                            <NumberInput
                                label="Harga Default (Rp)"
                                value={formData.harga_default.toString()}
                                onChange={(val) => setFormData({ ...formData, harga_default: val })}
                                placeholder="45000"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" fullWidth onClick={() => { setShowAddForm(false); setEditingId(null); setFormData({ nama_produk: '', category_id: '', deskripsi: '', harga_default: '', status: 'Aktif', foto_produk: '' }); }}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600/50">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Produk')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-gray-400 py-8">Memuat produk...</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">Belum ada produk yang ditambahkan.</p>
                ) : (
                    products.map(prod => (
                        <Card key={prod.id} className="hover:border-gray-700 transition-colors flex items-start gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg shrink-0">
                                <Package className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-100 truncate pr-2">{prod.nama_produk}</h4>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${prod.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {prod.status}
                                        </span>
                                        <button onClick={() => handleEdit(prod)} className="p-1 text-gray-400 hover:text-blue-400 rounded hover:bg-blue-500/10 transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(prod.id)} className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {prod.categories && (
                                    <p className="text-xs text-purple-400 mb-2">{prod.categories.nama_kategori}</p>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800">
                                    <span className="text-xs text-gray-500">Harga Base</span>
                                    <span className="text-sm font-medium text-emerald-400">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(prod.harga_default)}
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
