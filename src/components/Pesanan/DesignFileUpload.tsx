import { useState, useRef } from 'react';
import { FileText, X, Loader2, Plus } from 'lucide-react';
import { uploadOrderFile, deleteOrderFile, getOrderFileUrl } from '../../utils/orderStorage';
import { notify } from '../../utils/notify';

interface DesignFileUploadProps {
    value: string[] | null;
    onChange: (paths: string[] | null) => void;
}

export function DesignFileUpload({ value, onChange }: DesignFileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const paths = value || [];

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = notify.loading('Mengupload file desain...');
        try {
            setIsUploading(true);
            const newPath = await uploadOrderFile(file, 'design');
            const newPaths = [...paths, newPath];
            onChange(newPaths);
            notify.success('File desain berhasil diupload', toastId);
        } catch (error: any) {
            notify.error(error.message || 'Gagal upload file desain', toastId);
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async (pathToRemove: string) => {
        const toastId = notify.loading('Menghapus file...');
        try {
            setIsUploading(true);
            await deleteOrderFile(pathToRemove);
            const newPaths = paths.filter(p => p !== pathToRemove);
            onChange(newPaths.length > 0 ? newPaths : null);
            notify.success('File desain berhasil dihapus', toastId);
        } catch (error) {
            notify.error('Gagal menghapus file desain', toastId);
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const isImage = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-tertiary">File Desain (Pilih Multiple JPG/PNG/PDF)</label>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                {paths.map((path, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-square rounded-2xl bg-brand-bg border border-brand-border overflow-hidden group shadow-soft"
                    >
                        {isImage(path) ? (
                            <img
                                src={getOrderFileUrl(path) || ''}
                                alt={`Design ${idx}`}
                                className="w-full h-full object-cover transition-transform"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 bg-brand-accent-light/30">
                                <FileText className="w-8 h-8 text-brand-accent/80" />
                                <span className="text-[10px] text-text-tertiary font-mono font-medium truncate w-full text-center px-2">
                                    DOC (PDF)
                                </span>
                            </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-transparent">
                            <a
                                href={getOrderFileUrl(path) || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-blue-600/90 text-white rounded-full shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                            </a>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(path);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500/90 active:bg-red-600 text-white rounded-full shadow-sm"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`
                        aspect-square rounded-2xl border-2 border-dashed border-brand-border active:border-brand-accent/50 
                        active:bg-brand-accent-light/50 transition-all flex flex-col items-center justify-center gap-2
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-accent/50 hover:bg-brand-accent-light/30'}
                    `}
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <div className="p-2 rounded-full bg-brand-surface border border-brand-border shadow-soft group-hover:border-brand-accent/30">
                                <Plus className="w-5 h-5 text-text-tertiary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Tambah File</span>
                        </>
                    )}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleUpload}
            />
        </div>
    );
}
