import { Navigate } from "react-router-dom";
import { isAuthenticated, getDefaultRouteByRole } from "../utils/auth";

function PublicRoute({ children }) {
    if (isAuthenticated()) {
        return <Navigate to={getDefaultRouteByRole()} replace />;
    }

    return children;
}

export default PublicRoute;