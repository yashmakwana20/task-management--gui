import { Navigate } from "react-router-dom";

function ProctedRoute({ children }) {
    const token = localStorage.getItem("token");
    //const refreshToken = localStorage.getItem("refreshToken");

    if (!token) {
        return <Navigate to="/"></Navigate>
    }

    return children;
}

export default ProctedRoute;