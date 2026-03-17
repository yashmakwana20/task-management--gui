import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService";
import Loader from "../components/Loader";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks();
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

    if (loading) {
        return <Loader />;
    }

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((x) => x.status === "Pending").length;
    const inProgressTasks = tasks.filter((x) => x.status === "In Progress").length;
    const completedTasks = tasks.filter((x) => x.status === "Completed").length;
    const highPriorityTasks = tasks.filter((x) => x.priority === "High").length;

    const recentTasks = [...tasks]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

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

    const StatCard = ({ title, value, onClick }) => (
        <button
            onClick={onClick}
            className="bg-white shadow-md rounded-xl p-5 text-left hover:shadow-lg transition w-full"
        >
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
        </button>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard
                    title="Total Tasks"
                    value={totalTasks}
                    onClick={() => navigate("/tasks")}
                />
                <StatCard
                    title="Pending"
                    value={pendingTasks}
                    onClick={() => navigate("/tasks?status=Pending")}
                />
                <StatCard
                    title="In Progress"
                    value={inProgressTasks}
                    onClick={() => navigate("/tasks?status=In%20Progress")}
                />
                <StatCard
                    title="Completed"
                    value={completedTasks}
                    onClick={() => navigate("/tasks?status=Completed")}
                />
                <StatCard
                    title="High Priority"
                    value={highPriorityTasks}
                    onClick={() => navigate("/tasks?priority=High")}
                />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recent Tasks
                </h3>

                {recentTasks.length === 0 ? (
                    <p className="text-gray-500">No tasks found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">ID</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Title</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Priority</th>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTasks.map((task) => (
                                    <tr key={task.id} className="border-t">
                                        <td className="px-4 py-3">{task.id}</td>
                                        <td className="px-4 py-3">{task.title}</td>
                                        <td className="px-4 py-3">{task.priority}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm ${getStatusClass(task.status)}`}
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