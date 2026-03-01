import React from 'react';

export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`bg-brand-surface rounded-xl border border-brand-border shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-4 ${className}`}
        >
            {children}
        </div>
    );
}
