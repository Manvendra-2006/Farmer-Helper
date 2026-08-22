import axios from "axios";

// withCredentials: true is required because the backend sets an
// HTTP-only cookie for JWT — without this, the browser won't
// send/receive that cookie on cross-origin requests.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:1000/api",
  withCredentials: true,
});

export default api;