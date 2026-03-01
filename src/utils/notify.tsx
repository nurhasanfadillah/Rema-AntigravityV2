/**
 * ─── Centralized Notification System ─────────────────────────────────────────
 *
 * Updated to use standard react-hot-toast with custom styles for maximum reliability.
 */

import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import React from 'react';

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
            bg: '#f0fdf4', // light emerald
            border: '#dcfce7',
            text: '#166534',
            icon: <CheckCircle className="text-emerald-500 w-5 h-5" />,
            duration: 3000,
        },
        error: {
            bg: '#fef2f2', // light red
            border: '#fee2e2',
            text: '#991b1b',
            icon: <XCircle className="text-red-500 w-5 h-5" />,
            duration: 5000,
        },
        warning: {
            bg: '#fffbeb', // light amber
            border: '#fef3c7',
            text: '#92400e',
            icon: <AlertTriangle className="text-amber-500 w-5 h-5" />,
            duration: 4000,
        },
        info: {
            bg: '#eff6ff', // light blue
            border: '#dbeafe',
            text: '#1e40af',
            icon: <Info className="text-blue-500 w-5 h-5" />,
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
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            color: '#374151',
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
