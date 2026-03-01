import { CheckCircle2, Clock, Package, XCircle, Printer, Layers } from 'lucide-react';

export type OrderStatus = 'Menunggu Konfirmasi' | 'Diproses' | 'Packing' | 'Selesai' | 'Dibatalkan';
export type DetailStatus = 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';

interface StatusBadgeProps {
    status: OrderStatus | DetailStatus;
    size?: 'sm' | 'md';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Selesai':
                return {
                    bg: 'bg-emerald-500/10',
                    text: 'text-emerald-400',
                    border: 'border-emerald-500/20',
                    icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
                    label: 'Selesai'
                };
            case 'Dibatalkan':
                return {
                    bg: 'bg-red-500/10',
                    text: 'text-red-400',
                    border: 'border-red-500/20',
                    icon: <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
                    label: 'Dibatalkan'
                };
            case 'Menunggu Konfirmasi':
            case 'Menunggu':
                return {
                    bg: 'bg-amber-500/10',
                    text: 'text-amber-400',
                    border: 'border-amber-500/20',
                    icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
                    label: status
                };
            case 'Diproses':
            case 'Cetak DTF':
                return {
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-400',
                    border: 'border-blue-500/20',
                    icon: <Printer className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
                    label: status
                };
            case 'Packing':
            case 'Sablon':
                return {
                    bg: 'bg-indigo-500/10',
                    text: 'text-indigo-400',
                    border: 'border-indigo-500/20',
                    icon: status === 'Packing' ? <Package className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} /> : <Layers className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
                    label: status
                };
            default:
                return {
                    bg: 'bg-zinc-500/10',
                    text: 'text-zinc-400',
                    border: 'border-zinc-500/20',
                    icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
                    label: status
                };
        }
    };

    const styles = getStatusStyles(status);

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-medium ${className}`}>
            {styles.icon}
            <span>{styles.label}</span>
        </div>
    );
};

interface StatusStepperProps {
    currentStatus: OrderStatus | DetailStatus;
    type: 'order' | 'detail';
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, type }) => {
    const orderSteps: OrderStatus[] = ['Menunggu Konfirmasi', 'Diproses', 'Packing', 'Selesai'];
    const detailSteps: DetailStatus[] = ['Menunggu', 'Cetak DTF', 'Sablon', 'Selesai'];

    const steps = type === 'order' ? orderSteps : detailSteps;
    const currentIndex = steps.indexOf(currentStatus as any);

    if (currentStatus === 'Dibatalkan') {
        return (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20 w-full mb-4">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-red-400">Pesanan Dibatalkan</span>
            </div>
        );
    }

    const getStepIcon = (step: string) => {
        switch (step) {
            case 'Menunggu Konfirmasi':
            case 'Menunggu':
                return <Clock className="w-3.5 h-3.5" />;
            case 'Diproses':
            case 'Cetak DTF':
                return <Printer className="w-3.5 h-3.5" />;
            case 'Packing':
            case 'Sablon':
                return <Layers className="w-3.5 h-3.5" />;
            case 'Selesai':
                return <CheckCircle2 className="w-3.5 h-3.5" />;
            default:
                return <Package className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative px-2">
                {/* Progress Line Background */}
                <div className="absolute top-[18px] left-0 w-full h-[2px] bg-zinc-800 z-0"></div>

                {/* Active Progress Line */}
                <div
                    className="absolute top-[18px] left-0 h-[2px] bg-blue-500 z-0 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${isCompleted
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : isActive
                                        ? 'bg-zinc-950 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                                    }`}
                            >
                                {getStepIcon(step)}
                            </div>

                            {/* State Indicator dots (Subtle) */}
                            <div className={`mt-2 w-1.5 h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-blue-500' : isActive ? 'bg-blue-400 animate-bounce' : 'bg-transparent'
                                }`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
