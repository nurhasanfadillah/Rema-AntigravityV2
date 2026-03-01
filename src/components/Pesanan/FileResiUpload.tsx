import { useState, useRef } from 'react';
import { FileText, X, Loader2, UploadCloud } from 'lucide-react';
import { uploadOrderFile, deleteOrderFile, getOrderFileUrl } from '../../utils/orderStorage';
import { notify } from '../../utils/notify';

interface FileResiUploadProps {
    value: string | null;
    onChange: (path: string | null) => void;
}

export function FileResiUpload({ value, onChange }: FileResiUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(getOrderFileUrl(value));

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = notify.loading('Mengupload resi...');
        try {
            setIsUploading(true);

            // Atomic upload: Upload to storage -> Delete old if exist -> Update local state
            const newPath = await uploadOrderFile(file, 'resi');

            if (value) {
                await deleteOrderFile(value);
            }

            onChange(newPath);
            setPreviewUrl(getOrderFileUrl(newPath));
            notify.success('Resi berhasil diupload', toastId);
        } catch (error: any) {
            notify.error(error.message || 'Gagal upload resi', toastId);
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        if (!value) return;

        const toastId = notify.loading('Menghapus resi...');
        try {
            setIsUploading(true);
            await deleteOrderFile(value);
            onChange(null);
            setPreviewUrl(null);
            notify.success('Resi berhasil dihapus', toastId);
        } catch (error) {
            notify.error('Gagal menghapus resi', toastId);
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-1.5 w-full">
            <div
                className={`
                    relative w-full bg-zinc-900 border-2 border-dashed 
                    ${value ? 'border-blue-900/50' : 'border-zinc-700 hover:border-blue-600'} 
                    rounded-xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-center
                    cursor-pointer group min-h-[140px]
                `}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                {value ? (
                    <div className="flex flex-col items-center gap-3 p-4">
                        <div className="p-4 rounded-full bg-blue-900/20 text-blue-400">
                            <FileText className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-medium text-white block mb-1">Resi Uploaded</span>
                            <a
                                href={previewUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-blue-400 hover:underline"
                            >
                                Lihat File (PDF)
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-blue-400 transition-colors p-4">
                        <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-blue-900/20">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-semibold block">Klik untuk Upload Resi</span>
                            <span className="text-[10px] text-zinc-600 block mt-1">Hanya mendukung format PDF (Maks 10MB)</span>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}

                {!isUploading && value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 z-20"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleUpload}
            />
        </div>
    );
}
