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
                <div className={`p-4 border-b border-brand-border flex items-center justify-between ${isCritical ? 'bg-status-error-bg/50' : 'bg-brand-accent-light/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-status-error-bg text-status-error-text' : 'bg-status-info-bg text-status-info-text'}`}>
                            {isCritical ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <h3 className="text-base font-bold text-text-primary tracking-tight">Konfirmasi Perubahan</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-text-tertiary active:text-text-primary active:bg-brand-bg rounded-full transition-all active:scale-95">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Status Transition Display */}
                    <div className="flex items-center justify-center gap-3 py-3 px-3 bg-brand-bg rounded-2xl border border-brand-border/50">
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 px-2">Dari</p>
                            <span className="inline-block px-2 py-1 rounded-lg bg-brand-surface text-text-secondary text-[10px] font-semibold border border-brand-border shadow-soft w-full">
                                {currentStatus}
                            </span>
                        </div>
                        <div className="flex flex-col items-center pt-4">
                            <div className="w-6 h-[1.5px] bg-brand-border rounded-full"></div>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-accent mb-1 px-2">Ke</p>
                            <span className="inline-block px-2 py-1 rounded-lg bg-brand-accent text-white text-[10px] font-bold border border-brand-accent shadow-md shadow-brand-accent/20 w-full">
                                {targetStatus}
                            </span>
                        </div>
                    </div>

                    {/* Prerequisites Check */}
                    {prerequisiteError ? (
                        <div className="p-3 bg-status-error-bg border border-status-error-border rounded-xl flex gap-2 animate-in shake-in">
                            <AlertTriangle className="w-4 h-4 text-status-error-text shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-status-error-text mb-0.5">Gagal Prasyarat</p>
                                <p className="text-[10px] text-status-error-text/80 leading-relaxed font-medium">{prerequisiteError}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                                    Konsekuensi
                                </p>
                                <ul className="space-y-1.5">
                                    {consequences.map((c, i) => (
                                        <li key={i} className="flex gap-2 text-[11px] text-text-secondary font-medium leading-relaxed">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-brand-accent shrink-0"></div>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {requiresReason && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary flex justify-between">
                                        Alasan Perubahan <span className="text-status-error-text font-black">*Wajib</span>
                                    </label>
                                    <textarea
                                        className="form-input min-h-[42px] py-2 px-3 text-xs resize-none overflow-hidden"
                                        placeholder="Tulis alasan singkat..."
                                        rows={1}
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                    ></textarea>
                                </div>
                            )}

                            {showDoubleConfirmation && (
                                <div className="p-3 bg-status-warning-bg border border-status-warning-border rounded-xl flex gap-2 animate-in slide-in-from-top-1">
                                    <AlertTriangle className="w-4 h-4 text-status-warning-text shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-status-warning-text leading-relaxed font-bold">
                                        Ini adalah tindakan kritis. Apakah Anda benar-benar yakin ingin melanjutkan?
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-brand-bg/50 border-t border-brand-border flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-xl text-text-secondary font-bold active:bg-brand-bg active:scale-95 transition-all disabled:opacity-50 text-xs"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                        className={`flex-1 px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs
                            ${!canConfirm || isLoading
                                ? 'bg-brand-border text-text-muted cursor-not-allowed shadow-none'
                                : isCritical
                                    ? 'bg-status-error-text text-white active:bg-red-700 active:scale-95 shadow-status-error-text/20'
                                    : 'bg-brand-accent text-white active:bg-brand-accent-dark active:scale-95 shadow-brand-accent/20'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        {showDoubleConfirmation ? 'Ya, Lanjutkan' : 'Konfirmasi'}
                    </button>
                </div>
            </div>
        </div>
    );
};
