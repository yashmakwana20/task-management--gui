import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const Navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem("token");

        Navigate("/");
    }

    return (
        <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Task Manager</h1>

            <button className="bg-red-500 px-4 py-1 rounded hover:bg-red-600" onClick={logOut}>
                Logout
            </button>
        </div>
    );
};

export default Navbar;