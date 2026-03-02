import { useEffect, useState } from 'react';
import { useActivityStore } from '../../store/activityStore';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Search,
    RotateCcw,
    Plus,
    Pencil,
    Trash2,
    ArrowRightLeft,
    XCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { ActivityModule, ActivityAction } from '../../utils/activityLogger';
import type { ActivityFilters, ActivityLog } from '../../store/activityStore';

/* ──────────────────────────────────────────────
   Constants
────────────────────────────────────────────── */
const MODULE_OPTIONS: { value: ActivityModule | ''; label: string }[] = [
    { value: '', label: 'Semua Modul' },
    { value: 'Pesanan', label: 'Pesanan' },
    { value: 'Detail Pesanan', label: 'Detail Pesanan' },
    { value: 'Produk', label: 'Produk' },
    { value: 'Kategori', label: 'Kategori' },
    { value: 'Mitra', label: 'Mitra' },
    { value: 'Keuangan', label: 'Keuangan' },
];

const ACTION_OPTIONS: { value: ActivityAction | ''; label: string }[] = [
    { value: '', label: 'Semua Aksi' },
    { value: 'CREATE', label: 'Buat Baru' },
    { value: 'UPDATE', label: 'Perbarui' },
    { value: 'DELETE', label: 'Hapus' },
    { value: 'STATUS_CHANGE', label: 'Ubah Status' },
    { value: 'CANCEL', label: 'Batalkan' },
];

