export function getRelativeTimeString(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Baru saja';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} menit yang lalu`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        if (now.getDate() === then.getDate()) {
            return 'Hari ini';
        }
        if (now.getDate() - then.getDate() === 1 || (diffInHours >= 12 && diffInHours < 24)) {
            return 'Kemarin';
        }
        return `${diffInHours} jam yang lalu`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return 'Kemarin';
    }
    if (diffInDays < 7) {
        return `${diffInDays} hari yang lalu`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} minggu yang lalu`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} bulan yang lalu`;
    }

    return `${Math.floor(diffInDays / 365)} tahun yang lalu`;
}
