import api from "../api/axios";

export const getNotifications = async () => {
    const response = await api.get("/CLNotification");
    return response.data;
};

export const getUnreadNotificationCount = async () => {
    const response = await api.get("/CLNotification/unread-count");
    return response.data;
};

export const markNotificationAsRead = async (id) => {
    const response = await api.put(`/CLNotification/${id}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.put("/CLNotification/read-all");
    return response.data;
};