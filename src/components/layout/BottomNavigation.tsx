import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PackageOpen, Wallet } from 'lucide-react';

export function BottomNavigation() {
    const location = useLocation();

    const navItems = [
        { label: 'Home', path: '/', icon: LayoutDashboard },
        { label: 'Pesanan', path: '/pesanan', icon: ShoppingCart },
        { label: 'Produksi', path: '/produksi', icon: PackageOpen },
        { label: 'Keuangan', path: '/keuangan', icon: Wallet },
    ];

    // List of paths where the bottom navigation should be hidden
    const hiddenPaths = ['/pesanan/baru', '/pesanan/']; // Starts with these

    const shouldHide = hiddenPaths.some(path => {
        if (path === '/pesanan/') return location.pathname.startsWith('/pesanan/') && location.pathname !== '/pesanan';
        return location.pathname.startsWith(path);
    });

    if (shouldHide) return null;

    // Check if the current path starts with the nav item path
    // Special case for Home ('/') so it doesn't match everything
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-surface/95 backdrop-blur-md border-t border-brand-border/60 pb-safe z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <div className="flex justify-around items-center px-2 py-3">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200 active:scale-95 ${active ? 'text-brand-accent' : 'text-text-tertiary'}`}
                        >
                            <div className={`p-1.5 rounded-full transition-all duration-300 ${active ? 'bg-brand-accent-light text-brand-accent' : 'bg-transparent'}`}>
                                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold leading-none ${active ? 'text-brand-accent' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
