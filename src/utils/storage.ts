import { supabase } from './supabase';

export const BUCKET_NAME = 'products';

// Allowed file types
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Max size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadProductImage = async (file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (error) {
        throw error;
    }

    // Return the path
    return data.path;
};

export const deleteProductImage = async (path: string) => {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        console.error('Failed to delete image from storage:', error);
    }
};

export const getImageUrl = (path: string | null) => {
    if (!path) return null;

    // Check if it's already a full URL
    if (path.startsWith('http')) return path;

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

    return data.publicUrl;
};
