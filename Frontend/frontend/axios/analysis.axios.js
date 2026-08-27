import axios from "axios";
import { getAuthToken } from "../src/context/authToken";

// withCredentials: true is required because the backend sets an
// HTTP-only cookie for JWT — without this, the browser won't
// send/receive that cookie on cross-origin requests.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://farmer-helper-2.onrender.com/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;