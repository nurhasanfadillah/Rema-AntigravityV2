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
            {label && <label className="form-label font-bold text-text-secondary">{label}</label>}
            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value}
                    onChange={handleChange}
                    className={`form-input bg-brand-bg/50 border-brand-border focus:bg-brand-surface transition-all ${error ? 'border-status-error-text focus:ring-status-error-text/20' : ''}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-status-error-text ml-1 mt-1 font-bold">{error}</p>}
        </div>
    );
}
