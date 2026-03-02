import { supabase } from './supabase';

/**
 * Modul/entitas yang didukung oleh sistem audit trail.
 */
export type ActivityModule = 'Pesanan' | 'Detail Pesanan' | 'Produk' | 'Kategori' | 'Mitra' | 'Keuangan';

/**
 * Jenis aksi yang dicatat oleh sistem audit trail.
 */
export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'CANCEL';

/**
 * Parameter untuk mencatat satu entri aktivitas.
 */
export interface ActivityLogParams {
    module: ActivityModule;
    action: ActivityAction;
    description: string;
    referenceId?: string;
    oldValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
    metadata?: Record<string, any> | null;
}

/**
 * Mencatat aktivitas ke tabel `activity_logs` secara fire-and-forget.
 * Logging TIDAK BOLEH menggagalkan operasi utama — error hanya di-log ke console.
 *
 * @param params - Data aktivitas yang akan dicatat
 */
export async function logActivity(params: ActivityLogParams): Promise<void> {
    try {
        const payload = {
            // user_id dan user_role menggunakan default dari database
            // sampai sistem autentikasi diimplementasikan
            module: params.module,
            action: params.action,
            description: params.description,
            reference_id: params.referenceId || null,
            old_value: params.oldValue || null,
            new_value: params.newValue || null,
            metadata: params.metadata || null,
        };

        const { error } = await supabase.from('activity_logs').insert([payload]);

        if (error) {
            console.error('[ActivityLogger] Gagal mencatat aktivitas:', error.message);
        }
    } catch (err) {
        // Fire-and-forget: jangan pernah throw error dari logger
        console.error('[ActivityLogger] Exception saat mencatat aktivitas:', err);
    }
}
