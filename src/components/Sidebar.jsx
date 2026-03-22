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
        <div className="h-full p-4">
            <h2 className="text-xl font-bold mb-6">Task Management</h2>

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
        </div>
    );
};

export default Sidebar;