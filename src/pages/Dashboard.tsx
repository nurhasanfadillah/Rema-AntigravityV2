import { Link } from 'react-router-dom';
import { Users, LayoutGrid, Package, ShoppingCart, PackageOpen, Settings } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function Dashboard() {
    const menuItems = [
        { label: 'Pesanan', path: '/pesanan', icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Produksi', path: '/produksi', icon: PackageOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { label: 'Mitra', path: '/mitra', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Kategori', path: '/kategori', icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Produk', path: '/produk', icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Lainnya', path: '/lainnya', icon: Settings, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
    ];

    return (
        <div className="p-4 space-y-8">
            <div className="space-y-1.5 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
                    Dashboard
                </h2>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">Sistem Manajemen Kelola</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={idx}
                            to={item.path}
                            className="block group transition-all duration-300 animate-slide-up"
                            style={{ animationDelay: `${idx * 75}ms`, animationFillMode: 'both' }}
                        >
                            <Card className="flex flex-col items-center justify-center p-3 h-24 space-y-2 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-500 border-zinc-800/40 shadow-xl shadow-black/20 active:scale-95 group-hover:shadow-blue-900/10">
                                <div className={`p-2 rounded-xl ${item.bg} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out`}>
                                    <Icon className={`w-5 h-5 ${item.color}`} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold text-center text-zinc-500 group-hover:text-zinc-200 transition-colors leading-tight uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
