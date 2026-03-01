import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyle = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
    const variants = {
        primary: "bg-gradient-to-br from-brand-accent to-brand-accent-dark hover:from-brand-accent-dark hover:to-blue-800 text-white shadow-md shadow-brand-accent/20 border border-brand-accent/10",
        secondary: "bg-brand-bg hover:bg-brand-border active:bg-brand-bg text-text-primary border border-brand-border shadow-sm",
        outline: "bg-transparent border border-brand-border text-text-secondary hover:bg-brand-bg hover:text-text-primary active:bg-brand-border/20",
        ghost: "bg-transparent text-brand-accent hover:bg-brand-accent-light active:bg-brand-accent/10"
    };

    const sizes = {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-3 text-sm",
        lg: "px-6 py-4 text-base"
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
