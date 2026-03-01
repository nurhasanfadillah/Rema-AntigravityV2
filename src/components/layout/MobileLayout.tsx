import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';

export function MobileLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 max-w-md mx-auto shadow-2xl relative">
            {/* Top Header */}
            <header className="bg-zinc-950 px-4 py-3 flex items-center justify-between border-b border-zinc-800/60 transition-all duration-200">
                <div className="flex items-center gap-2.5">
                    {/* Brand Logo Placeholder */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/40">
                        <span className="font-bold text-white text-sm">R</span>
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight text-white/90">REMA <span className="text-blue-500 font-bold">v2</span></h1>
                </div>

                <Link to="/lainnya" className="p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all border border-zinc-800/60 active:scale-95">
                    <Settings className="w-5 h-5" />
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full overflow-y-auto pb-20 no-scrollbar">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation />

            {/* Global Toaster for notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#18181b', // zinc-900
                        color: '#f4f4f5', // zinc-100
                        border: '1px solid #27272a', // zinc-800
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                    },
                    success: {
                        iconTheme: { primary: '#3b82f6', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                }}
            />
        </div>
    );
}
