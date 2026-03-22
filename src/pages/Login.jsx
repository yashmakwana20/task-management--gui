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

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Enter a valid email address.";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateForm()) return;

        try {
            setLoading(true);

            const data = await login(
                formData.email.trim(),
                formData.password.trim()
            );

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
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${errors.email
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={`w-full border rounded-lg px-4 py-3 pr-20 focus:outline-none focus:ring-2 ${errors.password
                                    ? "border-red-500 focus:ring-red-400"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
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