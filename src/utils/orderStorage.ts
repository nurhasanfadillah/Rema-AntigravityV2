import { supabase } from './supabase';

export const ORDER_BUCKET = 'orders';

// Allowed file types for Resi
export const RESI_ALLOWED_TYPES = ['application/pdf'];

// Allowed file types for Design
export const DESIGN_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Max size (10MB for orders)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const generateUniqueFileName = (file: File) => {
    const fileExt = file.name.split('.').pop();
    const uuid = crypto.randomUUID();
    const timestamp = Date.now();
    return `${uuid}-${timestamp}.${fileExt}`;
};

export const uploadOrderFile = async (file: File, folder: 'resi' | 'design') => {
    // Validate file type
    const allowedTypes = folder === 'resi' ? RESI_ALLOWED_TYPES : DESIGN_ALLOWED_TYPES;
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Format file tidak didukung. Gunakan ${folder === 'resi' ? 'PDF' : 'JPG, PNG, atau PDF'}.`);
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Ukuran file terlalu besar. Maksimal 10MB.');
    }

    const fileName = generateUniqueFileName(file);
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(ORDER_BUCKET)
        .upload(filePath, file);

    if (error) {
        throw error;
    }

    return data.path;
};

export const deleteOrderFile = async (path: string) => {
    const { error } = await supabase.storage
        .from(ORDER_BUCKET)
        .remove([path]);

    if (error) {
        console.error('Failed to delete file from storage:', error);
    }
};

export const getOrderFileUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const { data } = supabase.storage
        .from(ORDER_BUCKET)
        .getPublicUrl(path);

    return data.publicUrl;
};
