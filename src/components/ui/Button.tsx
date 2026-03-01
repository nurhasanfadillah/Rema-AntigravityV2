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
    const baseStyle = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
    const variants = {
        primary: "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-600/20 border border-blue-600/10",
        secondary: "bg-brand-bg hover:bg-brand-border active:bg-brand-bg text-text-primary border border-brand-border shadow-sm",
        outline: "bg-transparent border border-brand-border text-text-secondary hover:bg-brand-bg hover:text-text-primary active:bg-brand-border/20",
        ghost: "bg-transparent text-brand-accent hover:bg-brand-accent-light active:bg-brand-accent/10"
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
