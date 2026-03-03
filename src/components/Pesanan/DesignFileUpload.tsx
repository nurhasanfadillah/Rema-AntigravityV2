import { useState, useRef } from 'react';
import { FileText, X, Loader2, Plus, FilePlus } from 'lucide-react';
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
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (paths.length + files.length > 10) {
            notify.error('Maksimal 10 file yang dapat diupload per pesanan.');
            // Kosongkan input
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB

        const validFiles = files.filter(file => {
            if (!validTypes.includes(file.type)) {
                notify.error(`Tipe file ${file.name} tidak didukung. Harap upload JPG, PNG, atau PDF.`);
                return false;
            }
            if (file.size > MAX_SIZE) {
                notify.error(`Ukuran file ${file.name} melebihi 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const toastId = notify.loading(`Mengupload ${validFiles.length} file...`);
        try {
            setIsUploading(true);
            const uploadPromises = validFiles.map(file => uploadOrderFile(file, 'design'));
            const newUploadedPaths = await Promise.all(uploadPromises);

            const newPaths = [...paths, ...newUploadedPaths];
            onChange(newPaths);
            notify.success(`${validFiles.length} file desain berhasil diupload`, toastId);
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    File Desain ({paths.length}/10)
                </label>
                <span className="text-[10px] text-text-tertiary font-medium">Maks. 10MB/file</span>
            </div>

            {paths.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {paths.map((path, idx) => (
                        <div
                            key={idx}
                            className="relative aspect-square rounded-2xl bg-brand-bg border border-brand-border overflow-hidden group shadow-sm"
                        >
                            {isImage(path) ? (
                                <img
                                    src={getOrderFileUrl(path) || ''}
                                    alt={`Design ${idx}`}
                                    className="w-full h-full object-cover transition-transform"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 bg-brand-accent-light/30">
                                    <FileText className="w-6 h-6 text-brand-accent/80" />
                                    <span className="text-[9px] text-text-tertiary font-mono font-medium truncate w-full text-center px-1">
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
                                className="absolute top-1.5 right-1.5 p-1 bg-red-500/90 hover:bg-red-500 active:bg-red-600 text-white rounded-full shadow-sm transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {paths.length < 10 && (
                <div className={paths.length > 0 ? "pt-2" : ""}>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{ minHeight: '44px' }}
                        className={`
                            w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-brand-surface text-text-primary border border-brand-border font-bold text-sm
                            active:bg-brand-bg transition-colors shadow-sm
                            ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <FilePlus className="w-5 h-5 text-text-secondary" />
                        )}
                        <span>{isUploading ? 'Mengupload...' : 'Upload File Desain'}</span>
                    </button>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleUpload}
            />
        </div>
    );
}
