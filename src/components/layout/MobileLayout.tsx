import { Outlet } from 'react-router-dom';


import { BottomNavigation } from './BottomNavigation';

export function MobileLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 max-w-md mx-auto shadow-2xl relative">
            {/* Top Header */}
            <header className="bg-zinc-950 px-4 py-3 flex items-center justify-between border-b border-zinc-800/60 transition-all duration-200">
                <div className="flex items-center gap-2.5">
                    {/* Brand Logo */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/40">
                        <span className="font-bold text-white text-sm">R</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[15px] font-extrabold tracking-tight text-white/95">REMA</span>
                        <span className="text-[9px] font-medium text-zinc-500 tracking-wide">v2.0 &middot; Redone Execution</span>
                    </div>
                </div>


            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full overflow-y-auto pb-20 no-scrollbar">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
}
