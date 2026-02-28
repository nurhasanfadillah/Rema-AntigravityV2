import { useState, useRef } from 'react';
import { Camera, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadProductImage, deleteProductImage, getImageUrl } from '../../utils/storage';

interface ProductImageUploadProps {
    value: string | null;
    onChange: (path: string | null) => void;
    onDelete?: (path: string) => void;
}

export function ProductImageUpload({ value, onChange, onDelete }: ProductImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(getImageUrl(value));

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);

            // Delete old file if exists
            if (value) {
                await deleteProductImage(value);
                if (onDelete) onDelete(value);
            }

            const path = await uploadProductImage(file);
            onChange(path);
            setPreviewUrl(getImageUrl(path));
            toast.success('Foto berhasil diupload');
        } catch (error: any) {
            toast.error(error.message || 'Gagal upload foto');
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        if (!value) return;

        try {
            setIsUploading(true);
            await deleteProductImage(value);
            if (onDelete) onDelete(value);
            onChange(null);
            setPreviewUrl(null);
            toast.success('Foto berhasil dihapus');
        } catch (error) {
            toast.error('Gagal menghapus foto');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300 ml-1">Foto Produk</label>
            <div className="relative group">
                <div
                    className={`
                        relative aspect-square w-full sm:w-48 bg-zinc-900 border-2 border-dashed 
                        ${previewUrl ? 'border-blue-900/50' : 'border-zinc-700 hover:border-blue-600'} 
                        rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center
                        cursor-pointer group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]
                    `}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-blue-400 transition-colors">
                            <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-blue-900/20">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-medium">Tambah Foto</span>
                        </div>
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {!isUploading && previewUrl && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="p-2 rounded-full bg-blue-600/90 text-white shadow-lg">
                                <Camera className="w-5 h-5" />
                            </div>
                        </div>
                    )}
                </div>

                {previewUrl && !isUploading && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 z-20"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                />
            </div>
            <p className="text-[10px] text-zinc-500 ml-1">JPG, PNG, WebP (Maks 5MB)</p>
        </div>
    );
}
