import { Link } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const Sidebar = () => {
    const userRole = getUserRole();

    return (
        <div className="w-60 bg-gray-900 text-white min-h-screen p-4">
            <h2 className="text-lg font-bold mb-6">Menu</h2>

            <ul className="space-y-3">
                <li>
                    <Link to="/dashboard" className="hover:text-gray-300">
                        Dashboard
                    </Link>
                </li>

                <li>
                    <Link to="/tasks" className="hover:text-gray-300">
                        Tasks
                    </Link>
                </li>

                {userRole === "admin" && (
                    <li>
                        <Link to="/admin" className="hover:text-gray-300">
                            Admin
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;