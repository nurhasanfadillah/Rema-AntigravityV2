import React, { useState, useEffect, useRef } from 'react';
import {
    AlertTriangle,
    Trash2,
    CheckCircle,
    Info,
    X,
    Loader2,
    ShieldAlert,
    Ban
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void | Promise<void>;

    /** Judul singkat, tegas, dan jelas */
    title: string;
    /** Deskripsi dampak aksi. Bisa string atau JSX */
    description?: React.ReactNode;
    /** Identitas data yang terpengaruh — misal nama mitra / no. pesanan */
    subject?: string;

    /** Jenis aksi: danger = merah, warning = kuning, info = biru, success = hijau */
    variant?: ConfirmVariant;

    /** Label tombol batal (default: "Batal") */
    cancelLabel?: string;
    /** Label tombol konfirmasi (default: "Konfirmasi") */
    confirmLabel?: string;

    /** Jika true, tampilkan konfirmasi ganda + peringatkan konsekuensi kritis */
    requiresDoubleConfirm?: boolean;

    /** Jika true, tampilkan textarea alasan wajib diisi */
    requiresReason?: boolean;
    reasonLabel?: string;
    reasonPlaceholder?: string;

    /** State loading dari pemanggil */
    isLoading?: boolean;

    /** List dampak / konsekuensi terstruktur */
    consequences?: string[];
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANTS: Record<ConfirmVariant, {
    icon: React.ReactNode;
    headerGradient: string;
    iconBg: string;
    iconColor: string;
    confirmBg: string;
    confirmShadow: string;
    doubleConfirmBorder: string;
    doubleConfirmText: string;
}> = {
    danger: {
        icon: <Trash2 className="w-5 h-5" />,
        headerGradient: 'bg-gradient-to-r from-red-500/15 to-transparent',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        confirmBg: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
        confirmShadow: 'shadow-red-500/25',
        doubleConfirmBorder: 'border-red-500/30',
        doubleConfirmText: 'text-red-200',
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5" />,
        headerGradient: 'bg-gradient-to-r from-amber-500/15 to-transparent',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        confirmBg: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600',
        confirmShadow: 'shadow-amber-500/25',
        doubleConfirmBorder: 'border-amber-500/30',
        doubleConfirmText: 'text-amber-200',
    },
    info: {
        icon: <Info className="w-5 h-5" />,
        headerGradient: 'bg-gradient-to-r from-blue-500/15 to-transparent',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        confirmBg: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
        confirmShadow: 'shadow-blue-500/25',
        doubleConfirmBorder: 'border-blue-500/30',
        doubleConfirmText: 'text-blue-200',
    },
    success: {
        icon: <CheckCircle className="w-5 h-5" />,
        headerGradient: 'bg-gradient-to-r from-emerald-500/15 to-transparent',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        confirmBg: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600',
        confirmShadow: 'shadow-emerald-500/25',
        doubleConfirmBorder: 'border-emerald-500/30',
        doubleConfirmText: 'text-emerald-200',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    subject,
    variant = 'danger',
    cancelLabel = 'Batal',
    confirmLabel = 'Konfirmasi',
    requiresDoubleConfirm = false,
    requiresReason = false,
    reasonLabel = 'Alasan',
    reasonPlaceholder = 'Tulis alasan di sini...',
    isLoading = false,
    consequences = [],
}) => {
    const [reason, setReason] = useState('');
    const [showDoubleConfirm, setShowDoubleConfirm] = useState(false);
    const [internalLoading, setInternalLoading] = useState(false);
    const reasonRef = useRef<HTMLTextAreaElement>(null);

    const v = VARIANTS[variant];
    const loading = isLoading || internalLoading;

    const canConfirm =
        (!requiresReason || reason.trim().length > 0) && !loading;

    // Reset state on open/close
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setReason('');
                setShowDoubleConfirm(false);
                setInternalLoading(false);
            }, 200);
        }
        if (isOpen && requiresReason) {
            setTimeout(() => reasonRef.current?.focus(), 100);
        }
    }, [isOpen, requiresReason]);

    // Block body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!canConfirm) return;

        // Double confirm flow
        if (requiresDoubleConfirm && !showDoubleConfirm) {
            setShowDoubleConfirm(true);
            return;
        }

        try {
            setInternalLoading(true);
            await onConfirm(requiresReason ? reason : undefined);
        } finally {
            setInternalLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.18s ease' }}
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: 'zoomIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
            >
                {/* ── Header ── */}
                <div className={`px-5 pt-5 pb-4 border-b border-zinc-900 flex items-center justify-between ${v.headerGradient}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${v.iconBg} ${v.iconColor} shrink-0`}>
                            {v.icon}
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                            {title}
                        </h3>
                    </div>
                    {!loading && (
                        <button
                            onClick={onClose}
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors shrink-0 ml-2"
                            aria-label="Tutup"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="px-5 py-5 space-y-5">

                    {/* Subject (data identity) */}
                    {subject && (
                        <div className="px-4 py-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60 flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : variant === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <span className="text-sm font-semibold text-zinc-200 truncate">{subject}</span>
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Consequences */}
                    {consequences.length > 0 && (
                        <div className="space-y-2">
                            <p className="section-label">Dampak Aksi</p>
                            <ul className="space-y-2">
                                {consequences.map((c, i) => (
                                    <li key={i} className="flex gap-2.5 text-xs text-zinc-400">
                                        <div className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Reason textarea */}
                    {requiresReason && (
                        <div className="space-y-2">
                            <label className="section-label">
                                {reasonLabel} <span className="text-red-500 normal-case font-bold">*</span>
                            </label>
                            <textarea
                                ref={reasonRef}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                rows={3}
                                placeholder={reasonPlaceholder}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}

                    {/* Double-confirm warning */}
                    {showDoubleConfirm && (
                        <div className={`flex gap-3 p-4 rounded-xl bg-zinc-900/60 border ${v.doubleConfirmBorder}`}
                            style={{ animation: 'slideDown 0.2s ease' }}>
                            <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${v.iconColor}`} />
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5">
                                    Konfirmasi Sekali Lagi
                                </p>
                                <p className={`text-xs leading-relaxed ${v.doubleConfirmText}`}>
                                    Tindakan ini tidak dapat dibatalkan. Klik "{confirmLabel}" untuk melanjutkan.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-5 pb-5 pt-3 border-t border-zinc-900 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-zinc-400 font-semibold hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-40"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                            ${canConfirm ? `${v.confirmBg} ${v.confirmShadow}` : 'bg-zinc-800 cursor-not-allowed'}`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : variant === 'danger' ? (
                            <Ban className="w-4 h-4" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                        {showDoubleConfirm ? `Ya, ${confirmLabel}` : confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.94) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
