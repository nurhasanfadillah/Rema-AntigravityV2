import { useEffect, useState, useCallback } from 'react';
import { useOrderStore, type Order, getOrderDisplayStatus, type OrderFilters } from '../../store/orderStore';
import { useMitraStore } from '../../store/mitraStore';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ChevronDown, ShoppingBag, Package, Filter, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

function PesananListItem({ order }: { order: Order }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const totalQty = order.order_details?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

    return (
        <Card className={`group relative overflow-hidden flex flex-col border-brand-border/80 transition-all duration-150 !p-0 ${isExpanded ? 'border-brand-accent/20 bg-brand-bg/40' : 'bg-brand-surface'}`}>
            {/* Accent left edge */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl transition-colors duration-300 ${isExpanded ? 'bg-gradient-to-b from-blue-500 to-blue-600' : 'bg-gradient-to-b from-brand-border to-brand-border'}`}></div>

            {/* Main Clickable Area — Navigate to Order Detail */}
            <div
                className="flex-1 cursor-pointer select-none active:bg-brand-bg/50 transition-colors"
                onClick={() => navigate(`/pesanan/${order.no_pesanan}`)}
            >
                <div className="flex flex-col gap-2 pt-4 pb-3 px-4 pl-5">
                    {/* Baris Pertama: Nama Mitra - Tanggal (Kiri) & Status Badge (Kanan) */}
                    <div className="flex items-start justify-between gap-3 w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0 mt-0.5">
                            <h3 className="text-[15px] font-bold text-text-primary font-display truncate tracking-tight leading-tight">
                                {order.mitra?.nama_mitra || 'Pelanggan'}
                            </h3>
                            <span className="shrink-0 text-[11px] text-text-tertiary flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-brand-border/80 hidden sm:block"></span>
                                <span className="hidden sm:inline-block">-</span>
                                {new Date(order.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <StatusBadge status={getOrderDisplayStatus(order)} size="sm" />
                        </div>
                    </div>

                    {/* Baris Kedua: No. Pesanan - Total Qty */}
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-mono text-[12px] text-text-muted uppercase tracking-wider">
                            {order.no_pesanan}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-brand-border shrink-0"></span>
                        <span className="text-[12px] text-text-tertiary flex items-center gap-1">
                            <Package className="w-3 h-3 text-text-muted" />
                            {totalQty} Pcs
                        </span>
                    </div>
                </div>

                {/* Expanded Content */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 pb-2' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="px-4 pl-5">
                            <div className="pt-3 border-t border-brand-border/60">
                                {order.order_details && order.order_details.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {order.order_details.map((detail, idx) => (
                                            <div
                                                key={detail.id || idx}
                                                className="flex gap-2.5 items-start border-l-2 border-brand-border pl-2.5 py-1.5 group/detail active:border-brand-accent/50 active:bg-brand-bg active:bg-brand-border/40 rounded-r-lg transition-all cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/pesanan/detail-item/${detail.id}`);
                                                }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <h4 className="text-sm font-bold text-text-secondary truncate pr-2 transition-colors">
                                                            {detail.products?.nama_produk || 'Produk Tanpa Nama'}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-text-tertiary bg-brand-bg px-1.5 py-0.5 rounded shrink-0">
                                                            {detail.qty} Pcs
                                                        </span>
                                                    </div>
                                                    {detail.deskripsi_desain ? (
                                                        <p className="text-xs text-text-tertiary line-clamp-1 leading-relaxed italic">
                                                            {detail.deskripsi_desain}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-text-muted italic">Tanpa deskripsi</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-2 text-center">
                                        <p className="text-xs text-text-muted italic">Detail pesanan kosong.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expand / Collapse Handle */}
            <div
                className="w-full flex flex-col items-center justify-center py-1.5 cursor-pointer active:bg-brand-border/40 transition-all border-t border-brand-bg min-h-[22px]"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
            >
                <div className={`w-10 h-1 rounded-full transition-all duration-300 ${isExpanded ? 'bg-brand-accent/30' : 'bg-brand-border'}`}></div>
                <ChevronDown className={`w-3 h-3 mt-1 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-accent/70' : ''}`} />
            </div>
        </Card>
    );
}

