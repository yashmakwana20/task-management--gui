import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost/TaskManagementAPI/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.request.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");

                const response = await axios.post("http://localhost/TaskManagementAPI/api/Auth/Refresh", { refreshToken });

                const newAccessToken = response.data.accessToken;

                localStorage.setItem("token", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

//api.interceptors.response.use(
//    (response) => response,
//    (error) => {
//        if (error.response && error.response.status === 401) {
//            localStorage.removeItem("token");
//            window.location.href = "/";
//        }

//        return Promise.reject(error);
//    }
//);

export default api;