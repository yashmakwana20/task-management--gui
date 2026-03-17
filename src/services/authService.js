import api from "../api/axios";

export const login = async (email, password) => {
    const response = await api.post("/Auth/login", {
        email,
        password
    });

    return response.data;
};

export const register = async (name, email, password) => {
    const response = await api.post("/Auth/register", {
        name,
        email,
        password
    });

    return response.data;
};