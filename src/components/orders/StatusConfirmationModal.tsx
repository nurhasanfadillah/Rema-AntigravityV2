import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, Loader2 } from 'lucide-react';

interface StatusConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
    currentStatus: string;
    targetStatus: string;
    prerequisiteError?: string | null;
    consequences: string[];
    requiresReason?: boolean;
    isLoading?: boolean;
}

export const StatusConfirmationModal: React.FC<StatusConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentStatus,
    targetStatus,
    prerequisiteError,
    consequences,
    requiresReason,
    isLoading
}) => {
    const [reason, setReason] = useState('');
    const [showDoubleConfirmation, setShowDoubleConfirmation] = useState(false);

    if (!isOpen) return null;

    const isCritical = targetStatus === 'Dibatalkan' || targetStatus === 'Selesai';
    const canConfirm = !prerequisiteError && (!requiresReason || reason.trim().length > 0);

    const handleConfirm = () => {
        if (isCritical && !showDoubleConfirmation) {
            setShowDoubleConfirmation(true);
            return;
        }
        onConfirm(requiresReason ? reason : undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-overlay backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl shadow-premium overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`p-6 border-b border-brand-border flex items-center justify-between ${isCritical ? 'bg-status-error-bg/50' : 'bg-brand-accent-light/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isCritical ? 'bg-status-error-bg text-status-error-text' : 'bg-status-info-bg text-status-info-text'}`}>
                            {isCritical ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <h3 className="text-lg font-bold text-text-primary tracking-tight">Konfirmasi Perubahan</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-brand-bg rounded-full transition-all active:scale-95">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Transition Display */}
                    <div className="flex items-center justify-center gap-4 py-5 px-3 bg-brand-bg rounded-2xl border border-brand-border/50">
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1.5 px-2">Dari</p>
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-brand-surface text-text-secondary text-[11px] font-semibold border border-brand-border shadow-soft w-full">
                                {currentStatus}
                            </span>
                        </div>
                        <div className="flex flex-col items-center pt-5">
                            <div className="w-8 h-[2px] bg-brand-border rounded-full"></div>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-accent mb-1.5 px-2">Ke</p>
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-brand-accent text-white text-[11px] font-bold border border-brand-accent shadow-md shadow-brand-accent/20 w-full">
                                {targetStatus}
                            </span>
                        </div>
                    </div>

                    {/* Prerequisites Check */}
                    {prerequisiteError ? (
                        <div className="p-4 bg-status-error-bg border border-status-error-border rounded-2xl flex gap-3 animate-in shake-in">
                            <AlertTriangle className="w-5 h-5 text-status-error-text shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-status-error-text mb-1">Gagal Prasyarat</p>
                                <p className="text-xs text-status-error-text/80 leading-relaxed font-medium">{prerequisiteError}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <p className="section-label flex items-center gap-2 text-text-secondary">
                                    Konsekuensi Perubahan
                                </p>
                                <ul className="space-y-2.5">
                                    {consequences.map((c, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-text-secondary font-medium leading-relaxed">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0"></div>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {requiresReason && (
                                <div className="space-y-2">
                                    <label className="form-label font-bold flex justify-between">
                                        Alasan Perubahan <span className="text-status-error-text">*Wajib</span>
                                    </label>
                                    <textarea
                                        className="form-input min-h-[100px] resize-none"
                                        placeholder="Tulis alasan perubahan status di sini..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    ></textarea>
                                </div>
                            )}

                            {showDoubleConfirmation && (
                                <div className="p-4 bg-status-warning-bg border border-status-warning-border rounded-2xl flex gap-3 animate-in slide-in-from-top-2">
                                    <AlertTriangle className="w-5 h-5 text-status-warning-text shrink-0" />
                                    <p className="text-xs text-status-warning-text leading-relaxed font-bold">
                                        Ini adalah tindakan kritis. Apakah Anda benar-benar yakin ingin melanjutkan?
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-brand-bg/50 border-t border-brand-border flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-2xl text-text-secondary font-bold hover:bg-brand-bg active:scale-95 transition-all disabled:opacity-50 text-sm"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                        className={`flex-1 px-4 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm
                            ${!canConfirm || isLoading
                                ? 'bg-brand-border text-text-muted cursor-not-allowed shadow-none'
                                : isCritical
                                    ? 'bg-status-error-text text-white hover:bg-red-700 active:scale-95 shadow-status-error-text/20'
                                    : 'bg-brand-accent text-white hover:bg-brand-accent-dark active:scale-95 shadow-brand-accent/20'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                        {showDoubleConfirmation ? 'Ya, Lanjutkan' : 'Konfirmasi'}
                    </button>
                </div>
            </div>
        </div>
    );
};
