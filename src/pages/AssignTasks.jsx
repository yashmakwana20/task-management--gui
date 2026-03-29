import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getTasks, assignTask } from "../services/taskService";
import { getUsers } from "../services/userService";
import Loader from "../components/Loader";
import useTaskRealtime from "../hooks/useTaskRealtime";
import { getUserId } from "../utils/auth";

function AssignTasks() {
    const userId = getUserId(); 

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [assignmentFilter, setAssignmentFilter] = useState("Unassigned");

    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [assigning, setAssigning] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const [taskResponse, userResponse] = await Promise.all([
                getTasks(0),
                getUsers(),
            ]);

            setTasks(Array.isArray(taskResponse?.data?.data) ? taskResponse.data.data : []);
            setUsers(Array.isArray(userResponse?.data) ? userResponse.data : []);
        } catch (error) {
            console.error("Load assign tasks data error:", error);
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useTaskRealtime(async () => {
        await loadData();
    });

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isTaskAssigned = (task) => {
        return !!task.userId;
    };

    const userMap = useMemo(() => {
        const map = {};
        users.forEach((user) => {
            map[user.id] = user.name || user.fullName || user.email;
        });
        return map;
    }, [users]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const title = task.title?.toLowerCase() || "";
            const description = task.description?.toLowerCase() || "";
            const search = searchText.toLowerCase();

            const matchesSearch =
                !search || title.includes(search) || description.includes(search);

            const matchesStatus =
                statusFilter === "All" || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" || task.priority === priorityFilter;

            const assigned = isTaskAssigned(task);

            const matchesAssignment =
                assignmentFilter === "All" ||
                (assignmentFilter === "Assigned" && assigned) ||
                (assignmentFilter === "Unassigned" && !assigned);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesAssignment
            );
        });
    }, [tasks, searchText, statusFilter, priorityFilter, assignmentFilter]);

    const selectableTasks = useMemo(() => {
        return filteredTasks.filter((task) => !isTaskAssigned(task));
    }, [filteredTasks]);

    const selectableTaskIds = useMemo(() => {
        return selectableTasks.map((task) => task.id);
    }, [selectableTasks]);

    const isAllSelected =
        selectableTaskIds.length > 0 &&
        selectableTaskIds.every((id) => selectedTaskIds.includes(id));

    const isSomeSelected =
        selectableTaskIds.some((id) => selectedTaskIds.includes(id)) && !isAllSelected;

    const toggleTaskSelection = (taskId) => {
        setSelectedTaskIds((prev) =>
            prev.includes(taskId)
                ? prev.filter((id) => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedTaskIds((prev) =>
                prev.filter((id) => !selectableTaskIds.includes(id))
            );
        } else {
            setSelectedTaskIds((prev) => [...new Set([...prev, ...selectableTaskIds])]);
        }
    };

    const openAssignModal = () => {
        if (selectedTaskIds.length === 0) {
            toast.error("Please select at least one task.");
            return;
        }

        setSelectedUserId("");
        setShowAssignModal(true);
    };

    const closeAssignModal = () => {
        setShowAssignModal(false);
        setSelectedUserId("");
    };

    const handleApplyAssignment = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user.");
            return;
        }

        try {
            setAssigning(true);

            const updatedTask = {
                taskIds: selectedTaskIds,
                userId: Number(selectedUserId),
            };

            await assignTask(updatedTask);

            setTasks((prev) =>
                prev.map((task) =>
                    selectedTaskIds.includes(task.id)
                        ? { ...task, userId: Number(selectedUserId) }
                        : task
                )
            );

            toast.success("Selected tasks assigned successfully.");
            setSelectedTaskIds([]);
            closeAssignModal();
        } catch (error) {
            console.error("Bulk assign task error:", error);
            toast.error("Failed to assign selected tasks.");
        } finally {
            setAssigning(false);
        }
    };

    useEffect(() => {
        setSelectedTaskIds((prev) =>
            prev.filter((id) =>
                tasks.some((task) => task.id === id && !isTaskAssigned(task))
            )
        );
    }, [tasks]);

    const totalTasks = filteredTasks.length;
    const totalAssigned = filteredTasks.filter((task) => isTaskAssigned(task)).length;
    const totalUnassigned = filteredTasks.filter((task) => !isTaskAssigned(task)).length;

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "In Progress":
                return "bg-blue-100 text-blue-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-800";
            case "Medium":
                return "bg-orange-100 text-orange-800";
            case "Low":
                return "bg-emerald-100 text-emerald-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-200 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Assign Tasks</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Select multiple unassigned tasks and assign them to a user.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                        Selected: <span className="font-bold">{selectedTaskIds.length}</span>
                    </div>

                    <button
                        onClick={openAssignModal}
                        disabled={selectedTaskIds.length === 0}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        Assign Selected ({selectedTaskIds.length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Filtered Tasks</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-800">{totalTasks}</h3>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Assigned</p>
                    <h3 className="mt-2 text-2xl font-bold text-green-600">{totalAssigned}</h3>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Unassigned</p>
                    <h3 className="mt-2 text-2xl font-bold text-orange-600">{totalUnassigned}</h3>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Available Users</p>
                    <h3 className="mt-2 text-2xl font-bold text-purple-600">{users.length}</h3>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Filters</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search title or description"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Assignment
                        </label>
                        <select
                            value={assignmentFilter}
                            onChange={(e) => setAssignmentFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Unassigned">Unassigned</option>
                            <option value="Assigned">Assigned</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                                <th className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeSelected;
                                        }}
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4"
                                    />
                                </th>
                                <th className="px-4 py-4 font-semibold">Title</th>
                                <th className="px-4 py-4 font-semibold">Description</th>
                                <th className="px-4 py-4 font-semibold">Status</th>
                                <th className="px-4 py-4 font-semibold">Priority</th>
                                <th className="px-4 py-4 font-semibold">Assigned To</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const assigned = isTaskAssigned(task);
                                    const checked = selectedTaskIds.includes(task.id);

                                    return (
                                        <tr
                                            key={task.id}
                                            className={`transition hover:bg-gray-50 ${checked ? "bg-blue-50" : ""
                                                }`}
                                        >
                                            <td className="px-4 py-4 align-top">
                                                {!assigned ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleTaskSelection(task.id)}
                                                        className="mt-1 h-4 w-4"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 align-top font-medium text-gray-800">
                                                {task.title}
                                            </td>

                                            <td className="px-4 py-4 align-top text-gray-600">
                                                <div className="max-w-xs truncate">
                                                    {task.description || "-"}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                                                        task.status
                                                    )}`}
                                                >
                                                    {task.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadge(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                {assigned ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        {userMap[task.userId] || `User ${task.userId}`}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                        Not Assigned
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-14 text-center">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="mb-3 text-4xl">📋</div>
                                            <h3 className="text-lg font-semibold text-gray-700">
                                                No tasks found
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Try changing your search or filter values.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-800">
                            Assign Selected Tasks
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            You selected <span className="font-semibold">{selectedTaskIds.length}</span>{" "}
                            task(s). Select a user to assign them.
                        </p>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                User
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.fullName || user.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeAssignModal}
                                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleApplyAssignment}
                                disabled={assigning}
                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                                {assigning ? "Applying..." : "Apply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignTasks;