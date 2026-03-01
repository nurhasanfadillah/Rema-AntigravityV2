import { Link } from 'react-router-dom';
import { Users, Package, LayoutGrid, Settings } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function Lainnya() {
    const menuItems = [
        { label: 'Data Mitra', path: '/mitra', icon: Users, color: 'text-blue-300', bg: 'bg-gradient-to-r from-blue-900/40 to-blue-800/40' },
        { label: 'Kategori Produk', path: '/kategori', icon: LayoutGrid, color: 'text-blue-300', bg: 'bg-gradient-to-r from-blue-900/40 to-blue-800/40' },
        { label: 'Data Produk', path: '/produk', icon: Package, color: 'text-blue-300', bg: 'bg-gradient-to-r from-blue-900/40 to-blue-800/40' },
        { label: 'Pengaturan', path: '#', icon: Settings, color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
    ];

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white">Lainnya</h2>
                <p className="text-zinc-400 text-sm">Kelola master data dan pengaturan</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link key={idx} to={item.path} className="block group">
                            <Card className="flex flex-col items-center justify-center p-6 space-y-3 hover:bg-gradient-to-br hover:from-blue-900/40 hover:to-transparent hover:border-blue-800/50 transition-all duration-300 h-full border-zinc-800/60">
                                <div className={`p-3 rounded-full ${item.bg}`}>
                                    <Icon className={`w-8 h-8 ${item.color}`} />
                                </div>
                                <span className="text-sm font-medium text-center text-zinc-200 group-hover:text-white transition-colors">
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
