import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://online-polling-api.onrender.com/api"
    : "http://localhost:3001/api");

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Har request ke sath token bhejo agar present hai
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Agar token expired ya invalid (401) ho toh auto-logout karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Purana expired token aur user data clear karo
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Navbar aur baki components ko notify karo
      window.dispatchEvent(new Event("userLoggedOut"));
    }
    return Promise.reject(error);
  }
);

export default api;
