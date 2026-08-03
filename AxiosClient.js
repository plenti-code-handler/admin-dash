import axios from "axios";
import { baseUrl } from "./utility/BaseURL";

const axiosClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_ERROR_MESSAGES = [
  "Could not validate credentials",
  "Invalid credentials",
  "Token has expired",
  "Authentication failed",
  "Unauthorized",
  "Invalid token",
  "Token expired",
  "Not authenticated",
];

function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
}

function isAuthenticationError(error) {
  const status = error.response?.status;
  const errorDetail = error.response?.data?.detail;
  const errorDetailString = errorDetail ? String(errorDetail) : "";

  // Only hard-logout on 401 (or explicit auth detail). Do not treat 403 as session expiry.
  return (
    status === 401 ||
    (errorDetailString &&
      AUTH_ERROR_MESSAGES.some((msg) =>
        errorDetailString.toLowerCase().includes(msg.toLowerCase())
      ))
  );
}

function handleAuthError(error) {
  if (!isAuthenticationError(error)) {
    return;
  }

  // Don't wipe session for failed login attempts
  const requestUrl = String(error.config?.url || "");
  if (requestUrl.includes("/login")) {
    return;
  }

  console.log("🔒 Authentication error detected, logging out");
  clearAuthStorage();

  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

// Request interceptor to add auth token
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("❌ Response error:", error.response?.status);
    handleAuthError(error);
    return Promise.reject(error);
  }
);

// Form data client for file uploads
export const axiosFormClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

axiosFormClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosFormClient.interceptors.response.use(
  (response) => response,
  (error) => {
    handleAuthError(error);
    return Promise.reject(error);
  }
);

export default axiosClient;
