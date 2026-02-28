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
            {label && <label className="block text-sm font-medium text-zinc-300 ml-1">{label}</label>}
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border ${error ? 'border-red-500/50' : 'border-zinc-800 focus:border-blue-600/50'} rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-600/50'} transition-all`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
        </div>
    );
}
