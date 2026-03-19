import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 min-h-screen bg-gray-100">
                <Navbar />

                <div className="p-6 md:p-8 lg:p-7">
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Layout;