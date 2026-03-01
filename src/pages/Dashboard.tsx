import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    LayoutGrid,
    Package,
    ShoppingCart,
    PackageOpen,
    Wallet,
    Building2,
    Sparkles,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Type Definitions
────────────────────────────────────────────── */
type MenuItem = {
    label: string;
    path: string;
    icon: React.ElementType;
    iconColor: string;
    /** Inline style for icon background — avoid Tailwind opacity fractions */
    iconBgStyle: React.CSSProperties;
};

type MenuGroup = {
    groupLabel: string;
    items: MenuItem[];
};

/* ──────────────────────────────────────────────
   Menu Data
────────────────────────────────────────────── */
const menuGroups: MenuGroup[] = [
    {
        groupLabel: 'Operasional',
        items: [
            {
                label: 'Pesanan',
                path: '/pesanan',
                icon: ShoppingCart,
                iconColor: 'text-white',
                iconBgStyle: { background: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
            },
            {
                label: 'Produksi',
                path: '/produksi',
                icon: PackageOpen,
                iconColor: 'text-white',
                iconBgStyle: { background: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
            },
        ],
    },
    {
        groupLabel: 'Master Data',
        items: [
            {
                label: 'Mitra',
                path: '/mitra',
                icon: Users,
                iconColor: 'text-white',
                iconBgStyle: { background: 'linear-gradient(135deg, #64748b, #334155)' }, // More "stable" blue/neutral
            },
            {
                label: 'Kategori',
                path: '/kategori',
                icon: LayoutGrid,
                iconColor: 'text-white',
                iconBgStyle: { background: 'linear-gradient(135deg, #64748b, #334155)' },
            },
            {
                label: 'Produk',
                path: '/produk',
                icon: Package,
                iconColor: 'text-white',
                iconBgStyle: { background: 'linear-gradient(135deg, #64748b, #334155)' },
            },
        ],
    },
    {
        groupLabel: 'Keuangan',
        items: [
            {
                label: 'Keuangan',
                path: '/keuangan',
                icon: Wallet,
                iconColor: 'text-white',
                iconBgStyle: { background: 'linear-gradient(135deg, #10b981, #065f46)' },
            },
        ],
    },
];

/* ──────────────────────────────────────────────
   MenuCell — Atomic unit: IconContainer + Label
   Fixed 68×68 icon, label max 1 baris truncate
 ────────────────────────────────────────────── */
function MenuCell({ item, delay }: { item: MenuItem; delay: number }) {
    const Icon = item.icon;
    return (
        <Link
            to={item.path}
            className="group flex flex-col items-center animate-slide-up"
            style={{
                animationDelay: `${delay}ms`,
                animationFillMode: 'both',
                gap: '8px',
                /* Touch target: minimal 44px vertical */
                minHeight: '44px',
                width: '100%',
            }}
        >
            {/* ── IconContainer: rounded square 58×58, radius 16px ── */}
            <div
                className="
                    relative flex-shrink-0 flex items-center justify-center
                    group-active:scale-[0.93]
                    transition-all duration-150 ease-out
                "
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '18px',
                    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.15)',
                    ...item.iconBgStyle,
                }}
            >
                <Icon
                    className={`${item.iconColor} relative z-10`}
                    style={{
                        width: '24px',
                        height: '24px',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                    strokeWidth={2.5}
                />
            </div>

            {/* ── Label: center, 12px, max 1 baris, truncate ── */}
            <span
                className="
                    text-center text-text-secondary
                    truncate w-full
                "
                style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    lineHeight: '16px',
                    maxWidth: '72px',
                }}
            >
                {item.label}
            </span>
        </Link>
    );
}

/* ──────────────────────────────────────────────
   MenuGroupCard — Grouping card per kategori
   4-column fixed grid, merata, no H-scroll
 ────────────────────────────────────────────── */
function MenuGroupCard({ group, baseDelay }: { group: MenuGroup; baseDelay: number }) {
    return (
        <div
            className="
                animate-slide-up
                rounded-2xl overflow-hidden
                border border-brand-border/60
                shadow-[0_8px_24px_rgba(0,0,0,0.04)]
            "
            style={{
                margin: '0 16px',
                backgroundColor: 'var(--color-brand-surface)',
                animationDelay: `${baseDelay}ms`,
                animationFillMode: 'both',
            }}
        >
            {/* ── Group Header ── */}
            <div style={{ padding: '12px 16px 10px' }}>
                <span
                    className="text-text-tertiary uppercase tracking-widest font-bold"
                    style={{ fontSize: '9.5px', letterSpacing: '0.12em' }}
                >
                    {group.groupLabel}
                </span>
            </div>
            {/* Divider */}
            <div className="bg-brand-border/40" style={{ height: '1px', marginLeft: '16px', marginRight: '16px' }} />

            {/* ── 4-Column Fixed Grid ──
                Selalu 4 slot kolom. justifyItems center = setiap item
                center di kolom masing-masing. Slot kolom tetap ada meski items < 4.
            ── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    rowGap: '24px',
                    padding: '18px 12px',
                    justifyItems: 'center',
                    alignItems: 'start',
                }}
            >
                {group.items.map((item, idx) => (
                    <MenuCell key={item.path} item={item} delay={baseDelay + idx * 50} />
                ))}
            </div>

            <div style={{ height: '4px' }} />
        </div>
    );
}

/* ──────────────────────────────────────────────
   Dashboard Page
 ────────────────────────────────────────────── */
export function Dashboard() {
    let cumulativeDelay = 60;

    return (
        /* overflow-x-hidden → no horizontal scroll, overflow-y dihandle parent main */
        <div className="flex flex-col overflow-x-hidden" style={{ paddingBottom: '24px' }}>

            {/* ══════════════════════════════════════
                Welcome Banner
            ══════════════════════════════════════ */}
            <div
                className="relative overflow-hidden rounded-2xl animate-slide-up"
                style={{ margin: '16px 16px 16px', animationFillMode: 'both' }}
            >
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),' +
                            'linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                    }}
                />
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl border border-white/10" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-[16px]">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-[8px]">
                            <Building2 className="w-[10px] h-[10px] text-blue-100/70 flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-[9.5px] font-extrabold tracking-[0.12em] uppercase text-blue-100/70 font-sans">
                                PT. Redone Berkah Mandiri Utama
                            </span>
                        </div>
                        <h2 className="font-display text-[18px] font-extrabold leading-snug tracking-tight text-white mb-[5px]">
                            Selamat Datang 👋
                        </h2>
                        <p className="text-[11.5px] leading-[1.55] text-blue-50/90 font-medium max-w-[220px]">
                            Platform manajemen pesanan, produksi &amp; keuangan bisnis Anda.
                        </p>
                    </div>
                    <div
                        className="flex-shrink-0 flex items-center justify-center rounded-xl border border-white/20 shadow-lg shadow-blue-900/10"
                        style={{ width: '46px', height: '46px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                        <Sparkles className="w-[20px] h-[20px] text-white" strokeWidth={1.8} />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                Menu Groups — 3 grouping card terpisah
            ══════════════════════════════════════ */}
            <div className="flex flex-col" style={{ gap: '12px' }}>
                {menuGroups.map((group) => {
                    const delay = cumulativeDelay;
                    cumulativeDelay += 70 + group.items.length * 50;
                    return (
                        <MenuGroupCard
                            key={group.groupLabel}
                            group={group}
                            baseDelay={delay}
                        />
                    );
                })}
            </div>
        </div>
    );
}
