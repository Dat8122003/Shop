import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: false,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    toast.error(e.response?.data?.error || e.message || "Connection error");
    return Promise.reject(e);
  }
);

export const formatVnd = (n) => `${Number(n || 0).toLocaleString("vi-VN")}d`;

export const cn = (...args) => args.filter(Boolean).join(" ");

export default api;
