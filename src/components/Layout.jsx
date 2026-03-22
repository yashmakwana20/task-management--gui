import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div className="min-h-screen bg-gray-100">

            {/* Sidebar - mobile */}
            <div className="md:hidden border-t border-gray-200 bg-gray-900 text-white">
                <Sidebar />
            </div>

            <div className="flex min-h-screen">
                {/* Sidebar - desktop */}
                <aside className="hidden md:block w-64 bg-gray-900 text-white shadow-lg">
                    <div className="sticky top-0 h-screen overflow-y-auto">
                        <Sidebar />
                    </div>
                </aside>

                {/* Main content area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="sticky top-0 z-20 bg-white shadow-sm">
                        <Navbar />
                    </div>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

        </div>
    );
}

export default Layout;