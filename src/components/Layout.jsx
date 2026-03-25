import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex min-h-screen">
                {/* Mobile overlay */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* Mobile sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <Sidebar onLinkClick={() => setMobileSidebarOpen(false)} />
                </div>

                {/* Desktop sidebar */}
                <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Right content section */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

                    <main className="min-w-0 flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Layout;