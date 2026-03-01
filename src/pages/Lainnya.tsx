import { Link } from 'react-router-dom';
import { Users, Package, LayoutGrid, Settings, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function Lainnya() {
    const menuItems = [
        { label: 'Keuangan', path: '/keuangan', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Mitra', path: '/mitra', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Kategori', path: '/kategori', icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Produk', path: '/produk', icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Pengaturan', path: '#', icon: Settings, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
    ];

    return (
        <div className="p-4 space-y-8 animate-fade-in">
            <div className="space-y-1.5 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Lainnya</h2>
                <p className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">Konfigurasi & Master Data</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link key={idx} to={item.path} className="block group animate-slide-up" style={{ animationDelay: `${idx * 75}ms`, animationFillMode: 'both' }}>
                            <Card className="flex flex-col items-center justify-center p-3 h-24 space-y-2 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-500 border-zinc-800/40 shadow-xl shadow-black/20 active:scale-95">
                                <div className={`p-2 rounded-xl ${item.bg} group-hover:scale-110 transition-all duration-500 ease-out`}>
                                    <Icon className={`w-5 h-5 ${item.color}`} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold text-center text-zinc-500 group-hover:text-zinc-200 transition-colors leading-tight uppercase tracking-wider">
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