/* ──────────────────────────────────────────────
   Action Badge Component
────────────────────────────────────────────── */
function ActionBadge({ action }: { action: ActivityAction }) {
    const config: Record<ActivityAction, { icon: React.ElementType; label: string; className: string }> = {
        CREATE: { icon: Plus, label: 'Buat', className: 'bg-status-success-bg text-status-success-text border-status-success-border' },
        UPDATE: { icon: Pencil, label: 'Ubah', className: 'bg-status-info-bg text-status-info-text border-status-info-border' },
        DELETE: { icon: Trash2, label: 'Hapus', className: 'bg-status-error-bg text-status-error-text border-status-error-border' },
        STATUS_CHANGE: { icon: ArrowRightLeft, label: 'Status', className: 'bg-status-warning-bg text-status-warning-text border-status-warning-border' },
        CANCEL: { icon: XCircle, label: 'Batal', className: 'bg-status-error-bg text-status-error-text border-status-error-border' },
    };

    const { icon: Icon, label, className } = config[action];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${className}`}>
            <Icon className="w-3 h-3" strokeWidth={2.5} />
            {label}
        </span>
    );
}

/* ──────────────────────────────────────────────
   Module Badge Component
────────────────────────────────────────────── */
function ModuleBadge({ module }: { module: string }) {
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-brand-bg text-text-tertiary border border-brand-border">
            {module}
        </span>
    );
}

/* ──────────────────────────────────────────────
   Relative Time Formatter
────────────────────────────────────────────── */
function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
    }).format(date);
}

function formatFullTimestamp(dateStr: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(dateStr));
}

/* ──────────────────────────────────────────────
   Value Diff Viewer
────────────────────────────────────────────── */
function ValueDiff({ oldValue, newValue }: { oldValue: Record<string, any> | null; newValue: Record<string, any> | null }) {
    if (!oldValue && !newValue) return null;

    const allKeys = new Set([
        ...Object.keys(oldValue || {}),
        ...Object.keys(newValue || {}),
    ]);

    return (
        <div className="mt-3 space-y-1.5">
            {Array.from(allKeys).map(key => {
                const oldVal = oldValue?.[key];
                const newVal = newValue?.[key];
                const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                if (!isChanged && oldVal === undefined) return null;

                return (
                    <div key={key} className="text-[11px] font-mono leading-relaxed">
                        <span className="text-text-tertiary font-bold">{key}:</span>
                        {oldVal !== undefined && (
                            <span className={`ml-1.5 ${isChanged ? 'line-through text-status-error-text/60' : 'text-text-secondary'}`}>
                                {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)}
                            </span>
                        )}
                        {isChanged && newVal !== undefined && (
                            <span className="ml-1.5 text-status-success-text font-bold">
                                → {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Activity Card Component
────────────────────────────────────────────── */
function ActivityCard({ log }: { log: ActivityLog }) {
    const [expanded, setExpanded] = useState(false);
    const hasDetails = log.old_value || log.new_value;

    return (
        <div className="bg-brand-surface border border-brand-border rounded-2xl px-4 py-4 shadow-sm shadow-black/[0.03] transition-all duration-150 active:scale-[0.99]">
            {/* Top Row: Action Badge + Module Badge + Time */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <ActionBadge action={log.action} />
                    <ModuleBadge module={log.module} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold whitespace-nowrap shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(log.timestamp)}
                </div>
            </div>

            {/* Description */}
            <p className="text-[13px] text-text-primary font-semibold leading-snug">
                {log.description}
            </p>

            {/* Footer: Reference + User */}
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-brand-border/50">
                <div className="flex items-center gap-2">
                    {log.reference_id && (
                        <span className="text-[10px] text-text-muted font-mono font-bold bg-brand-bg px-1.5 py-0.5 rounded">
                            REF: {log.reference_id.length > 12 ? log.reference_id.slice(0, 8).toUpperCase() : log.reference_id}
                        </span>
                    )}
                    <span className="text-[10px] text-text-tertiary font-bold">
                        oleh {log.user_id}
                    </span>
                </div>

                {hasDetails && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-0.5 text-[10px] text-brand-accent font-bold active:opacity-60 transition-opacity px-1 py-0.5"
                    >
                        {expanded ? 'Tutup' : 'Detail'}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Expanded Details */}
            {expanded && hasDetails && (
                <div className="mt-3 pt-3 border-t border-brand-border/30 bg-brand-bg/50 -mx-4 px-4 pb-1 rounded-b-2xl">
                    <p className="section-label text-[9px] mb-1.5">Perubahan Data</p>
                    <ValueDiff oldValue={log.old_value} newValue={log.new_value} />
                    <p className="text-[10px] text-text-muted mt-3 font-medium">
                        {formatFullTimestamp(log.timestamp)}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main Page Component
────────────────────────────────────────────── */
export function AktivitasList() {
    const { activities, isLoading, totalCount, currentPage, filters, fetchActivities, setFilters, resetFilters } = useActivityStore();
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState<ActivityFilters>({ ...filters });

    const totalPages = Math.ceil(totalCount / 25);

    useEffect(() => {
        fetchActivities(1);
    }, [fetchActivities]);

    const handleApplyFilters = () => {
        setFilters(localFilters);
        fetchActivities(1, localFilters);
    };

    const handleResetFilters = () => {
        const empty: ActivityFilters = { module: '', action: '', dateFrom: '', dateTo: '', search: '' };
        setLocalFilters(empty);
        resetFilters();
        fetchActivities(1, empty);
    };

    const handlePageChange = (page: number) => {
        fetchActivities(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasActiveFilters = !!(filters.module || filters.action || filters.dateFrom || filters.dateTo || filters.search);

    return (
        <div className="p-4 space-y-5 max-w-2xl mx-auto w-full min-h-screen pb-24">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-xl active:bg-brand-border/40 transition-all active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display tracking-tight">Log Aktivitas</h2>
                    <p className="page-subtitle mt-0.5">Audit trail sistem — riwayat seluruh aksi</p>
                </div>
                <Button
                    variant={showFilters ? 'primary' : 'outline'}
                    className={`!p-2.5 active:scale-95 ${hasActiveFilters ? 'shadow-lg shadow-blue-600/20' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="w-5 h-5" />
                </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl px-4 py-4 shadow-sm animate-slide-up space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-border pb-3">
                        <h3 className="font-bold text-text-primary text-[15px] font-display">Filter Aktivitas</h3>
                        {hasActiveFilters && (
                            <button onClick={handleResetFilters} className="flex items-center gap-1 text-[11px] text-brand-accent font-bold active:opacity-60 transition-opacity">
                                <RotateCcw className="w-3.5 h-3.5" /> Reset
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari deskripsi aktivitas..."
                            value={localFilters.search || ''}
                            onChange={e => setLocalFilters({ ...localFilters, search: e.target.value })}
                            className="form-input pl-9 bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all"
                        />
                    </div>

                    {/* Module & Action */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="form-label font-bold text-text-secondary">Modul</label>
                            <select
                                value={localFilters.module || ''}
                                onChange={e => setLocalFilters({ ...localFilters, module: e.target.value as ActivityModule | '' })}
                                className="form-input bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all text-[13px]"
                            >
                                {MODULE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="form-label font-bold text-text-secondary">Aksi</label>
                            <select
                                value={localFilters.action || ''}
                                onChange={e => setLocalFilters({ ...localFilters, action: e.target.value as ActivityAction | '' })}
                                className="form-input bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all text-[13px]"
                            >
                                {ACTION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="form-label font-bold text-text-secondary">Dari Tanggal</label>
                            <input
                                type="date"
                                value={localFilters.dateFrom || ''}
                                onChange={e => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                                className="form-input bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all text-[13px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="form-label font-bold text-text-secondary">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={localFilters.dateTo || ''}
                                onChange={e => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                                className="form-input bg-brand-bg/50 border-brand-border font-bold focus:bg-brand-surface transition-all text-[13px]"
                            />
                        </div>
                    </div>

                    {/* Apply Button */}
                    <Button variant="primary" fullWidth className="font-bold py-3" onClick={handleApplyFilters}>
                        Terapkan Filter
                    </Button>
                </div>
            )}

            {/* Results Summary */}
            {totalCount > 0 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] text-text-tertiary font-bold">
                        {totalCount.toLocaleString('id-ID')} aktivitas ditemukan
                    </p>
                    {totalPages > 1 && (
                        <p className="text-[11px] text-text-muted font-bold">
                            Halaman {currentPage} dari {totalPages}
                        </p>
                    )}
                </div>
            )}

            {/* Activity List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center py-16 gap-4">
                        <div className="w-10 h-10 border-[3px] border-brand-accent/10 border-t-brand-accent rounded-full animate-spin" />
                        <p className="text-center text-text-tertiary text-sm font-bold tracking-wide">Memuat log aktivitas...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-20 px-6 rounded-[32px] border-2 border-dashed border-brand-border bg-brand-surface/30">
                        <div className="bg-brand-bg w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-text-tertiary/40" />
                        </div>
                        <h4 className="text-text-primary font-bold text-lg font-display">
                            {hasActiveFilters ? 'Tidak ada aktivitas ditemukan' : 'Belum ada log aktivitas'}
                        </h4>
                        <p className="text-text-tertiary text-sm mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                            {hasActiveFilters
                                ? 'Coba ubah kriteria filter Anda atau reset filter untuk melihat semua aktivitas.'
                                : 'Aktivitas sistem akan tercatat otomatis saat Anda menggunakan aplikasi.'}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" className="mt-6 font-bold border-brand-accent/20 text-brand-accent" onClick={handleResetFilters}>
                                Reset Filter
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {activities.map(log => (
                            <ActivityCard key={log.id} log={log} />
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="font-bold active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                                </Button>
                                <span className="text-[12px] text-text-tertiary font-bold">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="font-bold active:scale-95"
                                >
                                    Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
