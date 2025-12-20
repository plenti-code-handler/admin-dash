import axios from "axios";
import { baseUrl } from "./utility/BaseURL";

const axiosClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced response interceptor with auto-logout
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("❌ Response error:", error.response?.status);
    const errorData = error.response?.data;
    const errorDetail = errorData?.detail;
    const errorDetailString = errorDetail ? String(errorDetail) : '';

    
    // List of authentication error messages that should trigger logout
    const authErrorMessages = [
      "Could not validate credentials",
      "Invalid credentials",
      "Token has expired",
      "Authentication failed",
      "Unauthorized",
      "Invalid token",
      "Token expired",
      "Access denied", 
      "Not authenticated"
    ];
    
    // Check if this is an authentication error
    const isAuthError = 
      error.response?.status === 401 || // Unauthorized
      error.response?.status === 403 || // Forbidden
      (errorDetailString && authErrorMessages.some(msg => 
        errorDetailString.toLowerCase().includes(msg.toLowerCase())
      ));
    
    if (isAuthError) {
      console.log("🔒 Authentication error detected, logging out");

      // Clear all auth data
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

      if (typeof window !== 'undefined') {
        // window.location.href = "/login";
      }
    }
    
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

// Add a request interceptor to pass the token with each request
axiosFormClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for form client
axiosFormClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorData = error.response?.data;
    const errorDetail = errorData?.detail;
    
    const authErrorMessages = [
      "Could not validate credentials",
      "Invalid credentials",
      "Token has expired",
      "Authentication failed",
      "Unauthorized",
      "Invalid token",
      "Token expired",
      "Access denied", 
      "Not authenticated"
    ];
    
    const isAuthError = 
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      (errorDetail && authErrorMessages.some(msg => 
        errorDetail.toLowerCase().includes(msg.toLowerCase())
      ));
    
    if (isAuthError) {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      if (typeof window !== 'undefined') {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
