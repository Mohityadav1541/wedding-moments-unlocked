import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5005/api";
if (import.meta.env.DEV) console.log("[API] Base URL:", apiUrl);
const api = axios.create({
  baseURL: apiUrl,
  timeout: 3e5
  // 300s (5 min) limit for slow networks/large uploads
});
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);
const getLandingContent = async () => {
  const response = await api.get("/content");
  return response.data;
};
const getPhotographers = async () => {
  const response = await api.get("/users/photographers");
  return response.data;
};
const getRevenueStats = async () => {
  const response = await api.get("/events/revenue");
  return response.data;
};
const updateUserStatus = async (userId, isBlocked) => {
  const response = await api.put(`/users/${userId}/status`, { isBlocked });
  return response.data;
};
const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};
var stdin_default = api;
export {
  stdin_default as default,
  deleteUser,
  getLandingContent,
  getPhotographers,
  getRevenueStats,
  updateUserStatus
};
