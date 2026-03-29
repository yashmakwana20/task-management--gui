import { useEffect, useMemo, useState } from "react";
import {
    getTasks,
    deleteTasks,
    createTasks,
    updateTasks,
} from "../services/taskService";
import { getUsers } from "../services/userService";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { getUserRole, getUserId } from "../utils/auth";
import StatCard from "../components/StatCard";
import { useCallback } from "react";
import useTaskRealtime from "../hooks/useTaskRealtime";

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
    const [users, setUsers] = useState([]);
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
    const [assignedUserFilter, setAssignedUserFilter] = useState(
        searchParams.get("assignedUser") || "All"
    );

    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 5;

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);

            const [taskRes, userRes] = await Promise.all([
                getTasks(userRole === "admin" ? 0 : userId),
                userRole === "admin" ? getUsers() : Promise.resolve(null),
            ]);

            setTasks(taskRes.data.data || []);

            if (userRole === "admin") {
                const userList = Array.isArray(userRes?.data) ? userRes.data : [];
                setUsers(userList);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
            setTasks([]);
            setUsers([]);
            toast.error("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    }, [userRole, userId]);

    useTaskRealtime(async (payload) => {
        console.log("USER TAB EVENT RECEIVED:", payload);
        await loadTasks();
        console.log("USER TAB RELOAD DONE");
    });

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        setStatusFilter(searchParams.get("status") || "All");
        setPriorityFilter(searchParams.get("priority") || "All");
        setAssignedUserFilter(searchParams.get("assignedUser") || "All");
    }, [searchParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, statusFilter, priorityFilter, assignedUserFilter]);

    useEffect(() => {
        const params = {};

        if (statusFilter !== "All") {
            params.status = statusFilter;
        }

        if (priorityFilter !== "All") {
            params.priority = priorityFilter;
        }

        if (userRole === "admin" && assignedUserFilter !== "All") {
            params.assignedUser = assignedUserFilter;
        }

        setSearchParams(params);
    }, [
        statusFilter,
        priorityFilter,
        assignedUserFilter,
        userRole,
        setSearchParams,
    ]);

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

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setTaskToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete?.id) return;

        try {
            setActionLoading(true);
            await deleteTasks(taskToDelete.id);
            toast.success("Task deleted successfully.");
            await loadTasks();
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Something went wrong while deleting the task.");
        } finally {
            setActionLoading(false);
        }
    };

    const userMap = useMemo(() => {
        const map = {};
        users.forEach((user) => {
            map[user.id] = user.name || user.fullName || user.email || `User ${user.id}`;
        });
        return map;
    }, [users]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus =
                statusFilter === "All" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" || task.priority === priorityFilter;

            let matchesAssignedUser = true;

            if (userRole === "admin") {
                if (assignedUserFilter === "Unassigned") {
                    matchesAssignedUser = !task.userId;
                } else if (assignedUserFilter === "All") {
                    matchesAssignedUser = true;
                } else {
                    matchesAssignedUser =
                        String(task.userId || "") === String(assignedUserFilter);
                }
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesAssignedUser
            );
        });
    }, [
        tasks,
        searchText,
        statusFilter,
        priorityFilter,
        assignedUserFilter,
        userRole,
    ]);

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

    const handleResetFilters = () => {
        setSearchText("");
        setStatusFilter("All");
        setPriorityFilter("All");

        if (userRole === "admin") {
            setAssignedUserFilter("All");
        }

        setCurrentPage(1);
        setSearchParams({});
    };

    const hasActiveFilters =
        searchText.trim() !== "" ||
        statusFilter !== "All" ||
        priorityFilter !== "All" ||
        (userRole === "admin" && assignedUserFilter !== "All");

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            {actionLoading && <Loader />}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Task List</h1>

                {userRole === "admin" && (
                    <button
                        onClick={handleAddClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow"
                    >
                        + Add Task
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Tasks"
                    value={summary.total}
                    valueClassName="text-gray-800"
                    onClick={() => handleSummaryClick("total")}
                    clickable
                />

                <StatCard
                    title="Pending"
                    value={summary.pending}
                    valueClassName="text-yellow-600"
                    onClick={() => handleSummaryClick("pending")}
                    clickable
                />

                <StatCard
                    title="In Progress"
                    value={summary.inProgress}
                    valueClassName="text-blue-600"
                    onClick={() => handleSummaryClick("inProgress")}
                    clickable
                />

                <StatCard
                    title="Completed"
                    value={summary.completed}
                    valueClassName="text-green-600"
                    onClick={() => handleSummaryClick("completed")}
                    clickable
                />
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                        <p className="text-sm text-gray-500">
                            Narrow down tasks using search and filter options.
                        </p>
                    </div>

                    <button
                        onClick={handleResetFilters}
                        disabled={!hasActiveFilters}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset Filters
                    </button>
                </div>

                <div
                    className={`grid grid-cols-1 gap-4 ${userRole === "admin"
                        ? "md:grid-cols-2 xl:grid-cols-4"
                        : "md:grid-cols-3"
                        }`}
                >
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

                    {userRole === "admin" && (
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Filter by Assigned User
                            </label>
                            <select
                                value={assignedUserFilter}
                                onChange={(e) => setAssignedUserFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Users</option>
                                <option value="Unassigned">Unassigned</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name ||
                                            user.fullName ||
                                            user.email ||
                                            `User ${user.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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
                                    {userRole === "admin" && (
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                            Assigned To
                                        </th>
                                    )}
                                    {userRole === "admin" && (
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedTasks.map((task) => (
                                    <tr key={task.id} className="border-t hover:bg-gray-50">
                                        <td className="px-6 py-5">{task.id}</td>
                                        <td className="px-6 py-5">{task.title}</td>
                                        <td className="px-6 py-5">{task.description}</td>
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
                                                {task.userId ? (
                                                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                                                        {userMap[task.userId] || `User ${task.userId}`}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                        )}

                                        {userRole === "admin" && (
                                            <td className="px-6 py-5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(task)}
                                                        disabled={actionLoading}
                                                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(task)}
                                                        disabled={actionLoading}
                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {deleteModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Delete Task
                                    </h2>

                                    <p className="mt-3 text-sm text-gray-600">
                                        Are you sure you want to delete this task?
                                    </p>

                                    <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3">
                                        <p className="text-sm text-gray-500">Task Title</p>
                                        <p className="font-semibold text-gray-800 mt-1">
                                            {taskToDelete?.title || "-"}
                                        </p>
                                    </div>

                                    <p className="mt-4 text-sm text-red-600">
                                        This action cannot be undone.
                                    </p>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={closeDeleteModal}
                                            disabled={actionLoading}
                                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleConfirmDelete}
                                            disabled={actionLoading}
                                            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                                        >
                                            {actionLoading ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-6 py-4 border-t">
                                <p className="text-sm text-gray-600">
                                    Showing {(currentPage - 1) * tasksPerPage + 1} to{" "}
                                    {Math.min(currentPage * tasksPerPage, filteredTasks.length)} of{" "}
                                    {filteredTasks.length} tasks
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
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
                                        onClick={() => goToPage(currentPage + 1)}
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