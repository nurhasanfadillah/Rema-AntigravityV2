import React, { useEffect, useState } from 'react';
import { useMitraStore } from '../../store/mitraStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MitraList() {
    const { mitras, fetchMitras, isLoading, addMitra, updateMitra, deleteMitra } = useMitraStore();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nama_mitra: '',
        kontak: '',
        alamat: '',
        status: 'Aktif' as 'Aktif' | 'Tidak Aktif',
        limit_tagihan: ''
    });

    useEffect(() => {
        fetchMitras();
    }, [fetchMitras]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            limit_tagihan: formData.limit_tagihan ? parseInt(formData.limit_tagihan.toString(), 10) : 0
        };

        if (editingId) {
            await updateMitra(editingId, payload);
        } else {
            await addMitra(payload);
        }

        setShowAddForm(false);
        setEditingId(null);
        setFormData({ nama_mitra: '', kontak: '', alamat: '', status: 'Aktif', limit_tagihan: '' });
    };

    const handleEdit = (mitra: any) => {
        setFormData({
            nama_mitra: mitra.nama_mitra,
            kontak: mitra.kontak || '',
            alamat: mitra.alamat || '',
            status: mitra.status,
            limit_tagihan: mitra.limit_tagihan ? mitra.limit_tagihan.toString() : ''
        });
        setEditingId(mitra.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus mitra ini?')) {
            await deleteMitra(id);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">Data Mitra</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Kelola mitra penjualan B2B</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {showAddForm && (
                <Card className="border-blue-500/30 bg-blue-500/5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold text-lg border-b border-gray-800 pb-2">{editingId ? 'Edit Mitra' : 'Tambah Mitra Baru'}</h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Nama Mitra</label>
                                <input required type="text" value={formData.nama_mitra} onChange={e => setFormData({ ...formData, nama_mitra: e.target.value })} className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="PT. Mitra Sejahtera" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Kontak (WhatsApp)</label>
                                <input type="tel" value={formData.kontak} onChange={e => setFormData({ ...formData, kontak: e.target.value })} className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="08123456789" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Alamat Lengkap</label>
                                <textarea rows={2} value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Jl. Raya Niaga No. 1..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300 ml-1">Status</label>
                                <select
                                    className="w-full bg-[#1e1e1e] border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>
                            </div>

                            <NumberInput
                                label="Limit Tagihan (Rp)"
                                value={formData.limit_tagihan.toString()}
                                onChange={(val) => setFormData({ ...formData, limit_tagihan: val })}
                                placeholder="10000000"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" fullWidth onClick={() => { setShowAddForm(false); setEditingId(null); setFormData({ nama_mitra: '', kontak: '', alamat: '', status: 'Aktif', limit_tagihan: '' }); }}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>{isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Mitra')}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-gray-400 py-8">Memuat data mitra...</p>
                ) : mitras.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">Belum ada data mitra yang ditambahkan.</p>
                ) : (
                    mitras.map(mitra => (
                        <Card key={mitra.id} className="hover:border-gray-700 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-100">{mitra.nama_mitra}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{mitra.kontak || 'Tidak ada kontak'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${mitra.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {mitra.status}
                                    </span>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => handleEdit(mitra)} className="p-1.5 text-gray-400 hover:text-blue-400 rounded-md hover:bg-blue-500/10 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(mitra.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {mitra.limit_tagihan > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Limit Tagihan</span>
                                    <span className="text-sm font-medium text-gray-300">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(mitra.limit_tagihan)}
                                    </span>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
