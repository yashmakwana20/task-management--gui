import api from "../api/axios";

export const getUsers = async () => {
    const response = await api.get("/CLUser/GetUserData");
    return response.data;
};