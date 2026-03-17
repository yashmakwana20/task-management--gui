import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1">
                <Navbar />

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;