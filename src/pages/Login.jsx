import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import {
    getUserRole,
    saveAuthTokens,
    getDefaultRouteByRole,
} from "../utils/auth";
import AuthLayout from "../components/AuthLayout";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const email = formData.email.trim();
        const password = formData.password.trim();

        if (!email || !password) {
            toast.error("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const data = await login(email, password);

            if (!data.isError) {
                saveAuthTokens(data.accessToken, data.refreshToken);

                const role = getUserRole();
                toast.success("Login successful!");

                if (role) {
                    navigate(getDefaultRouteByRole());
                } else {
                    navigate("/");
                }
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to continue managing your tasks."
            footerText="Don't have an account?"
            footerLinkText="Register"
            footerLinkTo="/register"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </AuthLayout>
    );
}

export default Login;