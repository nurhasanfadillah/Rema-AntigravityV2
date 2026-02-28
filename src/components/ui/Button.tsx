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
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-blue-600/50",
        secondary: "bg-[#2a2a2a] hover:bg-[#333333] text-white border border-gray-700",
        outline: "bg-transparent border border-gray-600 text-gray-200 hover:bg-gray-800",
        ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-gray-800"
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
