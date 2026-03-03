/**
 * ─── Centralized Notification System ─────────────────────────────────────────
 *
 * Updated to use standard react-hot-toast with custom styles for maximum reliability.
 */

import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

// ─── Deduplikasi: set ID toast yang sedang aktif ──────────────────────────────
const _pendingIds = new Set<string>();

function _genId(type: string, message: string): string {
    return `${type}:${message.slice(0, 32)}`;
}

// ─── Core show function ───────────────────────────────────────────────────────
function _show(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    idOverride?: string,
): string {
    const id = idOverride ?? _genId(type, message);

    if (!idOverride && _pendingIds.has(id)) {
        return id;
    }
    _pendingIds.add(id);
    setTimeout(() => _pendingIds.delete(id), 500);

    const configs = {
        success: {
            bg: 'var(--color-status-success-bg)', // brand-status-success-bg
            border: 'var(--color-status-success-border)', // brand-status-success-border
            text: 'var(--color-status-success-text)', // brand-status-success-text
            icon: <CheckCircle className="text-emerald-600 w-5 h-5" />,
            duration: 3000,
        },
        error: {
            bg: 'var(--color-status-error-bg)', // brand-status-error-bg
            border: 'var(--color-status-error-border)', // brand-status-error-border
            text: 'var(--color-status-error-text)', // brand-status-error-text
            icon: <XCircle className="text-red-600 w-5 h-5" />,
            duration: 5000,
        },
        warning: {
            bg: 'var(--color-status-warning-bg)', // brand-status-warning-bg
            border: 'var(--color-status-warning-border)', // brand-status-warning-border
            text: 'var(--color-status-warning-text)', // brand-status-warning-text
            icon: <AlertTriangle className="text-amber-600 w-5 h-5" />,
            duration: 4000,
        },
        info: {
            bg: 'var(--color-status-info-bg)', // brand-status-info-bg
            border: 'var(--color-status-info-border)', // brand-status-info-border
            text: 'var(--color-status-info-text)', // brand-status-info-text
            icon: <Info className="text-blue-600 w-5 h-5" />,
            duration: 3500,
        },
    };

    const cfg = configs[type];

    toast(message, {
        id,
        duration: cfg.duration,
        position: 'top-center',
        icon: cfg.icon,
        style: {
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            padding: '12px 16px',
            color: cfg.text,
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            maxWidth: '360px',
            width: '100%',
        },
    });

    return id;
}

// ─── Loading toast ────────────────────────────────────────────────────────────
function _loading(message: string, id?: string): string {
    const toastId = id ?? _genId('loading', message);

    toast.loading(message, {
        id: toastId,
        position: 'top-center',
        style: {
            background: 'var(--color-brand-surface)',
            border: '1px solid var(--color-brand-border)',
            padding: '12px 16px',
            color: 'var(--color-text-primary)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            maxWidth: '360px',
            width: '100%',
        },
    });

    return toastId;
}

// ─── Public API ───────────────────────────────────────────────────────────────

function success(message: string, id?: string): string {
    return _show('success', message, id);
}

function error(message: string, id?: string): string {
    return _show('error', message, id);
}

function warning(message: string, id?: string): string {
    return _show('warning', message, id);
}

function info(message: string, id?: string): string {
    return _show('info', message, id);
}

function loading(message: string, id?: string): string {
    return _loading(message, id);
}

function dismiss(id?: string): void {
    toast.dismiss(id);
}

export const notify = { success, error, warning, info, loading, dismiss };
