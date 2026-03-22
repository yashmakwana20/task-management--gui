import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService";
import { getUserRole, getUserId } from "../utils/auth";
import Loader from "../components/Loader";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userId = getUserId();
    const userRole = getUserRole();

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks(userRole == "admin" ? 0 : userId);
            setTasks(res.data.data || []);
        } catch (error) {
            console.error("Error loading dashboard tasks:", error);
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
            pending: tasks.filter((x) => x.status === "Pending").length,
            inProgress: tasks.filter((x) => x.status === "In Progress").length,
            completed: tasks.filter((x) => x.status === "Completed").length,
            highPriority: tasks.filter((x) => x.priority === "High").length,
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
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                <div
                    onClick={() => navigate("/tasks")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">Total Tasks</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">
                        {summary.total}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?status=Pending")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">Pending</p>
                    <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                        {summary.pending}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?status=In%20Progress")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <h3 className="text-3xl font-bold text-blue-600 mt-2">
                        {summary.inProgress}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?status=Completed")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">Completed</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-2">
                        {summary.completed}
                    </h3>
                </div>

                <div
                    onClick={() => navigate("/tasks?priority=High")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">High Priority</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-2">
                        {summary.highPriority}
                    </h3>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">
                        Recent Tasks
                    </h3>

                    <button
                        onClick={() => navigate("/tasks")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        View All Tasks
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
                                        <td className="px-6 py-5">
                                            {task.title}
                                        </td>
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
        </div>
    );
}

export default Dashboard;