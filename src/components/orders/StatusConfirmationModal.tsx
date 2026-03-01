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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`p-6 border-b border-zinc-900 flex items-center justify-between ${isCritical ? 'bg-gradient-to-r from-red-500/10 to-transparent' : 'bg-gradient-to-r from-blue-500/10 to-transparent'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {isCritical ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Konfirmasi Perubahan</h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Transition Display */}
                    <div className="flex items-center justify-center gap-4 py-4 px-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                        <div className="text-center">
                            <p className="section-label mb-1">Dari</p>
                            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                                {currentStatus}
                            </span>
                        </div>
                        <div className="flex flex-col items-center pt-4">
                            <div className="w-8 h-[1px] bg-zinc-700"></div>
                        </div>
                        <div className="text-center">
                            <p className="section-label text-blue-400 mb-1">Ke</p>
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-900 to-blue-800 text-blue-100 text-xs font-bold border border-blue-700 shadow-lg shadow-blue-500/10">
                                {targetStatus}
                            </span>
                        </div>
                    </div>

                    {/* Prerequisites Check */}
                    {prerequisiteError ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-300 mb-1">Gagal Prasyarat</p>
                                <p className="text-xs text-red-200 leading-relaxed">{prerequisiteError}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="section-label flex items-center gap-2">
                                    Konsekuensi Perubahan
                                </p>
                                <ul className="space-y-2">
                                    {consequences.map((c, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-zinc-400">
                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0"></div>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {requiresReason && (
                                <div className="space-y-2">
                                    <label className="section-label">
                                        Alasan Perubahan <span className="text-red-500 font-bold">*Wajib</span>
                                    </label>
                                    <textarea
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                        rows={3}
                                        placeholder="Tulis alasan perubahan status di sini..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    ></textarea>
                                </div>
                            )}

                            {showDoubleConfirmation && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3 animate-in slide-in-from-top-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                                    <p className="text-xs text-orange-200 leading-relaxed font-bold">
                                        Ini adalah tindakan kritis. Apakah Anda benar-benar yakin ingin melanjutkan?
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-zinc-900/30 border-t border-zinc-900 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl text-zinc-400 font-bold hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                            ${!canConfirm || isLoading
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : isCritical
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-red-500/20'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-blue-500/20'
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
