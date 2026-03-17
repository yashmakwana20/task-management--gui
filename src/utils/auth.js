import { jwtDecode } from "jwt-decode";

export function getUserRole() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);

        const role =
            decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        console.log("Decoded role:", role);
        console.log("User role:", role ? role.toLowerCase() : null);

        return role ? role.toLowerCase() : null;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}