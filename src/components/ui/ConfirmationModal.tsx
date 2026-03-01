import React, { useState, useEffect, useRef } from 'react';
import {
    AlertTriangle,
    Trash2,
    CheckCircle,
    Info,
    X,
    Loader2,
    ShieldAlert
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
        headerGradient: 'bg-status-error-bg/30',
        iconBg: 'bg-status-error-bg',
        iconColor: 'text-status-error-text',
        confirmBg: 'bg-status-error-text active:bg-red-700',
        confirmShadow: 'shadow-red-500/10',
        doubleConfirmBorder: 'border-status-error-border',
        doubleConfirmText: 'text-status-error-text',
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5" />,
        headerGradient: 'bg-status-warning-bg/30',
        iconBg: 'bg-status-warning-bg',
        iconColor: 'text-status-warning-text',
        confirmBg: 'bg-status-warning-text active:bg-amber-700',
        confirmShadow: 'shadow-amber-500/10',
        doubleConfirmBorder: 'border-status-warning-border',
        doubleConfirmText: 'text-status-warning-text',
    },
    info: {
        icon: <Info className="w-5 h-5" />,
        headerGradient: 'bg-status-info-bg/30',
        iconBg: 'bg-status-info-bg',
        iconColor: 'text-status-info-text',
        confirmBg: 'bg-status-info-text active:bg-blue-700',
        confirmShadow: 'shadow-blue-500/10',
        doubleConfirmBorder: 'border-status-info-border',
        doubleConfirmText: 'text-status-info-text',
    },
    success: {
        icon: <CheckCircle className="w-5 h-5" />,
        headerGradient: 'bg-status-success-bg/30',
        iconBg: 'bg-status-success-bg',
        iconColor: 'text-status-success-text',
        confirmBg: 'bg-status-success-text active:bg-emerald-700',
        confirmShadow: 'shadow-emerald-500/10',
        doubleConfirmBorder: 'border-status-success-border',
        doubleConfirmText: 'text-status-success-text',
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-[2px]"
            style={{ animation: 'fadeIn 0.18s ease' }}
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'zoomIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
            >
                {/* ── Header ── */}
                <div className={`px-6 pt-6 pb-4 border-b border-brand-border flex items-center justify-between ${v.headerGradient}`}>
                    <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-2xl ${v.iconBg} ${v.iconColor} shrink-0 shadow-sm shadow-black/[0.02]`}>
                            {v.icon}
                        </div>
                        <h3 className="text-lg font-bold text-text-primary tracking-tight leading-tight font-display">
                            {title}
                        </h3>
                    </div>
                    {!loading && (
                        <button
                            onClick={onClose}
                            className="p-2 text-text-tertiary active:text-text-primary active:bg-brand-bg rounded-xl transition-colors shrink-0 ml-2"
                            aria-label="Tutup"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-6 space-y-5">

                    {/* Subject (data identity) */}
                    {subject && (
                        <div className="px-4 py-3 bg-brand-bg rounded-2xl border border-brand-border flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${variant === 'danger' ? 'bg-status-error-text' : variant === 'warning' ? 'bg-status-warning-text' : variant === 'success' ? 'bg-status-success-text' : 'bg-status-info-text'}`} />
                            <span className="text-[15px] font-bold text-text-primary truncate">{subject}</span>
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <p className="text-[14px] text-text-secondary leading-relaxed font-medium">
                            {description}
                        </p>
                    )}

                    {/* Consequences */}
                    {consequences.length > 0 && (
                        <div className="space-y-2.5">
                            <p className="section-label text-[10px]">Dampak Aksi</p>
                            <ul className="space-y-2">
                                {consequences.map((c, i) => (
                                    <li key={i} className="flex gap-2.5 text-[13px] text-text-tertiary">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${variant === 'danger' ? 'bg-status-error-text' : variant === 'warning' ? 'bg-status-warning-text' : 'bg-status-info-text'}`} />
                                        <span className="leading-tight">{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Reason textarea */}
                    {requiresReason && (
                        <div className="space-y-2">
                            <label className="section-label text-[10px]">
                                {reasonLabel} <span className="text-red-500 normal-case font-bold">*</span>
                            </label>
                            <textarea
                                ref={reasonRef}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl p-3.5 text-sm text-text-primary placeholder-text-muted transition-all resize-none focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
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
                        <div className={`flex gap-3.5 p-4 rounded-2xl bg-brand-bg border ${v.doubleConfirmBorder}`}
                            style={{ animation: 'slideDown 0.2s ease' }}>
                            <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${v.iconColor}`} />
                            <div>
                                <p className="text-sm font-bold text-text-primary mb-0.5">
                                    Konfirmasi Sekali Lagi
                                </p>
                                <p className={`text-[12px] leading-relaxed font-medium ${v.doubleConfirmText}`}>
                                    Tindakan ini tidak dapat dibatalkan. Klik "{confirmLabel}" untuk melanjutkan.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 pb-6 pt-3 border-t border-brand-border flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-2xl text-sm text-text-secondary font-bold active:bg-brand-bg transition-all disabled:opacity-40 active:scale-95"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`flex-1 px-4 py-3 rounded-2xl text-[14px] text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
                            ${canConfirm ? `${v.confirmBg} ${v.confirmShadow}` : 'bg-brand-border cursor-not-allowed'}`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : variant === 'danger' ? (
                            <Trash2 className="w-4 h-4" />
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
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
