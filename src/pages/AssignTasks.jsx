import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getTasks, assignTask } from "../services/taskService";
import { getUsers } from "../services/userService";
import Loader from "../components/Loader";

function AssignTasks() {
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

    const loadData = async () => {
        try {
            setLoading(true);

            const [taskResponse, userResponse] = await Promise.all([
                getTasks(0),
                getUsers(),
            ]);

            setTasks(Array.isArray(taskResponse.data.data) ? taskResponse.data.data : []);
            setUsers(Array.isArray(userResponse.data) ? userResponse.data : []);
        } catch (error) {
            console.error("Load assign tasks data error:", error);
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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
                !search ||
                title.includes(search) ||
                description.includes(search);

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
        selectableTaskIds.some((id) => selectedTaskIds.includes(id)) &&
        !isAllSelected;

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
            setSelectedTaskIds((prev) => [
                ...new Set([...prev, ...selectableTaskIds]),
            ]);
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

            const selectedTasks = tasks.filter((task) =>
                selectedTaskIds.includes(task.id)
            );


            const updatedTask = {
                taskIds: selectedTasks.map((task) => task.id),
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

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Assign Tasks
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Select multiple unassigned tasks and assign them to a user.
                        </p>
                    </div>

                    <button
                        onClick={openAssignModal}
                        disabled={selectedTaskIds.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-3 rounded-lg font-medium transition"
                    >
                        Assign Selected ({selectedTaskIds.length})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search title or description"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignment
                        </label>
                        <select
                            value={assignmentFilter}
                            onChange={(e) => setAssignmentFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Unassigned">Unassigned</option>
                            <option value="Assigned">Assigned</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b text-left text-sm text-gray-600">
                            <th className="py-3 pr-4 w-14">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isSomeSelected;
                                    }}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4"
                                />
                            </th>
                            <th className="py-3 pr-4">Title</th>
                            <th className="py-3 pr-4">Description</th>
                            <th className="py-3 pr-4">Status</th>
                            <th className="py-3 pr-4">Priority</th>
                            <th className="py-3 pr-4">Assigned To</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const assigned = isTaskAssigned(task);
                                const checked = selectedTaskIds.includes(task.id);

                                return (
                                    <tr key={task.id} className="border-b align-top">
                                        <td className="py-3 pr-4">
                                            {!assigned ? (
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleTaskSelection(task.id)}
                                                    className="h-4 w-4"
                                                />
                                            ) : null}
                                        </td>

                                        <td className="py-3 pr-4 font-medium text-gray-800">
                                            {task.title}
                                        </td>

                                        <td className="py-3 pr-4 text-gray-600">
                                            {task.description}
                                        </td>

                                        <td className="py-3 pr-4 text-gray-600">
                                            {task.status}
                                        </td>

                                        <td className="py-3 pr-4 text-gray-600">
                                            {task.priority}
                                        </td>

                                        <td className="py-3 pr-4 text-gray-600">
                                            {assigned
                                                ? userMap[task.userId] || `User ${task.userId}`
                                                : <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
                                                    Not Assigned
                                                </span>}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-6 text-center text-gray-500">
                                    No tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Assign Selected Tasks
                        </h2>

                        <p className="text-sm text-gray-500 mb-4">
                            You selected{" "}
                            <span className="font-semibold text-gray-700">
                                {selectedTaskIds.length}
                            </span>{" "}
                            task(s). Select a user to assign them.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.fullName || user.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeAssignModal}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleApplyAssignment}
                                disabled={assigning}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition"
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