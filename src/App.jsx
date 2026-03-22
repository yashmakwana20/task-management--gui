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
import PublicRoute from "./components/PublicRoute";

function App() {
    return (
        <BrowserRouter>
            <Toaster position="bottom-center" />
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route
                    element={
                        <RoleProtectedRoute>
                            <Layout />
                        </RoleProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route
                        path="/admin"
                        element={
                            <RoleProtectedRoute role="admin">
                                <AdminDashboard />
                            </RoleProtectedRoute>
                        }
                    />

                    <Route
                        path="/user"
                        element={
                            <RoleProtectedRoute role="user">
                                <UserDashboard />
                            </RoleProtectedRoute>
                        }
                    />

                    <Route path="/tasks" element={<Tasks />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;