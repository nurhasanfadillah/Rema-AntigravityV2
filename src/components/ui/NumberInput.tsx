import React from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
}

export function NumberInput({ value, onChange, label, error, className = '', ...props }: NumberInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits to be entered
        const val = e.target.value.replace(/\D/g, '');
        onChange(val);
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-300 ml-1">{label}</label>}
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value}
                    onChange={handleChange}
                    className={`w-full bg-[#1e1e1e] border ${error ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-colors`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
        </div>
    );
}
