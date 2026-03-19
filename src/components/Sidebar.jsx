import { NavLink } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const Sidebar = () => {
    const userRole = getUserRole();

    const navClass = ({ isActive }) =>
        `block rounded-xl px-4 py-3 text-base font-medium transition ${isActive
            ? "bg-blue-600 text-white shadow"
            : "text-gray-200 hover:bg-white/10 hover:text-white"
        }`;

    return (
        <aside className="w-64 bg-slate-950 text-white min-h-screen px-4 py-6 shadow-lg">
            <div className="mb-8 px-2">
                <h2 className="text-3xl font-bold tracking-tight">Menu</h2>
                <p className="text-sm text-slate-400 mt-1">Task Management</p>
            </div>

            <nav className="space-y-2">
                <NavLink to="/dashboard" className={navClass}>
                    Dashboard
                </NavLink>

                <NavLink to="/tasks" className={navClass}>
                    Tasks
                </NavLink>

                {userRole === "admin" && (
                    <NavLink to="/admin" className={navClass}>
                        Admin Dashboard
                    </NavLink>
                )}

                {userRole === "user" && (
                    <NavLink to="/user" className={navClass}>
                        User Dashboard
                    </NavLink>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;