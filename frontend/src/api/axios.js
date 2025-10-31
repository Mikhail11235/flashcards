import axios from "axios";
import { tokenStorage } from "./authHelpers";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
}

api.interceptors.request.use(async (config) => {
    let token = tokenStorage.access;
    if (token && tokenStorage.isTokenExpired(token)) {
        token = await refreshAccessToken();
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise(resolve => {
                    subscribeTokenRefresh(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                onRefreshed(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                tokenStorage.clear();
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

async function refreshAccessToken() {
    const refresh = tokenStorage.refresh;
    if (!refresh) throw new Error("no refresh token");
    const res = await axios.post("http://127.0.0.1:8000/auth/refresh", { refresh });
    const newAccess = res.data.access;
    tokenStorage.set({ access: newAccess, refresh });
    return newAccess;
}

export default api;
