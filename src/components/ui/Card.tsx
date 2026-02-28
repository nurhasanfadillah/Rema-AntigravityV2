import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-zinc-900 rounded-xl border border-zinc-800 shadow-md shadow-black/20 p-4 ${className}`}>
            {children}
        </div>
    );
}
