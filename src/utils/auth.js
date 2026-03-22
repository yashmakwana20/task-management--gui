import { jwtDecode } from "jwt-decode";

function getDecodedToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}

export function getUserRole() {
    const decoded = getDecodedToken();
    if (!decoded) return null;

    const role =
        decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

    return role ? role.toLowerCase() : null;
}

export function getUserId() {
    const decoded = getDecodedToken();
    if (!decoded) return null;

    const userId =
        decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

    return userId ? Number(userId) : null;
}

export function isAuthenticated() {
    return !!localStorage.getItem("token");
}

export function saveAuthTokens(accessToken, refreshToken) {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
}

export function clearAuthTokens() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
}

export function getDefaultRouteByRole() {
    const role = getUserRole();

    if (role === "admin") return "/admin";
    if (role === "user") return "/user";

    return "/";
}