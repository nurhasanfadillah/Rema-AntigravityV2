import { Link } from 'react-router-dom';
import { Users, Package, LayoutGrid, Settings, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function Lainnya() {
    const menuItems = [
        { label: 'Keuangan', path: '/keuangan', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Mitra', path: '/mitra', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Kategori', path: '/kategori', icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Produk', path: '/produk', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Pengaturan', path: '#', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-100' },
    ];

    return (
        <div className="p-4 space-y-8 animate-fade-in max-w-lg mx-auto w-full">
            <div className="space-y-1.5 px-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Lainnya</h2>
                <p className="text-text-tertiary text-[10px] font-bold tracking-widest uppercase opacity-80">Konfigurasi & Master Data</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link key={idx} to={item.path} className="block group animate-slide-up" style={{ animationDelay: `${idx * 75}ms`, animationFillMode: 'both' }}>
                            <Card className="flex flex-col items-center justify-center p-3 h-28 space-y-3 hover:bg-brand-bg hover:border-brand-accent/30 transition-all duration-500 bg-brand-surface border-brand-border shadow-sm shadow-black/[0.03] active:scale-95 rounded-3xl">
                                <div className={`p-3 rounded-2xl ${item.bg} group-hover:scale-110 transition-all duration-500 ease-out border border-transparent group-hover:border-current/10 shadow-sm shadow-black/[0.02]`}>
                                    <Icon className={`w-6 h-6 ${item.color}`} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold text-center text-text-tertiary group-hover:text-text-primary transition-colors leading-tight uppercase tracking-widest">
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
