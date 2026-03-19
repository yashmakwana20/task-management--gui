import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Navbar />

                <main className="flex-1 p-6 md:p-8 lg:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;