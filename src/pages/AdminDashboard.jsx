import { useNavigate } from "react-router-dom";
function AdminDashboard() {
    const Navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem("token");

        Navigate("/");
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Manage User and Tasks</p>

            <button onClick={logOut}>
                LogOut
            </button>
        </div>
    );
}

export default AdminDashboard;