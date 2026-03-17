import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

function RoleProtectedRoute({ children, role }) {
    const userRole = getUserRole();

    if (!userRole) {
        return <Navigate to="/" replace />;
    }

    if (role && userRole !== role.toLowerCase()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default RoleProtectedRoute;