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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
          <h1 className="text-3xl font-bold leading-tight">
            Task Management
            <br />
            System
          </h1>
          <p className="mt-4 text-sm text-blue-100 leading-6">
            Manage your daily work, organize priorities, and track progress in
            one clean dashboard.
          </p>

          <div className="mt-8 space-y-3 text-sm text-blue-100">
            <p>• Role-based authentication</p>
            <p>• Task tracking dashboard</p>
            <p>• Clean React + Tailwind UI</p>
          </div>
        </div>

        <div className="p-6 sm:p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-6 text-sm text-center text-gray-600">
              {footerText}{" "}
              <Link
                to={footerLinkTo}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;