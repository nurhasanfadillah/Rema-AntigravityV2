import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-[#1e1e1e] rounded-xl border border-gray-800 shadow-sm p-4 ${className}`}>
            {children}
        </div>
    );
}
