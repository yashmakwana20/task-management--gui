import api from "../api/axios";

export const getTasks = (id) => {
    return api.get("/CLTaskItem/GetTaskData?userId=" + id);
};

export const createTasks = (task) => {
    return api.post("/CLTaskItem", task);
};

export const updateTasks = (task) => {
    return api.put(`/CLTaskItem`, task);
};

export const deleteTasks = (id) => {
    return api.delete(`/CLTaskItem?Id=${id}`);
};