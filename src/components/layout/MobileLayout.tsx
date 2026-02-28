import { Outlet } from 'react-router-dom';

export function MobileLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-[#121212] text-gray-100 max-w-md mx-auto shadow-2xl relative left-0 right-0">
            {/* Top Header */}
            <header className="sticky top-0 z-50 bg-[#1e1e1e]/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Brand Logo Placeholder */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                        R
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight">REMA v2</h1>
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
