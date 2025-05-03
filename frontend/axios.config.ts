import axios from "axios";
import { LoginInputType, SignUpInputType } from "./typings";

export const API_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "https://makemates-api.asyncarush.com";

console.log("Current API_ENDPOINT", API_ENDPOINT);

export const BACKEND_API = axios.create({
  baseURL: API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Add request interceptor to BACKEND_API
BACKEND_API.interceptors.request.use(
  (config) => {
    const currentToken = getStoredToken();
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create user
export async function CreateNewUser(inputData: SignUpInputType) {
  const response = await BACKEND_API.post("/user/register", inputData);

  if (response.data?.token) {
    setStoredToken(response.data.token);
  }

  console.log("Register response:", response);
  return response;
}

// Sign in user
export async function SignInUser(inputData: LoginInputType) {
  console.log("Making login request to:", "/user/login");

  const response = await BACKEND_API.post("/user/login", inputData);

  if (response.data?.token) {
    setStoredToken(response.data.token);
    console.log("Token stored:", response.data.token);
  }

  console.log("Login response cookies:", document.cookie);
  return response.data;
}

// Get user data
export async function getUserDataById() {
  try {
    console.log("Cookies before /me request:", document.cookie);
    const { data } = await BACKEND_API.get("/user/me");
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Fetch posts by user
export async function fetchUserPosts(userId: string) {
  const { data } = await BACKEND_API.get(`/posts/${userId}`);
  return data;
}

export const removeThisImage = async (postId: number, media: string[]) => {
  let mediaUrls = JSON.stringify(media);
  try {
    // remove the image from server
    await axios.post(`${API_ENDPOINT}/posts/editpost/remove`, {
      postId,
      mediaUrls,
    });
  } catch (e: any) {
    console.error("Unable to remove massage");
  }
};

// Logout user
export async function LogOutUser() {
  const { data } = await BACKEND_API.get("/user/logout");
  setStoredToken(null);
  return data;
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

// Fetch ALl comments
export const fetchPostComments = async (postId: string) => {
  try {
    const response = await axios.get(
      `${API_ENDPOINT}/posts/comments/${postId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(error.response.data);
  }
};
