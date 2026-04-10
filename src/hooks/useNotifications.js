import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notificationService";
import {
    startSignalRConnection,
    getSignalRConnection,
} from "../services/signalrService";

export default function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const normalizeNotificationList = (apiResponse) => {
        if (Array.isArray(apiResponse)) return apiResponse;
        if (Array.isArray(apiResponse?.data)) return apiResponse.data;
        if (Array.isArray(apiResponse?.Data)) return apiResponse.Data;
        if (Array.isArray(apiResponse?.data?.data)) return apiResponse.data.data;
        return [];
    };

    const normalizeUnreadCount = (apiResponse) => {
        if (typeof apiResponse?.count === "number") return apiResponse.count;
        if (typeof apiResponse?.Count === "number") return apiResponse.Count;
        if (typeof apiResponse?.data?.count === "number") return apiResponse.data.count;
        if (typeof apiResponse?.data?.Count === "number") return apiResponse.data.Count;
        return 0;
    };

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);

            const [listResponse, countResponse] = await Promise.all([
                getNotifications(),
                getUnreadNotificationCount(),
            ]);

            setNotifications(normalizeNotificationList(listResponse));
            setUnreadCount(normalizeUnreadCount(countResponse));
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleMarkAsRead = useCallback(async (id) => {
        try {
            await markNotificationAsRead(id);

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === id || item.Id === id
                        ? { ...item, isRead: true, IsRead: true }
                        : item
                )
            );

            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            throw error;
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    isRead: true,
                    IsRead: true,
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            throw error;
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        let handler = null;

        const register = async () => {
            try {
                const connection = await startSignalRConnection();

                handler = async (payload) => {
                    const newItem =
                        payload?.dataModel ||
                        payload?.DataModel ||
                        payload?.data ||
                        payload;

                    if (!newItem) return;

                    setNotifications((prev) => [newItem, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                };

                connection.off("ReceiveNotification");
                connection.on("ReceiveNotification", handler);
            } catch (error) {
                console.error("Notification SignalR registration failed:", error);
            }
        };

        register();

        return () => {
            const connection = getSignalRConnection();
            if (connection && handler) {
                connection.off("ReceiveNotification", handler);
            }
        };
    }, []);

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            const aDate = new Date(a.createdAt || a.CreatedAt || 0).getTime();
            const bDate = new Date(b.createdAt || b.CreatedAt || 0).getTime();
            return bDate - aDate;
        });
    }, [notifications]);

    return {
        notifications: sortedNotifications,
        unreadCount,
        loading,
        loadNotifications,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
    };
}