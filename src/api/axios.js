import axios from "axios";

const BASE_URL = "http://localhost/TaskManagementAPI/api";

const api = axios.create({
    baseURL: BASE_URL,
});

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Refresh token on 401 and retry original request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            return Promise.reject(error);
        }

        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/Auth/refresh")
        ) {
            originalRequest._retry = true;

            try {
                const accessToken = localStorage.getItem("token");
                const refreshToken = localStorage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("Refresh token not found");
                }

                const refreshResponse = await axios.post(
                    `${BASE_URL}/Auth/refresh`,
                    {
                        accessToken,
                        refreshToken,
                    }
                );

                const newAccessToken = refreshResponse.data.accessToken;
                const newRefreshToken =
                    refreshResponse.data.refreshToken || refreshToken;

                localStorage.setItem("token", newAccessToken);
                localStorage.setItem("refreshToken", newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                window.location.href = "/";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;