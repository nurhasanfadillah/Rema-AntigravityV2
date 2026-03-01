import React, { useEffect, useState } from 'react';
import { useMitraStore } from '../../store/mitraStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';

export function MitraList() {
    const { mitras, fetchMitras, isLoading, addMitra, updateMitra, deleteMitra } = useMitraStore();
    const { confirm, ConfirmDialog } = useConfirmation();
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

        const toastId = notify.loading(editingId ? 'Memperbarui mitra...' : 'Menyimpan mitra...');
        try {
            if (editingId) {
                await updateMitra(editingId, payload);
                notify.success('Mitra berhasil diperbarui', toastId);
            } else {
                await addMitra(payload);
                notify.success('Mitra berhasil ditambahkan', toastId);
            }

            setShowAddForm(false);
            setEditingId(null);
            setFormData({ nama_mitra: '', kontak: '', alamat: '', status: 'Aktif', limit_tagihan: '' });
        } catch (error) {
            notify.error('Gagal menyimpan data mitra', toastId);
            console.error(error);
        }
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

    const handleDelete = async (mitra: any) => {
        const { confirmed } = await confirm({
            title: 'Hapus Mitra?',
            description: 'Data mitra ini akan dihapus secara permanen dan tidak dapat dipulihkan kembali.',
            subject: mitra.nama_mitra,
            variant: 'danger',
            confirmLabel: 'Hapus Mitra',
            requiresDoubleConfirm: false,
            consequences: [
                'Semua riwayat pesanan terkait mitra ini tetap tersimpan.',
                'Mitra tidak dapat digunakan untuk transaksi baru.',
            ],
        });
        if (!confirmed) return;

        const toastId = notify.loading('Menghapus mitra...');
        try {
            await deleteMitra(mitra.id);
            notify.success('Mitra berhasil dihapus', toastId);
        } catch (error) {
            notify.error('Gagal menghapus mitra', toastId);
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
                    <h2 className="page-title font-display">Data Mitra</h2>
                    <p className="page-subtitle mt-0.5">Kelola mitra penjualan B2B</p>
                </div>
                {!showAddForm && (
                    <Button variant="primary" className="!p-2.5" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Add / Edit Form */}
            {showAddForm && (
                <Card className="border-blue-700/40 bg-gradient-to-b from-blue-950/20 to-transparent">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold border-b border-zinc-800 pb-2.5 text-zinc-100">
                            {editingId ? 'Edit Mitra' : 'Tambah Mitra Baru'}
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label">Nama Mitra</label>
                                <input required type="text" value={formData.nama_mitra}
                                    onChange={e => setFormData({ ...formData, nama_mitra: e.target.value })}
                                    className="form-input" placeholder="PT. Mitra Sejahtera" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label">Kontak (WhatsApp)</label>
                                <input type="tel" value={formData.kontak}
                                    onChange={e => setFormData({ ...formData, kontak: e.target.value })}
                                    className="form-input" placeholder="08123456789" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label">Alamat Lengkap</label>
                                <textarea rows={2} value={formData.alamat}
                                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                                    className="form-input" placeholder="Jl. Raya Niaga No. 1..." />
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

                            <div className="space-y-1.5">
                                <label className="form-label">Limit (Rp)</label>
                                <NumberInput
                                    value={formData.limit_tagihan.toString()}
                                    onChange={(val) => setFormData({ ...formData, limit_tagihan: val })}
                                    placeholder="10000000"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" fullWidth onClick={() => {
                                setShowAddForm(false);
                                setEditingId(null);
                                setFormData({ nama_mitra: '', kontak: '', alamat: '', status: 'Aktif', limit_tagihan: '' });
                            }}>Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Mitra')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="space-y-3">
                {isLoading && !showAddForm ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Memuat data mitra...</p>
                ) : mitras.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8 text-sm">Belum ada data mitra yang ditambahkan.</p>
                ) : (
                    mitras.map(mitra => (
                        <Card key={mitra.id} className="hover:border-blue-700/40 hover:bg-zinc-900/60 transition-all duration-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-3">
                                    <h4 className="font-semibold text-zinc-100 truncate">{mitra.nama_mitra}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">{mitra.kontak || 'Tidak ada kontak'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2.5 shrink-0">
                                    {/* Status using standardized StatusBadge */}
                                    <StatusBadge status={mitra.status as any} size="sm" />
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => handleEdit(mitra)}
                                            className="p-1.5 text-zinc-500 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(mitra)}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Limit info */}
                            <div className="mt-3 pt-3 border-t border-zinc-800/60 flex justify-between items-center">
                                <span className="section-label">Limit Tagihan</span>
                                <span className="text-sm font-semibold text-zinc-300">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(mitra.limit_tagihan)}
                                </span>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
