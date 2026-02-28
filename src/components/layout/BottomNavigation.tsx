import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users } from 'lucide-react';

export function BottomNavigation() {
    const location = useLocation();

    const navItems = [
        { label: 'Home', path: '/', icon: LayoutDashboard },
        { label: 'Pesanan', path: '/pesanan', icon: ShoppingCart },
        { label: 'Produk', path: '/produk', icon: Package },
        { label: 'Mitra', path: '/mitra', icon: Users },
    ];

    // Check if the current path starts with the nav item path
    // Special case for Home ('/') so it doesn't match everything
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 pb-safe z-50">
            <div className="flex justify-around items-center px-2 py-3">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-16 gap-1 transition-all duration-200 active:scale-95 ${active ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <div className={`p-1.5 rounded-full transition-all duration-300 ${active ? 'bg-blue-900/40 text-blue-400' : 'bg-transparent'}`}>
                                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-medium leading-none ${active ? 'text-blue-400' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
