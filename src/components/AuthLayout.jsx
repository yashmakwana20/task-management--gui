import { Link } from "react-router-dom";

function AuthLayout({
    title,
    subtitle,
    children,
    footerText,
    footerLinkText,
    footerLinkTo,
}) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
                    <h1 className="text-3xl font-bold mb-4">Task Management System</h1>
                    <p className="text-sm md:text-base text-blue-100 leading-7">
                        Manage tasks, track progress, and stay organized with a clean
                        dashboard experience for both Admin and User roles.
                    </p>

                    <div className="mt-10 space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <h3 className="font-semibold">Organize Better</h3>
                            <p className="text-sm text-blue-100 mt-1">
                                Create, update, filter, and monitor tasks easily.
                            </p>
                        </div>

                        <div className="bg-white/10 rounded-lg p-4">
                            <h3 className="font-semibold">Role-Based Access</h3>
                            <p className="text-sm text-blue-100 mt-1">
                                Separate dashboards for Admin and User workflows.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            {title}
                        </h2>
                        <p className="text-gray-500 mt-2">{subtitle}</p>
                    </div>

                    {children}

                    <p className="text-sm text-gray-600 mt-6 text-center md:text-left">
                        {footerText}{" "}
                        <Link
                            to={footerLinkTo}
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            {footerLinkText}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;