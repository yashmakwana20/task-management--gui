import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        toast.success("Logged out successfully");
        navigate("/");
    };

    return (
        <div className="bg-white shadow px-8 py-5 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Task Manager</h1>

            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
                Logout
            </button>
        </div>
    );
};

export default Navbar;