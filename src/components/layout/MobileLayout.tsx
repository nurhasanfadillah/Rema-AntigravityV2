import { Outlet } from 'react-router-dom';


import { BottomNavigation } from './BottomNavigation';

export function MobileLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-text-primary max-w-md mx-auto shadow-2xl relative">
            {/* Top Header */}
            <header className="bg-brand-surface px-4 py-2.5 flex items-center justify-center border-b border-brand-border transition-all duration-200 sticky top-0 z-50">
                <div className="flex items-center justify-center w-full">
                    <div className="flex items-center justify-center max-w-[200px] sm:max-w-[260px]">
                        <img
                            src="/LOGO_HEADER_REMVAV2.png"
                            alt="REMA Logo"
                            className="h-9 sm:h-[42px] object-contain transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        />
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
