import { useNavigate } from "react-router-dom";

function UserDashboard() {
    const Navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem("token");

        Navigate("/");
    }

    return (
        <div>
            <h1>User Dashboard</h1>
            <p>View Your Tasks</p>

            <button onClick={logOut}>
                LogOut
            </button>
        </div>
    );
}

export default UserDashboard;