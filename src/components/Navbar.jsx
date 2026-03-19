import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
    const navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        toast.success("Logged out successfully");
        navigate("/");
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 md:px-8 py-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Task Manager
                </h1>

                <button
                    onClick={logOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;