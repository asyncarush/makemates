import axios from "axios";
import { LoginInputType, SignUpInputType } from "./typings";

export const API_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:2000";

console.log("Current API_ENDPOINT", API_ENDPOINT);

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Get token from localStorage if available
const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Set token in localStorage
const setStoredToken = (token: string | null): void => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
};

// Initialize token from localStorage
let authToken: string | null = getStoredToken();

// Add request interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    // Get latest token from localStorage
    const currentToken = getStoredToken();
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function CreateNewUser(inputData: SignUpInputType) {
  const response = await axios.post(
    `${API_ENDPOINT}/user/register`,
    inputData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Store token if returned
  if (response.data && response.data.token) {
    authToken = response.data.token;
    setStoredToken(authToken);
  }

  console.log("login response:", response);
  return response;
}

export async function SignInUser(inputData: LoginInputType) {
  console.log("Making login request to:", `${API_ENDPOINT}/user/login`);

  const response = await axios.post(`${API_ENDPOINT}/user/login`, inputData);

  // Store token if returned
  if (response.data && response.data.token) {
    authToken = response.data.token;
    setStoredToken(authToken);
    console.log("Token stored:", authToken);
  }

  console.log("Login response cookies:", document.cookie);
  return response.data;
}

export async function getUserDataById() {
  try {
    console.log("Cookies before /me request:", document.cookie);
    const { data } = await axios.get(`${API_ENDPOINT}/user/me`);
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchUserPosts(userId: any) {
  const { data } = await axios.get(`${API_ENDPOINT}/posts/${userId}`);
  return data;
}

export async function LogOutUser() {
  const { data } = await axios.get(`${API_ENDPOINT}/user/logout`);

  // Clear stored token
  authToken = null;
  setStoredToken(null);

  return data;
}

export async function fetchUserNotifications() {
  try {
    const { data } = await axios.get(`${API_ENDPOINT}/user/notifications`);
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}
