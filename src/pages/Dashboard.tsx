import { Link } from 'react-router-dom';
import { Users, LayoutGrid, Package, ShoppingCart, PackageOpen, Wallet, Building2, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';

const menuItems = [
    { label: 'Pesanan', path: '/pesanan', icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Produksi', path: '/produksi', icon: PackageOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Mitra', path: '/mitra', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Keuangan', path: '/keuangan', icon: Wallet, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Kategori', path: '/kategori', icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Produk', path: '/produk', icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export function Dashboard() {
    return (
        <div className="flex flex-col pb-4">

            {/* ══════════════════════════════════════
                Welcome Banner
            ══════════════════════════════════════ */}
            <div className="relative mx-4 mt-4 mb-3 rounded-2xl overflow-hidden">

                {/* ── Background layers ── */}
                {/* Base gradient: biru gelap → zinc-950 agar blend halus ke warna app */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700/25 via-blue-900/20 to-zinc-950" />
                {/* Fade bottom agar menyatu ke konten di bawah */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
                {/* Blueprint grid subtle */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(147,197,253,0.6) 1px, transparent 1px),' +
                            'linear-gradient(90deg, rgba(147,197,253,0.6) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                    }}
                />
                {/* Glow orb kanan atas */}
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
                {/* Glow orb kiri bawah */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-800/15 rounded-full blur-2xl pointer-events-none" />

                {/* ── Border accent tipis ── */}
                <div className="absolute inset-0 rounded-2xl border border-blue-800/25" />

                {/* ── Content ── */}
                <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-[14px]">

                    {/* Teks kiri */}
                    <div className="flex-1 min-w-0">
                        {/* Company label */}
                        <div className="flex items-center gap-1.5 mb-[7px]">
                            <Building2 className="w-[10px] h-[10px] text-blue-400/70 flex-shrink-0" strokeWidth={2} />
                            <span className="text-[9.5px] font-extrabold tracking-[0.12em] uppercase text-blue-400/70 font-sans">
                                PT. Redone Berkah Mandiri Utama
                            </span>
                        </div>

                        {/* Heading */}
                        <h2 className="font-display text-[17px] font-extrabold leading-snug tracking-tight text-white mb-[5px]">
                            Selamat Datang 👋
                        </h2>

                        {/* Deskripsi */}
                        <p className="text-[11px] leading-[1.55] text-zinc-400/90 font-normal max-w-[220px]">
                            Platform manajemen pesanan, produksi &amp; keuangan bisnis Anda.
                        </p>
                    </div>

                    {/* Icon kanan */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/12 border border-blue-500/20 shadow-md shadow-blue-900/20">
                        <Sparkles className="w-[18px] h-[18px] text-blue-400" strokeWidth={1.8} />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                Section Label
            ══════════════════════════════════════ */}
            <div className="px-5 pb-2">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                    Menu Utama
                </p>
            </div>

            {/* ══════════════════════════════════════
                Navigation Grid — 4 cols
            ══════════════════════════════════════ */}
            <div className="px-4">
                <div className="grid grid-cols-4 gap-2">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="block group transition-all duration-300 animate-slide-up"
                                style={{ animationDelay: `${idx * 55}ms`, animationFillMode: 'both' }}
                            >
                                <Card
                                    className={`
                                        flex flex-col items-center justify-center
                                        py-3 px-1 h-[72px] space-y-1.5
                                        border-zinc-800/40
                                        shadow-lg shadow-black/20
                                        hover:bg-zinc-900/70
                                        hover:border-zinc-700/40
                                        active:scale-95
                                        transition-all duration-400
                                    `}
                                >
                                    {/* Icon badge */}
                                    <div
                                        className={`
                                            p-1.5 rounded-xl ${item.bg}
                                            group-hover:scale-110 group-hover:rotate-3
                                            transition-all duration-400 ease-out
                                        `}
                                    >
                                        <Icon className={`w-[15px] h-[15px] ${item.color}`} strokeWidth={2.5} />
                                    </div>

                                    {/* Label */}
                                    <span className="text-[9px] font-bold text-center text-zinc-500 group-hover:text-zinc-200 transition-colors leading-tight uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
