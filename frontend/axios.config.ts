import axios from "axios";
import { LoginInputType, SignUpInputType } from "./typings";

export const API_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "https://makemates-api.asyncarush.com";

console.log("Current API_ENDPOINT", API_ENDPOINT);

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

// Create axios instance AFTER defining the token functions
export const BACKEND_API = axios.create({
  baseURL: API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to set the Authorization header
BACKEND_API.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      // Make sure we're setting the header correctly
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log(
        "Token added to request headers:",
        `Bearer ${token.substring(0, 10)}...`
      );
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token updates or errors
BACKEND_API.interceptors.response.use(
  (response) => {
    // Check if the response contains a new token
    const newToken = response.data?.token;
    if (newToken) {
      setStoredToken(newToken);
      console.log("New token stored from response");
    }
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log("Authentication error detected");
      // Optionally clear the token
      setStoredToken(null);
    }
    return Promise.reject(error);
  }
);

// Create user
export async function CreateNewUser(inputData: SignUpInputType) {
  try {
    const response = await BACKEND_API.post("/user/register", inputData);

    // Token handling is now done in the response interceptor
    console.log("Register response:", response.data);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Sign in user
export async function SignInUser(inputData: LoginInputType) {
  try {
    console.log("Making login request to:", `${API_ENDPOINT}/user/login`);

    const response = await BACKEND_API.post("/user/login", inputData);

    // Token handling is now done in the response interceptor
    console.log("Login successful");
    console.log("Login response cookies:", document.cookie);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Get user data
export async function getUserDataById() {
  try {
    console.log(
      "Fetching user data with token:",
      getStoredToken() ? "Token exists" : "No token"
    );
    console.log("Cookies before /me request:", document.cookie);
    const { data } = await BACKEND_API.get("/user/me");
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Fetch posts by user
export async function fetchUserPosts(userId: number) {
  try {
    const { data } = await BACKEND_API.get(`/posts/${userId}`);
    return data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}

export const removeThisImage = async (postId: number, media: string[]) => {
  let mediaUrls = JSON.stringify(media);
  try {
    // remove the image from server
    await BACKEND_API.post(`/posts/editpost/remove`, {
      postId,
      mediaUrls,
    });
    return true;
  } catch (error: any) {
    console.error("Unable to remove image:", error);
    return false;
  }
};

// Logout user
export async function LogOutUser() {
  try {
    const { data } = await BACKEND_API.get("/user/logout");
    setStoredToken(null);
    console.log("User logged out successfully");
    return data;
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear the token even if the server request fails
    setStoredToken(null);
    throw error;
  }
}

// Get notifications
export async function fetchUserNotifications() {
  try {
    const { data } = await BACKEND_API.get("/user/notifications");
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

// Fetch All comments
export const fetchPostComments = async (postId: string) => {
  try {
    const response = await BACKEND_API.get(`/posts/comments/${postId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};
