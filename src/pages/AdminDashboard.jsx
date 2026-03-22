import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService";
import Loader from "../components/Loader";

function AdminDashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks(0);
            setTasks(res?.data?.data || []);
        } catch (error) {
            console.error("Error loading admin dashboard data:", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const summary = useMemo(() => {
        return {
            total: tasks.length,
            pending: tasks.filter((task) => task.status === "Pending").length,
            inProgress: tasks.filter((task) => task.status === "In Progress").length,
            completed: tasks.filter((task) => task.status === "Completed").length,
            highPriority: tasks.filter((task) => task.priority === "High").length,
            lowPriority: tasks.filter((task) => task.priority === "Low").length,
        };
    }, [tasks]);

    const recentTasks = useMemo(() => {
        return [...tasks].sort((a, b) => b.id - a.id).slice(0, 5);
    }, [tasks]);

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "In Progress":
                return "bg-blue-100 text-blue-700";
            case "Completed":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case "Low":
                return "bg-gray-100 text-gray-700";
            case "Medium":
                return "bg-orange-100 text-orange-700";
            case "High":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        Admin Dashboard
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Overview of all tasks and quick admin actions
                    </p>
                </div>

                <button
                    onClick={() => navigate("/tasks")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow transition"
                >
                    Manage Tasks
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 items-stretch">
                <div
                    onClick={() => navigate("/tasks")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                >
                    <p className="text-gray-500 text-sm">Total Tasks</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">
                        {summary.total}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?status=Pending")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                >
                    <p className="text-gray-500 text-sm">Pending Tasks</p>
                    <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                        {summary.pending}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?status=In%20Progress")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                >
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <h3 className="text-3xl font-bold text-blue-600 mt-2">
                        {summary.inProgress}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?status=Completed")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                >
                    <p className="text-gray-500 text-sm">Completed Tasks</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-2">
                        {summary.completed}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?priority=High")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                >
                    <p className="text-gray-500 text-sm">High Priority</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-2">
                        {summary.highPriority}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?priority=Low")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                >
                    <p className="text-gray-500 text-sm">Low Priority</p>
                    <h3 className="text-3xl font-bold text-gray-700 mt-2">
                        {summary.lowPriority}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-xl shadow p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Recent Tasks
                        </h3>

                        <button
                            onClick={() => navigate("/tasks")}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all
                        </button>
                    </div>

                    {recentTasks.length === 0 ? (
                        <div className="text-gray-600 py-6">No tasks found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                            ID
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                            Title
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                            Priority
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-5">{task.id}</td>
                                            <td className="px-6 py-5">{task.title}</td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`px-3 py-1 text-sm rounded-full ${getPriorityClass(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`px-3 py-1 text-sm rounded-full ${getStatusClass(
                                                        task.status
                                                    )}`}
                                                >
                                                    {task.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                        Quick Actions
                    </h3>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate("/tasks")}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition shadow-sm hover:shadow-md"
                        >
                            Open Task Management
                        </button>

                        <button
                            onClick={() => navigate("/tasks?status=Pending")}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl transition shadow-sm hover:shadow-md"
                        >
                            Review Pending Tasks
                        </button>

                        <button
                            onClick={() => navigate("/tasks?priority=High")}
                            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition shadow-sm hover:shadow-md"
                        >
                            Check High Priority Tasks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;