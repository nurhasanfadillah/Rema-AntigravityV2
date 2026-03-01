import { CheckCircle2, Clock, Package, XCircle, Printer, Scissors } from 'lucide-react';

export type OrderStatus = 'Menunggu Konfirmasi' | 'Diproses' | 'Packing' | 'Selesai' | 'Dibatalkan';
export type DetailStatus = 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';

interface StatusBadgeProps {
    status: OrderStatus | DetailStatus;
    size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
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
                    icon: status === 'Packing' ? <Package className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} /> : <Scissors className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
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
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-medium`}>
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

    return (
        <div className="w-full py-2">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 z-0"></div>
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center group">
                            <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isCompleted ? 'bg-blue-500 border-blue-500' :
                                    isActive ? 'bg-zinc-950 border-blue-500 animate-pulse' :
                                        'bg-zinc-950 border-zinc-700'
                                    }`}
                            >
                                {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                            </div>

                            {/* Tooltip or Label - only show active or on hover if mobile? */}
                            {/* For now, just a tiny dot/circle is enough, maybe label below if space permits or only for active */}
                            {isActive && (
                                <span className="absolute -bottom-5 text-[9px] font-bold text-blue-400 whitespace-nowrap uppercase tracking-tighter">
                                    {step}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
