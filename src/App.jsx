import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Tasks from "./pages/Tasks";
import Layout from "./components/Layout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Toaster position="bottom-center" reverseOrder={false} />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    element={
                        <RoleProtectedRoute>
                            <Layout />
                        </RoleProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/user" element={<UserDashboard />} />
                </Route>

                <Route
                    path="/admin"
                    element={
                        <RoleProtectedRoute role="admin">
                            <Layout />
                        </RoleProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;