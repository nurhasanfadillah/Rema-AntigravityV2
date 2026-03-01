import { notify } from './notify';

/**
 * Parses generic backend (Supabase/PostgreSQL) errors and maps them to human-readable messages.
 * 
 * @param error The error object caught from the backend/store.
 * @param defaultMessage The fallback message if the error is unhandled.
 * @param context Optional context (e.g. 'Produk', 'Kategori') to make the message more specific.
 * @returns The parsed human-readable error message.
 */
export function parseBackendError(error: any, defaultMessage: string, context?: string): string {
    if (!error) return defaultMessage;

    // Supabase / PostgreSQL Error Codes
    const code = error.code || error?.error?.code;

    const entity = context ? context : 'Data tersebut';

    // 23503: foreign_key_violation
    if (code === '23503') {
        return `${entity} tidak dapat dihapus atau diubah karena masih digunakan pada data terkait lain (misalnya pada Pesanan). Silakan hapus data yang terkait dengan ${entity.toLowerCase()} ini terlebih dahulu.`;
    }

    // 23505: unique_violation
    if (code === '23505') {
        return `${entity} dengan nilai yang sama sudah ada dalam sistem. Harap gunakan nama atau identitas yang berbeda.`;
    }

    // Custom Error thrown from store manually
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return defaultMessage;
}

/**
 * Handles error display via toast notification with parsed human-readable message.
 *
 * @param error Error object.
 * @param defaultMessage Fallback message if parsing fails.
 * @param toastId Optional ID string for loading toast replacement.
 * @param context Optional context term (e.g., 'Kategori').
 */
export function handleBackendError(error: any, defaultMessage: string, toastId?: string, context?: string) {
    console.error(`[Backend Error] ${context || 'Unknown context'}:`, error);

    const humanReadableMessage = parseBackendError(error, defaultMessage, context);
    notify.error(humanReadableMessage, toastId);
}
