import { useNavigate } from "react-router-dom";
import { clearAuthTokens } from "../utils/auth";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();

    const logOut = () => {
        clearAuthTokens();
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
    };

    return (
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm lg:hidden"
                        >
                            ☰
                        </button>
                    )}

                    <h1 className="text-xl font-bold text-gray-800">
                        Task Manager
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationBell />

                    <button
                        onClick={logOut}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;