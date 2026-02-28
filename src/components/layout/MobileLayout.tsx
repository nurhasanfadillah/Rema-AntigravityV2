import { Outlet } from 'react-router-dom';

export function MobileLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 max-w-md mx-auto shadow-2xl relative left-0 right-0">
            {/* Top Header */}
            <header className="sticky top-0 z-50 bg-blue-600 px-4 py-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    {/* Brand Logo Placeholder */}
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                        R
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight text-white">REMA v2</h1>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full overflow-y-auto pb-24">
                {/* Safe area padding bottom for mobile browsers */}
                <Outlet />
            </main>
        </div>
    );
}
