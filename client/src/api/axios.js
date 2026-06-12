import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !String(original.url).includes("/auth/")) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          api.post("/auth/refresh", { refreshToken: localStorage.getItem("refreshToken") });
        const { data } = await refreshing;
        refreshing = null;
        const newToken = data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          if (data.data.refreshToken) localStorage.setItem("refreshToken", data.data.refreshToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        refreshing = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (!window.location.pathname.includes("/login")) window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export default api;
