/**
 * ─── Centralized Notification System ─────────────────────────────────────────
 *
 * ATURAN WAJIB:
 * - SELALU gunakan `notify.*` — jangan pernah import `toast` langsung di komponen.
 * - Satu event = satu toast. Tidak ada duplikasi.
 * - Untuk async: pakai pola `loading → success/error` dengan update ID.
 *
 * ARSITEKTUR DEDUPLIKASI:
 * - Setiap tipe pemanggilan menggunakan `toast.custom()` dengan **ID eksplisit**.
 * - `loading()` menulis ke slot ID tetap, lalu `success/error(msg, id)` UPDATE
 *   slot yang sama (tidak membuat toast baru).
 * - `activeToasts` Set mencegah duplikasi sinkron (misal dari StrictMode double-invoke).
 * - Semua toast tanpa ID digenerate dengan hash dari pesan + tipe untuk deduplikasi.
 */

import toast, { type Toast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import React from 'react';

// ─── Deduplikasi: set ID toast yang sedang aktif ──────────────────────────────
// Mencegah double-fire dari React.StrictMode atau handler yang dipanggil ganda.
const _pendingIds = new Set<string>();

function _genId(type: string, message: string): string {
    // Hash sederhana: type + 10 karakter pertama pesan (cukup untuk deduplikasi per aksi)
    return `${type}:${message.slice(0, 32)}`;
}

// ─── Renderer helper (JSX dikembalikan sebagai function agar tidak re-instansi) ──

function _renderToast(
    t: Toast,
    message: string,
    icon: React.ReactNode,
    borderColor: string,
) {
    return (
        <div
            role={borderColor.includes('68,68') ? 'alert' : 'status'}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: '#18181b',
                color: '#f4f4f5',
                border: `1px solid ${borderColor}`,
                borderRadius: '14px',
                padding: '12px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.4',
                maxWidth: '340px',
                width: '100%',
                opacity: t.visible ? 1 : 0,
                transition: 'opacity 0.18s ease',
                pointerEvents: 'auto',
            }}
        >
            <span style={{ flexShrink: 0, marginTop: '1px' }}>{icon}</span>
            <span style={{ flex: 1 }}>{message}</span>
        </div>
    );
}

// ─── Duration constants ───────────────────────────────────────────────────────
const DURATION = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3500,
} as const;

// ─── Core show function (single entry point for all toasts) ───────────────────
function _show(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    idOverride?: string,
): string {
    const id = idOverride ?? _genId(type, message);

    // Deduplikasi: jika ID ini baru saja ditampilkan tanpa override, skip
    if (!idOverride && _pendingIds.has(id)) {
        return id;
    }
    _pendingIds.add(id);
    setTimeout(() => _pendingIds.delete(id), 500);

    const configs = {
        success: {
            border: 'rgba(16,185,129,0.35)',
            icon: <CheckCircle size={18} style={{ color: '#34d399' }} />,
            duration: DURATION.success,
        },
        error: {
            border: 'rgba(239,68,68,0.35)',
            icon: <XCircle size={18} style={{ color: '#f87171' }} />,
            duration: DURATION.error,
        },
        warning: {
            border: 'rgba(245,158,11,0.35)',
            icon: <AlertTriangle size={18} style={{ color: '#fbbf24' }} />,
            duration: DURATION.warning,
        },
        info: {
            border: 'rgba(59,130,246,0.35)',
            icon: <Info size={18} style={{ color: '#60a5fa' }} />,
            duration: DURATION.info,
        },
    };

    const cfg = configs[type];

    toast.custom(
        (t) => _renderToast(t, message, cfg.icon, cfg.border),
        { id, duration: cfg.duration, position: 'bottom-center' },
    );

    return id;
}

// ─── Loading toast ────────────────────────────────────────────────────────────
function _loading(message: string, id?: string): string {
    const toastId = id ?? _genId('loading', message);

    const spinnerIcon = (
        <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            style={{ color: '#818cf8', flexShrink: 0, animation: 'spin 1s linear infinite' }}
        >
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );

    toast.custom(
        (t) => _renderToast(t, message, spinnerIcon, 'rgba(99,102,241,0.35)'),
        { id: toastId, duration: Infinity, position: 'bottom-center' },
    );

    return toastId;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Tampilkan toast sukses.
 * Jika `id` diberikan (dari `notify.loading()`), GANTIKAN toast loading itu.
 * @example  notify.success('Data berhasil disimpan');
 * @example  notify.success('Berhasil', loadingId);
 */
function success(message: string, id?: string): string {
    return _show('success', message, id);
}

/**
 * Tampilkan toast error.
 * Jika `id` diberikan, GANTIKAN toast loading itu.
 * @example  notify.error('Gagal menyimpan data');
 * @example  notify.error(err.message, loadingId);
 */
function error(message: string, id?: string): string {
    return _show('error', message, id);
}

/**
 * Tampilkan toast warning — untuk validasi / peringatan.
 * @example  notify.warning('File wajib diunggah');
 */
function warning(message: string, id?: string): string {
    return _show('warning', message, id);
}

/**
 * Tampilkan toast info.
 * @example  notify.info('Data sedang diproses');
 */
function info(message: string, id?: string): string {
    return _show('info', message, id);
}

/**
 * Tampilkan toast loading untuk operasi async.
 * SELALU simpan return value-nya sebagai `toastId`, lalu pass ke success/error.
 *
 * @example
 *   const id = notify.loading('Menyimpan...');
 *   try {
 *     await saveData();
 *     notify.success('Tersimpan', id);   // menggantikan loading
 *   } catch (e) {
 *     notify.error('Gagal', id);         // menggantikan loading
 *   }
 */
function loading(message: string, id?: string): string {
    return _loading(message, id);
}

/**
 * Dismiss toast secara manual (biasanya tidak perlu — success/error sudah auto-replace).
 */
function dismiss(id?: string): void {
    toast.dismiss(id);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const notify = { success, error, warning, info, loading, dismiss };
