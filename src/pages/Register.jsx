import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../services/authService";
import AuthLayout from "../components/AuthLayout";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Enter a valid email address.";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required.";
        } else if (formData.password.trim().length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm Password is required.";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
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

            const data = await register(
                formData.name.trim(),
                formData.email.trim(),
                formData.password.trim()
            );

            if (data?.isError) {
                toast.error(data.message || "Registration failed");
                return;
            }

            toast.success("Registration successful!");
            navigate("/");
        } catch (error) {
            console.error("Register error:", error);
            toast.error("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Register to start using your task management system."
            footerText="Already have an account?"
            footerLinkText="Login"
            footerLinkTo="/"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${errors.name
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={`w-full border rounded-lg px-4 py-3 pr-20 focus:outline-none focus:ring-2 ${errors.confirmPassword
                                    ? "border-red-500 focus:ring-red-400"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </AuthLayout>
    );
}

export default Register;