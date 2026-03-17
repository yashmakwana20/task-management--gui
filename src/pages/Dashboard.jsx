import { useEffect, useState } from "react";
import { getTasks } from "../services/taskService";
import Loader from "../components/Loader";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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
        return <Loader text="Loading dashboard..." />;
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

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

            {loading ? (
                <div className="bg-white rounded-lg shadow p-6 text-gray-600">
                    Loading dashboard...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">Total Tasks</p>
                            <h3 className="text-2xl font-bold text-gray-800">{totalTasks}</h3>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">Pending</p>
                            <h3 className="text-2xl font-bold text-yellow-600">{pendingTasks}</h3>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">In Progress</p>
                            <h3 className="text-2xl font-bold text-blue-600">{inProgressTasks}</h3>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">Completed</p>
                            <h3 className="text-2xl font-bold text-green-600">{completedTasks}</h3>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-500">High Priority</p>
                            <h3 className="text-2xl font-bold text-red-600">{highPriorityTasks}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
                        </div>

                        {recentTasks.length === 0 ? (
                            <div className="p-6 text-gray-600">No tasks found.</div>
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Title</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Priority</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTasks.map((task) => (
                                        <tr key={task.id} className="border-t hover:bg-gray-50">
                                            <td className="px-6 py-4">{task.id}</td>
                                            <td className="px-6 py-4">{task.title}</td>
                                            <td className="px-6 py-4">{task.priority}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-sm rounded-full ${getStatusClass(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;