import React from 'react';

export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`bg-zinc-900 rounded-xl border border-zinc-800 shadow-md shadow-black/20 p-4 ${className}`}
        >
            {children}
        </div>
    );
}
