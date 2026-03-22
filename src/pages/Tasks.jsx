import { useEffect, useMemo, useState } from "react";
import {
    getTasks,
    deleteTasks,
    createTasks,
    updateTasks,
} from "../services/taskService";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { getUserRole, getUserId } from "../utils/auth";

function Tasks() {
    const userRole = getUserRole();
    const userId = getUserId();

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

    const [searchParams, setSearchParams] = useSearchParams();

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState(
        searchParams.get("status") || "All"
    );
    const [priorityFilter, setPriorityFilter] = useState(
        searchParams.get("priority") || "All"
    );

    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 5;

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks(userRole == "admin" ? 0 : userId);
            setTasks(res.data.data || []);
        } catch (error) {
            console.error("Error loading tasks:", error);
            setTasks([]);
            toast.error("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        setStatusFilter(searchParams.get("status") || "All");
        setPriorityFilter(searchParams.get("priority") || "All");
    }, [searchParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, statusFilter, priorityFilter]);

    useEffect(() => {
        const params = {};

        if (statusFilter !== "All") {
            params.status = statusFilter;
        }

        if (priorityFilter !== "All") {
            params.priority = priorityFilter;
        }

        setSearchParams(params);
    }, [statusFilter, priorityFilter, setSearchParams]);

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
                toast.success("Task updated successfully.");
            } else {
                await createTasks(taskForm);
                toast.success("Task created successfully.");
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
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) return;

        try {
            setActionLoading(true);
            await deleteTasks(id);
            toast.success("Task deleted successfully.");
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
                task.description
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase());

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

    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * tasksPerPage;
        const endIndex = startIndex + tasksPerPage;
        return filteredTasks.slice(startIndex, endIndex);
    }, [filteredTasks, currentPage]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    useEffect(() => {
        const total = Math.ceil(filteredTasks.length / tasksPerPage) || 1;

        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [filteredTasks, currentPage]);

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

    const handleSummaryClick = (type) => {
        if (type === "total") {
            setStatusFilter("All");
            return;
        }

        if (type === "pending") {
            setStatusFilter("Pending");
            return;
        }

        if (type === "inProgress") {
            setStatusFilter("In Progress");
            return;
        }

        if (type === "completed") {
            setStatusFilter("Completed");
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            {actionLoading && <Loader />}

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Task List</h2>

                {userRole === "admin" && (<button
                    onClick={handleAddClick}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl shadow"
                >
                    + Add Task
                </button>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div
                    onClick={() => handleSummaryClick("total")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">Total Tasks</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">
                        {summary.total}
                    </h3>
                </div>

                <div
                    onClick={() => handleSummaryClick("pending")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">Pending</p>
                    <h3 className="text-3xl font-bold text-yellow-600 mt-1">
                        {summary.pending}
                    </h3>
                </div>

                <div
                    onClick={() => handleSummaryClick("inProgress")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <h3 className="text-3xl font-bold text-blue-600 mt-1">
                        {summary.inProgress}
                    </h3>
                </div>

                <div
                    onClick={() => handleSummaryClick("completed")}
                    className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition"
                >
                    <p className="text-gray-500 text-sm">Completed</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-1">
                        {summary.completed}
                    </h3>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {isEditMode ? "Edit Task" : "Add New Task"}
                    </h3>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={taskForm.title}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter task title"
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

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={taskForm.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter task description"
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
                                disabled={actionLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg"
                            >
                                {isEditMode ? "Update Task" : "Save Task"}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={actionLoading}
                                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-6 mb-8">
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

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                {filteredTasks.length === 0 ? (
                    <div className="p-6 text-gray-600">No tasks found.</div>
                ) : (
                    <>
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                        ID
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                        Title
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                        Description
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                        Priority
                                    </th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                        Status
                                    </th>
                                    {userRole === "admin" && (<th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                        Action
                                    </th>)}
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-5">{task.id}</td>
                                        <td className="px-6 py-5">
                                            {task.title}
                                        </td>
                                        <td className="px-6 py-5">
                                            {task.description}
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
                                        {userRole === "admin" && (
                                            <td className="px-6 py-5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(task)
                                                        }
                                                        disabled={actionLoading}
                                                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(task.id)
                                                        }
                                                        disabled={actionLoading}
                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-6 py-4 border-t">
                                <p className="text-sm text-gray-600">
                                    Showing {(currentPage - 1) * tasksPerPage + 1}{" "}
                                    to{" "}
                                    {Math.min(
                                        currentPage * tasksPerPage,
                                        filteredTasks.length
                                    )}{" "}
                                    of {filteredTasks.length} tasks
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            goToPage(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 rounded-lg border bg-white text-sm disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => index + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-3 py-1.5 rounded-lg text-sm border ${currentPage === page
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-700"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            goToPage(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 rounded-lg border bg-white text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Tasks;