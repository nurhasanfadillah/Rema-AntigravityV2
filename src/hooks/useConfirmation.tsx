import { useState, useCallback } from 'react';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import type { ConfirmVariant } from '../components/ui/ConfirmationModal';


// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
    title: string;
    description?: string;
    subject?: string;
    variant?: ConfirmVariant;
    cancelLabel?: string;
    confirmLabel?: string;
    requiresDoubleConfirm?: boolean;
    requiresReason?: boolean;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    consequences?: string[];
}

type ConfirmResolver = (value: { confirmed: boolean; reason?: string }) => void;

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean;
    resolver: ConfirmResolver | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook untuk memunculkan modal konfirmasi secara programatik.
 *
 * Cara pakai:
 *   const { confirm, ConfirmDialog } = useConfirmation();
 *   // Di JSX: <ConfirmDialog />
 *   // Di handler:
 *   const { confirmed, reason } = await confirm({ title: 'Hapus?', variant: 'danger' });
 *   if (confirmed) { ... }
 */
export function useConfirmation() {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        resolver: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<{ confirmed: boolean; reason?: string }> => {
        return new Promise((resolve) => {
            setState({
                ...options,
                isOpen: true,
                resolver: resolve,
            });
        });
    }, []);

    const handleClose = useCallback(() => {
        state.resolver?.({ confirmed: false });
        setState(prev => ({ ...prev, isOpen: false, resolver: null }));
    }, [state.resolver]);

    const handleConfirm = useCallback(async (reason?: string) => {
        state.resolver?.({ confirmed: true, reason });
        setState(prev => ({ ...prev, isOpen: false, resolver: null }));
    }, [state.resolver]);

    const ConfirmDialog = useCallback(() => (
        <ConfirmationModal
            isOpen={state.isOpen}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title={state.title}
            description={state.description}
            subject={state.subject}
            variant={state.variant}
            cancelLabel={state.cancelLabel}
            confirmLabel={state.confirmLabel}
            requiresDoubleConfirm={state.requiresDoubleConfirm}
            requiresReason={state.requiresReason}
            reasonLabel={state.reasonLabel}
            reasonPlaceholder={state.reasonPlaceholder}
            consequences={state.consequences}
        />
    ), [state, handleClose, handleConfirm]);

    return { confirm, ConfirmDialog };
}
