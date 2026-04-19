import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useNotifications from "../hooks/useNotifications";
import { getRelativeTime } from "../utils/timeUtils";

function NotificationBell() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const handleNotificationClick = async (id, isRead) => {
        if (isRead) return;

        try {
            await markAsRead(id);
        } catch {
            toast.error("Failed to mark notification as read.");
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllAsRead();
            toast.success("All notifications marked as read.");
        } catch {
            toast.error("Failed to update notifications.");
        }
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative rounded-lg border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50"
                title="Notifications"
            >
                <span className="text-lg">🔔</span>

                {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-[20px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-800">
                            Notifications
                        </h3>

                        <button
                            type="button"
                            onClick={handleMarkAll}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Mark all read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-6 text-sm text-gray-500">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-500">
                                No notifications found.
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const id = item.id || item.Id;
                                const title = item.title || item.Title || "Notification";
                                const message = item.message || item.Message || "-";
                                const isRead = item.isRead ?? item.IsRead ?? false;
                                const createdAt = item.createdAt || item.CreatedAt;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() =>
                                            handleNotificationClick(id, isRead)
                                        }
                                        className={`w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${isRead ? "bg-white" : "bg-blue-50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {title}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {message}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {createdAt
                                                        ? new Date(createdAt).toLocaleString() + " - " + getRelativeTime(createdAt)
                                                        : ""}
                                                </p>
                                            </div>

                                            {!isRead && (
                                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;