export function PesananList() {
    const { orders, totalOrders, fetchOrders, isLoading } = useOrderStore();
    const { mitras, fetchMitras } = useMitraStore();
    const { products, fetchProducts } = useProductStore();
    const navigate = useNavigate();

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState<OrderFilters>({});
    const [tempFilters, setTempFilters] = useState<OrderFilters & { status: string }>({
        startDate: '',
        endDate: '',
        mitraId: '',
        productId: '',
        status: 'Semua',
        sortBy: 'Baru ke Lama'
    });

    const isFiltered = Object.keys(activeFilters).length > 0;

    const doFetch = useCallback(() => {
        fetchOrders(page, limit, activeFilters);
    }, [fetchOrders, page, limit, activeFilters]);

    useEffect(() => {
        doFetch();
    }, [doFetch]);

    useEffect(() => {
        fetchMitras();
        fetchProducts();
    }, [fetchMitras, fetchProducts]);

    const applyFilter = () => {
        const filtersToApply: OrderFilters = {};
        if (tempFilters.startDate) filtersToApply.startDate = tempFilters.startDate;
        if (tempFilters.endDate) filtersToApply.endDate = tempFilters.endDate;
        if (tempFilters.mitraId) filtersToApply.mitraId = tempFilters.mitraId;
        if (tempFilters.productId) filtersToApply.productId = tempFilters.productId;
        if (tempFilters.status !== 'Semua') filtersToApply.status = tempFilters.status;
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
            status: 'Semua',
            sortBy: 'Baru ke Lama'
        });
        setActiveFilters({});
        setPage(1);
        setShowFilterModal(false);
    };

    const totalPages = Math.ceil(totalOrders / limit);

    return (
        <div className="p-4 flex flex-col min-h-screen pb-24 max-w-2xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-5">
                <Link to="/" className="p-2 -ml-2 text-text-tertiary rounded-full active:bg-brand-border/40 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title font-display">Data Pesanan</h2>
                    <p className="page-subtitle mt-0.5">Kelola transaksi dan progres pesanan</p>
                </div>
                <button
                    onClick={() => {
                        setTempFilters({
                            ...tempFilters,
                            ...activeFilters,
                            status: activeFilters.status || 'Semua',
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

            {/* Filter Indicator */}
            {isFiltered && (
                <div className="mb-4 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm overflow-x-auto whitespace-nowrap hide-scrollbar max-w-full">
                        <Filter className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold">Filter Aktif</span>
                        <button onClick={resetFilter} className="ml-1 p-0.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-300 rounded-full transition-colors shrink-0">
                            <X className="w-3 h-3 text-gray-700" />
                        </button>
                    </div>
                </div>
            )}

            {/* Primary Action Button */}
            <Button
                variant="primary"
                className="w-full mb-4 !py-3.5 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all bg-gradient-to-br from-blue-600 to-blue-700 border-none font-bold group"
                onClick={() => navigate('/pesanan/baru')}
            >
                <FileText className="w-5 h-5 group-active:rotate-12 transition-transform mr-2" />
                Buat Pesanan Baru
            </Button>

            {/* List Section */}
            <div className="space-y-3 flex-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-10 h-10 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin mb-4"></div>
                        <p className="text-sm text-text-tertiary">Memuat pesanan...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-brand-surface/50 rounded-2xl border border-brand-border border-dashed shadow-sm">
                        <ShoppingBag className="w-10 h-10 text-brand-border mx-auto mb-3" />
                        <p className="text-sm font-bold text-text-secondary">Tidak ada pesanan.</p>
                        <p className="text-xs text-text-tertiary mt-1">Belum ada data atau filter tidak cocok.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <PesananListItem key={order.no_pesanan} order={order} />
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalOrders > 0 && (
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
                        <span>dari {totalOrders} data</span>
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
                                <h3 className="font-bold text-text-primary text-lg">Filter Data Pesanan</h3>
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
                                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={tempFilters.startDate}
                                        onChange={(e) => setTempFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">S/D Tanggal</label>
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
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Nama Mitra</label>
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
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Kategori / Produk</label>
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

                            {/* Status */}
                            <div>
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Status Pesanan</label>
                                <select
                                    className="w-full bg-brand-bg border-brand-border rounded-xl px-3 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    value={tempFilters.status}
                                    onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="Semua">Semua Status</option>
                                    <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                    <option value="Diproses">Diproses</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Urutkan Data</label>
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
                                    className="font-bold !py-3 rounded-xl"
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={applyFilter}
                                    className="font-bold !py-3 rounded-xl shadow-lg shadow-gray-400/20 !bg-gray-800 active:!bg-gray-900 border-none"
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
