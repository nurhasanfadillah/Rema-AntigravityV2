import { useEffect, useState, useCallback } from 'react';
import { PackageOpen, AlertCircle, Filter, X, ChevronLeft, ChevronRight, ArrowLeft, Hash, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useProduksiStore } from '../../store/produksiStore';
import type { ProduksiItem, ProduksiFilters } from '../../store/produksiStore';
import { useMitraStore } from '../../store/mitraStore';
import { useProductStore } from '../../store/productStore';
import { getRelativeTimeString } from '../../utils/dateUtils';

type TabStatus = 'Semua' | 'Menunggu' | 'Cetak DTF' | 'Sablon' | 'Selesai';

export function ProduksiList() {
    const { items, totalItems, totalFilteredQty, isLoading, fetchProduksi } = useProduksiStore();
    const { mitras, fetchMitras } = useMitraStore();
    const { products, fetchProducts } = useProductStore();
    const navigate = useNavigate();

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ProduksiFilters>({ statusDetail: 'Menunggu' });
    const [tempFilters, setTempFilters] = useState<ProduksiFilters>({
        startDate: '',
        endDate: '',
        mitraId: '',
        productId: '',
        statusDetail: 'Menunggu',
        sortBy: 'Baru ke Lama'
    });

    // Determine if any extra explicit filter is applied
    const isFiltered = Object.keys(activeFilters).some(k => {
        if (k === 'statusDetail') return false; // Handled as tabs, so we ignore for "extra" badge if we want (actually, in Pesanan we show badge if anything)
        if (k === 'sortBy' && activeFilters[k as keyof ProduksiFilters] === 'Baru ke Lama') return false;
        return !!activeFilters[k as keyof ProduksiFilters];
    });

    const isFullyFiltered = Object.keys(activeFilters).length > 0; // Show the top summary block all the time if there are items

    const doFetch = useCallback(() => {
        fetchProduksi(page, limit, activeFilters);
    }, [fetchProduksi, page, limit, activeFilters]);

    useEffect(() => {
        doFetch();
    }, [doFetch]);

    useEffect(() => {
        fetchMitras();
        fetchProducts();
    }, [fetchMitras, fetchProducts]);

    const applyFilter = () => {
        const filtersToApply: ProduksiFilters = {};
        if (tempFilters.startDate) filtersToApply.startDate = tempFilters.startDate;
        if (tempFilters.endDate) filtersToApply.endDate = tempFilters.endDate;
        if (tempFilters.mitraId) filtersToApply.mitraId = tempFilters.mitraId;
        if (tempFilters.productId) filtersToApply.productId = tempFilters.productId;
        filtersToApply.statusDetail = activeFilters.statusDetail; // Preserve tab status
        if (tempFilters.sortBy) filtersToApply.sortBy = tempFilters.sortBy;

        setActiveFilters(filtersToApply);
        setPage(1);
        setShowFilterModal(false);
    };

    const resetFilter = () => {
        setTempFilters({
            startDate: '',
            endDate: '',
            mitraId: '',
            productId: '',
            statusDetail: activeFilters.statusDetail, // Preserve tab status
            sortBy: 'Baru ke Lama'
        });
        setActiveFilters({ statusDetail: activeFilters.statusDetail });
        setPage(1);
        setShowFilterModal(false);
    };

    const tabs: { id: TabStatus; label: string }[] = [
        { id: 'Semua', label: 'Semua' },
        { id: 'Menunggu', label: 'Antri' },
        { id: 'Cetak DTF', label: 'Cetak' },
        { id: 'Sablon', label: 'Sablon' },
        { id: 'Selesai', label: 'Selesai' },
    ];

    const handleTabClick = (tabId: TabStatus) => {
        const newFilters = { ...activeFilters, statusDetail: tabId };
        setActiveFilters(newFilters);
        setTempFilters({ ...tempFilters, statusDetail: tabId });
        setPage(1);
    };

    const handleOpenDetail = (item: ProduksiItem) => {
        navigate(`/pesanan/detail-item/${item.id}`);
    };

    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-text-primary pb-20">
            {/* Header */}
            <header className="bg-brand-surface border-b border-brand-border pt-4 pb-3 shadow-sm">
                <div className="px-4 mb-4 flex items-center gap-3">
                    <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-full active:bg-brand-border/40 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="p-2 bg-brand-accent-light rounded-xl border border-brand-accent/20 shadow-sm shadow-brand-accent/5">
                        <PackageOpen className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold tracking-tight font-display text-text-primary leading-tight">Produksi</h2>
                        <p className="page-subtitle mt-0.5">Pusat kelola item produksi</p>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => {
                            setTempFilters({
                                ...tempFilters,
                                ...activeFilters,
                                statusDetail: activeFilters.statusDetail || 'Semua',
                                sortBy: activeFilters.sortBy || 'Baru ke Lama'
                            });
                            setShowFilterModal(true);
                        }}
                        className={`relative p-2.5 transition-all rounded-xl border active:scale-95 shadow-sm ${isFiltered
                            ? 'bg-gray-800 border-gray-900 text-white'
                            : 'bg-brand-surface border-gray-300 text-gray-700 active:bg-gray-100'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        {isFiltered && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                        )}
                    </button>
                </div>

                {/* Compact Segmented Control / Tabs */}
                <div className="px-4">
                    <div className="flex w-full bg-brand-bg/50 p-1 rounded-xl border border-brand-border/60">
                        {tabs.map((tab) => {
                            const isActive = activeFilters.statusDetail === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-lg transition-all duration-300 relative ${isActive
                                        ? 'bg-brand-surface text-text-primary shadow-sm ring-1 ring-black/5'
                                        : 'text-text-tertiary active:text-text-secondary'
                                        }`}
                                >
                                    {/* Tab label */}
                                    <span className={`text-[11px] uppercase font-extrabold tracking-tight transition-colors ${isActive ? 'text-text-primary' : 'text-text-tertiary'}`}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute -bottom-[-2px] w-6 h-[1.5px] bg-brand-accent rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 flex flex-col max-w-2xl mx-auto w-full">

                {/* Filter Indicator & Summary */}
                {isFullyFiltered && (
                    <div className="mb-4 flex flex-col gap-3 animate-in fade-in">
                        {isFiltered && (
                            <div className="flex items-center gap-1.5 text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm overflow-x-auto whitespace-nowrap hide-scrollbar max-w-full w-max">
                                <Filter className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[11px] font-bold">Filter Aktif</span>
                                <button onClick={resetFilter} className="ml-1 p-0.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-300 rounded-full transition-colors shrink-0">
                                    <X className="w-3 h-3 text-gray-700" />
                                </button>
                            </div>
                        )}

                        <Card className="flex items-center justify-between !py-3 !px-4 border-brand-border/60 bg-brand-surface shadow-sm divide-x divide-brand-border/60">
                            <div className="flex-1 flex items-center justify-center gap-2 pr-4">
                                <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                                    <Hash className="w-4 h-4" />
                                </div>
                                <span className="text-lg font-semibold text-text-primary font-mono leading-none">{totalItems}</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center gap-2 pl-4">
                                <div className="p-1.5 bg-blue-50 border border-blue-100/50 rounded-lg text-blue-600">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-semibold text-text-primary font-mono leading-none">{totalFilteredQty}</span>
                                    <span className="text-[11px] text-text-tertiary font-medium">pcs</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* List Section */}
                <div className="space-y-3 flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-10 h-10 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin mb-4"></div>
                            <p className="text-sm text-text-tertiary">Memuat produksi...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-brand-surface/50 rounded-2xl border border-brand-border border-dashed shadow-sm">
                            <AlertCircle className="w-10 h-10 text-text-muted mb-3" />
                            <p className="text-sm font-bold text-text-secondary">Tidak ada item produksi.</p>
                            <p className="text-xs text-text-tertiary mt-1">Belum ada data atau filter tidak cocok.</p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const relativeTime = getRelativeTimeString(item.created_at);
                            return (
                                <Card key={item.id} className="p-4 bg-brand-surface border-brand-border/60 active:border-brand-accent/30 transition-colors cursor-pointer group shadow-sm active:scale-[0.99]" onClick={() => handleOpenDetail(item)}>
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-start gap-4">
                                            <h4 className="font-bold text-text-primary leading-tight truncate transition-colors">
                                                {item.orders?.mitra?.nama_mitra || 'Tamu'}
                                            </h4>
                                            <p className="font-bold text-sm text-text-secondary shrink-0 text-right mt-0">
                                                {item.products?.nama_produk || 'Produk Dihapus'} <span className="text-text-muted mx-0.5">×</span> {item.qty}
                                            </p>
                                        </div>

                                        {item.deskripsi_desain ? (
                                            <p className="text-xs text-text-tertiary italic line-clamp-1 mt-1">
                                                {item.deskripsi_desain}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-text-muted italic line-clamp-1 mt-1">
                                                Tanpa catatan desain
                                            </p>
                                        )}
                                    </div>

                                    <div className="h-px bg-brand-border/40 my-3"></div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-text-tertiary">
                                                {new Date(item.orders?.tanggal || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-brand-border">•</span>
                                            <span className="text-xs text-text-muted font-medium">{relativeTime}</span>
                                        </div>
                                        <span className="section-label text-text-muted flex items-center gap-1.5">
                                            #{item.orders?.no_pesanan}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {!isLoading && totalItems > 0 && (
                    <div className="mt-6 pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary w-full sm:w-auto justify-between sm:justify-start">
                            <span>Menampilkan</span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="bg-brand-surface border border-brand-border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>dari {totalItems} data</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-brand-border text-text-secondary disabled:opacity-40 active:bg-brand-bg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-bold text-text-secondary px-2">
                                Halaman {page} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
                                disabled={page >= totalPages || totalPages === 0}
                                className="p-1.5 rounded-lg border border-brand-border text-text-secondary disabled:opacity-40 active:bg-brand-bg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFilterModal(false)}>
                    <Card
                        className="w-full max-w-md border-brand-border shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 pointer-events-auto max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5 sticky top-0 bg-brand-surface z-10 pb-2 border-b border-brand-border/60">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Filter className="w-5 h-5 text-gray-700" />
                                </div>
                                <h3 className="font-semibold text-text-primary text-lg">Filter Produksi</h3>
                            </div>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="p-2 text-text-tertiary active:bg-brand-bg rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1.5 ml-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={tempFilters.startDate}
                                        onChange={(e) => setTempFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary block mb-1.5 ml-1">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={tempFilters.endDate}
                                        onChange={(e) => setTempFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Mitra */}
                            <div>
                                <label className="text-sm font-medium text-text-secondary block mb-1.5 ml-1">Nama Mitra</label>
                                <select
                                    className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    value={tempFilters.mitraId}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, mitraId: e.target.value }))}
                                >
                                    <option value="">Semua Mitra</option>
                                    {mitras.map(m => (
                                        <option key={m.id} value={m.id}>{m.nama_mitra}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Product */}
                            <div>
                                <label className="text-sm font-medium text-text-secondary block mb-1.5 ml-1">Produk</label>
                                <select
                                    className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    value={tempFilters.productId}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, productId: e.target.value }))}
                                >
                                    <option value="">Semua Produk</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama_produk}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="text-sm font-medium text-text-secondary block mb-1.5 ml-1">Urutkan Data</label>
                                <select
                                    className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    value={tempFilters.sortBy}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                                >
                                    <option value="Baru ke Lama">Baru ke Lama</option>
                                    <option value="Lama ke Baru">Lama ke Baru</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2.5 pt-4 border-t border-brand-border/60 sticky bottom-0 bg-brand-surface">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={resetFilter}
                                    className="font-semibold !py-3 rounded-xl"
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={applyFilter}
                                    className="font-semibold !py-3 rounded-xl shadow-lg shadow-gray-400/20 !bg-gray-800 active:!bg-gray-900 border-none"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter Data
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
