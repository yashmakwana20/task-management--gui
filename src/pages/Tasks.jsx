import { useEffect, useMemo, useState } from "react";
import {
    getTasks,
    deleteTasks,
    createTasks,
    updateTasks,
} from "../services/taskService";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function Tasks() {
    const getEmptyTask = () => ({
        id: 0,
        title: "",
        description: "",
        status: "Pending",
        priority: "Medium",
        userId: 1,
    });

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [taskForm, setTaskForm] = useState(getEmptyTask());

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks();
            setTasks(res.data.data || []);
        } catch (error) {
            console.error("Error loading tasks:", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const resetForm = () => {
        setTaskForm(getEmptyTask());
        setIsEditMode(false);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddClick = () => {
        setTaskForm(getEmptyTask());
        setIsEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (task) => {
        setTaskForm({
            id: task.id || 0,
            title: task.title || "",
            description: task.description || "",
            status: task.status || "Pending",
            priority: task.priority || "Medium",
            createdDate: task.createdDate || new Date().toISOString(),
            userId: task.userId || 1,
        });
        setIsEditMode(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!taskForm.title.trim()) {
            toast.error("Task title is required.");
            return;
        }

        if (!taskForm.description.trim()) {
            toast.error("Task description is required.");
            return;
        }

        try {
            setActionLoading(true);

            if (isEditMode) {
                await updateTasks(taskForm);
            } else {
                await createTasks(taskForm);
            }

            await loadTasks();
            resetForm();
        } catch (error) {
            console.error("Error saving task:", error);
            toast.error("Something went wrong while saving the task.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        try {
            setActionLoading(true);
            await deleteTasks(id);
            await loadTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Something went wrong while deleting the task.");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus =
                statusFilter === "All" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" || task.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchText, statusFilter, priorityFilter]);

    const summary = useMemo(() => {
        return {
            total: tasks.length,
            pending: tasks.filter((x) => x.status === "Pending").length,
            inProgress: tasks.filter((x) => x.status === "In Progress").length,
            completed: tasks.filter((x) => x.status === "Completed").length,
        };
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
        return <Loader text="Loading tasks..." />;
    }

    return (
        <div className="p-6 relative">
            {actionLoading && <Loader text="Processing..." />}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Task List</h2>

                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                >
                    + Add Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Total Tasks</p>
                    <h3 className="text-2xl font-bold text-gray-800">{summary.total}</h3>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <h3 className="text-2xl font-bold text-yellow-600">{summary.pending}</h3>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">In Progress</p>
                    <h3 className="text-2xl font-bold text-blue-600">{summary.inProgress}</h3>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold text-green-600">{summary.completed}</h3>
                </div>
            </div>

            {showForm && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        {isEditMode ? "Edit Task" : "Add New Task"}
                    </h3>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={taskForm.title}
                                onChange={handleInputChange}
                                placeholder="Enter task title"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                value={taskForm.status}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={taskForm.description}
                                onChange={handleInputChange}
                                placeholder="Enter task description"
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={taskForm.priority}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 flex gap-3 mt-2">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                {isEditMode ? "Update Task" : "Save Task"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by title or description"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Filter by Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-6 text-gray-600">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-6 text-gray-600">No tasks found.</div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Title</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Description</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Priority</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task.id} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-4">{task.id}</td>
                                    <td className="px-6 py-4">{task.title}</td>
                                    <td className="px-6 py-4">{task.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-sm rounded-full ${getPriorityClass(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusClass(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Tasks;