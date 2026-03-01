import { CheckCircle2, Clock, Package, XCircle, Printer, Layers } from 'lucide-react';

export type OrderStatus = 'Menunggu Konfirmasi' | 'Diproses' | 'Packing' | 'Selesai' | 'Dibatalkan';
export type DetailStatus = 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';

// Generic status badge for Mitra / Produk active state
export type GenericStatus = 'Aktif' | 'Tidak Aktif';

interface StatusBadgeProps {
    status: OrderStatus | DetailStatus | GenericStatus;
    size?: 'sm' | 'md';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
    // Font size: sm = 11px (legible minimum), md = 12px (text-xs)
    const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Selesai':
                return {
                    className: 'badge-success',
                    icon: <CheckCircle2 className={iconSize} />,
                    label: 'Selesai'
                };
            case 'Aktif':
                return {
                    className: 'badge-success',
                    icon: <CheckCircle2 className={iconSize} />,
                    label: 'Aktif'
                };
            case 'Dibatalkan':
                return {
                    className: 'badge-error',
                    icon: <XCircle className={iconSize} />,
                    label: 'Dibatalkan'
                };
            case 'Tidak Aktif':
                return {
                    className: 'badge-error',
                    icon: <XCircle className={iconSize} />,
                    label: 'Tidak Aktif'
                };
            case 'Menunggu Konfirmasi':
            case 'Menunggu':
                return {
                    className: 'badge-warning',
                    icon: <Clock className={iconSize} />,
                    label: status
                };
            case 'Diproses':
            case 'Cetak DTF':
                return {
                    className: 'badge-info',
                    icon: <Printer className={iconSize} />,
                    label: status
                };
            case 'Packing':
            case 'Sablon':
                return {
                    className: 'badge-production',
                    icon: status === 'Packing'
                        ? <Package className={iconSize} />
                        : <Layers className={iconSize} />,
                    label: status
                };
            default:
                return {
                    className: 'badge-neutral',
                    icon: <Clock className={iconSize} />,
                    label: status
                };
        }
    };

    const styles = getStatusStyles(status);

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${styles.className} ${textSize} font-semibold ${className}`}>
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
            <div className="flex items-center gap-2 p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 w-full mb-4">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Pesanan Dibatalkan</span>
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

                            {/* State indicator dot */}
                            <div className={`mt-2 w-1.5 h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-blue-500' : isActive ? 'bg-blue-400 animate-bounce' : 'bg-transparent'
                                }`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
