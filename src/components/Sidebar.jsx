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
        <aside className="w-56 lg:w-60 flex-shrink-0 bg-gray-900 text-white min-h-full p-3 lg:p-4 overflow-y-auto">
            <h2 className="text-lg font-bold mb-6">Task Management</h2>

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

                {userRole === "admin" && (
                    <NavLink to="/assign-tasks" className={navClass}>
                        Assign Tasks
                    </NavLink>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;