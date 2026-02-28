import { useState, useRef } from 'react';
import { FileText, X, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadOrderFile, deleteOrderFile, getOrderFileUrl } from '../../utils/orderStorage';

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

        try {
            setIsUploading(true);
            const newPath = await uploadOrderFile(file, 'design');
            const newPaths = [...paths, newPath];
            onChange(newPaths);
            toast.success('File desain berhasil diupload');
        } catch (error: any) {
            toast.error(error.message || 'Gagal upload file desain');
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async (pathToRemove: string) => {
        try {
            setIsUploading(true);
            await deleteOrderFile(pathToRemove);
            const newPaths = paths.filter(p => p !== pathToRemove);
            onChange(newPaths.length > 0 ? newPaths : null);
            toast.success('File desain berhasil dihapus');
        } catch (error) {
            toast.error('Gagal menghapus file desain');
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
                <label className="block text-sm font-medium text-zinc-400">File Desain (Pilih Multiple JPG/PNG/PDF)</label>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                {paths.map((path, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-square rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group shadow-md"
                    >
                        {isImage(path) ? (
                            <img
                                src={getOrderFileUrl(path) || ''}
                                alt={`Design ${idx}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 bg-gradient-to-br from-zinc-900 to-zinc-950">
                                <FileText className="w-8 h-8 text-blue-500/80" />
                                <span className="text-[10px] text-zinc-500 font-mono font-medium truncate w-full text-center">
                                    PDF Document
                                </span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-sm"
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
                        aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-blue-600/50 
                        hover:bg-blue-900/5 transition-all flex flex-col items-center justify-center gap-2
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <div className="p-2 rounded-full bg-zinc-800/50">
                                <Plus className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-[10px] font-medium text-zinc-500">Tambah File</span>
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
