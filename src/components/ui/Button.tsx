import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 text-white shadow-md shadow-blue-900/30 border border-blue-700/50",
        secondary: "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-white border border-zinc-700/50 shadow-sm",
        outline: "bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white active:bg-zinc-900",
        ghost: "bg-transparent text-blue-300 hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-blue-800/30 active:from-blue-900/50 active:to-blue-800/50"
    };

    const spacingStyle = "px-4 py-3 text-sm"; // Mobile optimized touch target sizes
    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${spacingStyle} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
