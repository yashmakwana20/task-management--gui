import { useNavigate } from "react-router-dom";
import { clearAuthTokens } from "../utils/auth";
import toast from "react-hot-toast";

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();

    const logOut = () => {
        clearAuthTokens();
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 lg:hidden"
                    >
                        ☰
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                </div>

                <button
                    onClick={logOut}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 sm:px-5"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;