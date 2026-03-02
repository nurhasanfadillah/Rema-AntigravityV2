export type OrderStatus = 'Menunggu Konfirmasi' | 'Diproses' | 'Packing' | 'Selesai' | 'Dibatalkan';
export type OrderDetailStatus = 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';
export type OrderSource = 'Online' | 'Offline';

export interface OrderTransitionRule {
    from: OrderStatus[];
    to: OrderStatus;
    prerequisites: (order: any) => string | null; // Returns error message if not met
    consequences: string[];
    requiresReason?: boolean;
    doubleConfirmation?: boolean;
}

export interface DetailTransitionRule {
    from: OrderDetailStatus[];
    to: OrderDetailStatus;
    prerequisites: (order: any, detail: any) => string | null;
    consequences: string[];
}

export const ORDER_TRANSITIONS: OrderTransitionRule[] = [
    {
        from: ['Menunggu Konfirmasi'],
        to: 'Diproses',
        prerequisites: (order) => {
            if (order.sumber_pesanan === 'Online' && !order.file_resi) {
                return 'File Resi wajib diunggah untuk pesanan Online sebelum diproses.';
            }
            if (order.sumber_pesanan === 'Offline') {
                if (!order.nama_penerima || !order.kontak_penerima || !order.alamat_penerima) {
                    return 'Data penerima (Nama, Kontak, Alamat) wajib diisi untuk pesanan Offline.';
                }
            }
            return null;
        },
        consequences: ['Status pesanan akan berubah menjadi Diproses.', 'Item pesanan sekarang dapat mulai dikerjakan.'],
    },
    {
        from: ['Diproses'],
        to: 'Packing',
        prerequisites: (order) => {
            const allDetailsDone = order.order_details?.every((d: any) => d.status === 'Selesai');
            if (!allDetailsDone) {
                return 'Semua item pesanan harus berstatus "Selesai" sebelum masuk tahap Packing.';
            }
            return null;
        },
        consequences: ['Status pesanan akan berubah menjadi Packing.'],
    },
    {
        from: ['Packing'],
        to: 'Selesai',
        prerequisites: () => null,
        consequences: ['Status pesanan akan menjadi Selesai.', 'Pesanan dianggap tuntas dan tercatat di sistem.'],
        doubleConfirmation: true,
    },
    {
        from: ['Menunggu Konfirmasi', 'Diproses', 'Packing', 'Selesai'],
        to: 'Dibatalkan',
        prerequisites: () => null,
        consequences: ['Pesanan akan dibatalkan.', 'Seluruh proses produksi akan dihentikan.', 'Status akan berubah menjadi "Dibatalkan" dan tercatat di Audit Trail.'],
        requiresReason: true,
        doubleConfirmation: true,
    }
];

export const DETAIL_TRANSITIONS: DetailTransitionRule[] = [
    {
        from: ['Menunggu'],
        to: 'Cetak DTF',
        prerequisites: (order) => {
            if (order.status !== 'Diproses') {
                return 'Item hanya dapat diproses (dipindahkan dari status Menunggu) jika status Pesanan adalah "Diproses".';
            }
            return null;
        },
        consequences: ['Item masuk ke tahap produksi Cetak DTF.'],
    },
    {
        from: ['Cetak DTF'],
        to: 'Sablon',
        prerequisites: () => null,
        consequences: ['Item masuk ke tahap produksi Sablon.'],
    },
    {
        from: ['Sablon'],
        to: 'Selesai',
        prerequisites: () => null,
        consequences: ['Item ditandai Selesai.', 'Jika semua item selesai, status pesanan otomatis akan berubah menjadi "Packing".'],
    }
];

export const isValidOrderTransition = (from: OrderStatus, to: OrderStatus) => {
    if (from === to) return false;
    return ORDER_TRANSITIONS.some(rule => rule.from.includes(from) && rule.to === to);
};

export const getOrderTransitionRule = (from: OrderStatus, to: OrderStatus) => {
    return ORDER_TRANSITIONS.find(rule => rule.from.includes(from) && rule.to === to);
};

export const isValidDetailTransition = (from: OrderDetailStatus, to: OrderDetailStatus) => {
    if (from === to) return false;
    // Allow any transition if not from Menunggu or to Selesai? 
    // Let's be strict.
    return DETAIL_TRANSITIONS.some(rule => rule.from.includes(from) && rule.to === to);
};

export const getDetailTransitionRule = (from: OrderDetailStatus, to: OrderDetailStatus) => {
    return DETAIL_TRANSITIONS.find(rule => rule.from.includes(from) && rule.to === to);
};
