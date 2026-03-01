import React, { useEffect, useState } from 'react';
import { useMitraStore } from '../../store/mitraStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NumberInput } from '../../components/ui/NumberInput';
import { Plus, ArrowLeft, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useConfirmation } from '../../hooks/useConfirmation';
import { notify } from '../../utils/notify';
import { handleBackendError } from '../../utils/errorHandler';

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

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ nama_mitra: '', kontak: '', alamat: '', status: 'Aktif', limit_tagihan: '' });
    };

    const validateForm = () => {
        if (!formData.nama_mitra.trim()) {
            notify.warning('Nama mitra wajib diisi');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            nama_mitra: formData.nama_mitra.trim(),
            kontak: formData.kontak.trim(),
            alamat: formData.alamat.trim(),
            status: formData.status,
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

            handleCancel();
        } catch (error) {
            handleBackendError(error, 'Gagal menyimpan data mitra', toastId, 'Mitra');
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
        // Scroll to form if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (mitra: any) => {
        const { confirmed } = await confirm({
            title: 'Hapus Mitra B2B?',
            description: 'Tindakan ini bersifat destruktif dan akan menghapus identitas mitra secara permanen.',
            subject: mitra.nama_mitra,
            variant: 'danger',
            confirmLabel: 'Hapus Permanen',
            requiresDoubleConfirm: true,
            consequences: [
                'Data mitra tidak akan muncul lagi di pilihan transaksi baru.',
                'Sistem akan mencegah penghapusan jika masih ada pesanan aktif.',
                'Seluruh riwayat keuangan mitra ini akan tetap disimpan untuk audit.',
            ],
        });

        if (!confirmed) return;

        const toastId = notify.loading('Menghapus mitra...');
        try {
            await deleteMitra(mitra.id);
            notify.success('Mitra berhasil dihapus', toastId);
        } catch (error) {
            handleBackendError(error, 'Gagal menghapus mitra', toastId, 'Mitra');
        }
    };

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto w-full min-h-screen pb-24">
            <ConfirmDialog />

            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary hover:text-text-primary rounded-xl hover:bg-brand-border/40 transition-all active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display tracking-tight">Data Mitra</h2>
                    <p className="page-subtitle mt-0.5">Kelola mitra penjualan B2B profesional</p>
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
                                {editingId ? 'Edit Data Mitra' : 'Tambah Mitra Baru'}
                            </h3>
                            <button type="button" onClick={handleCancel} className="text-text-tertiary hover:text-text-primary p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary flex items-center gap-1.5">
                                    Nama Mitra <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nama_mitra}
                                    onChange={e => setFormData({ ...formData, nama_mitra: e.target.value })}
                                    className="form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all"
                                    placeholder="Masukkan nama resmi perusahaan/individu"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Kontak (WhatsApp/Telp)</label>
                                <input
                                    type="tel"
                                    value={formData.kontak}
                                    onChange={e => setFormData({ ...formData, kontak: e.target.value })}
                                    className="form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all"
                                    placeholder="Contoh: 08123456789"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label font-bold text-text-secondary">Alamat Lengkap</label>
                                <textarea
                                    rows={3}
                                    value={formData.alamat}
                                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                                    className="form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all resize-none"
                                    placeholder="Jl. Raya Niaga No. 1, Jakarta Selatan..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Status Kerjasama</label>
                                    <select
                                        className="form-input bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Tidak Aktif' })}
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Tidak Aktif">Tidak Aktif</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="form-label font-bold text-text-secondary">Limit Tagihan (Rp)</label>
                                    <NumberInput
                                        value={formData.limit_tagihan.toString()}
                                        onChange={(val) => setFormData({ ...formData, limit_tagihan: val })}
                                        placeholder="Saran: 10.000.000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <Button type="button" variant="outline" fullWidth onClick={handleCancel} className="font-bold py-3">Batal</Button>
                            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="font-bold py-3">
                                {isLoading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Mitra')}
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
                        <p className="text-center text-text-tertiary text-sm font-bold tracking-wide">Menyelaraskan data mitra...</p>
                    </div>
                ) : mitras.length === 0 ? (
                    <div className="text-center py-20 px-6 rounded-[32px] border-2 border-dashed border-brand-border bg-brand-surface/30">
                        <div className="bg-brand-bg w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-text-tertiary/40" />
                        </div>
                        <h4 className="text-text-primary font-bold text-lg font-display">Belum ada data mitra</h4>
                        <p className="text-text-tertiary text-sm mt-1.5 max-w-[240px] mx-auto leading-relaxed">Daftarkan mitra bisnis baru Anda untuk mulai pencatatan transaksi B2B.</p>
                        <Button variant="outline" size="sm" className="mt-6 font-bold border-brand-accent/20 text-brand-accent" onClick={() => setShowAddForm(true)}>
                            Tambah Sekarang
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {mitras.map(mitra => (
                            <Card key={mitra.id} className="group hover:border-brand-accent/30 hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-300 bg-brand-surface shadow-sm border-brand-border px-5 py-5 overflow-hidden active:scale-[0.99] relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="font-extrabold text-text-primary text-[16px] truncate group-hover:text-brand-accent transition-colors font-display">{mitra.nama_mitra}</h4>
                                        <p className="text-[13px] text-text-tertiary font-bold mt-1.5 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-brand-accent/40 rounded-full" />
                                            {mitra.kontak || 'Tanpa Kontak'}
                                        </p>
                                        {mitra.alamat && (
                                            <p className="text-[12px] text-text-secondary mt-2 line-clamp-1 font-medium bg-brand-bg/50 px-2.5 py-1 rounded-lg border border-brand-border/40 inline-block">
                                                {mitra.alamat}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <StatusBadge status={mitra.status as any} size="sm" />
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.preventDefault(); handleEdit(mitra); }}
                                                className="p-2.5 text-text-tertiary hover:text-brand-accent rounded-xl hover:bg-brand-accent/10 transition-all border border-transparent hover:border-brand-accent/10 active:scale-90"
                                                title="Edit Mitra">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => { e.preventDefault(); handleDelete(mitra); }}
                                                className="p-2.5 text-text-tertiary hover:text-status-error-text rounded-xl hover:bg-status-error-bg transition-all border border-transparent hover:border-status-error-border/20 active:scale-90"
                                                title="Hapus Mitra">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Footer */}
                                <div className="mt-5 pt-4 border-t border-brand-border/60 flex justify-between items-center bg-brand-bg/30 -mx-5 px-5 -mb-5 py-3.5 group-hover:bg-brand-accent/[0.02] transition-colors">
                                    <div className="flex flex-col">
                                        <span className="section-label font-bold text-text-tertiary uppercase tracking-[0.15em] text-[9px]">Limit Tagihan</span>
                                        <span className="text-[15px] font-extrabold text-text-secondary mt-0.5 font-display">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(mitra.limit_tagihan)}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-text-muted font-bold text-right">
                                        ID: {mitra.id.split('-')[0].toUpperCase()}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
