import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginUser(payload) {
  const response = await api.post("/api/login", payload);
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post("/api/register", payload);
  return response.data;
}

export async function fetchDashboard() {
  const response = await api.get("/api/dashboard");
  return response.data;
}

export async function createDashboardItem(payload) {
  const response = await api.post("/api/dashboard/items", payload);
  return response.data;
}

export async function updateDashboardItem(id, payload) {
  const response = await api.put(`/api/dashboard/items/${id}`, payload);
  return response.data;
}

export async function deleteDashboardItem(id) {
  const response = await api.delete(`/api/dashboard/items/${id}`);
  return response.data;
}
