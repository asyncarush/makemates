"use client";

import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { CreateNewUser, SignInUser, LogOutUser } from "@/axios.config";
import { AuthContextType, LoginInputType, SignUpInputType } from "@/typings";

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const userSignUp = async (inputs: SignUpInputType) => {
    toast.promise(CreateNewUser(inputs), {
      loading: "Creating New Account....",
      success: (res) => {
        // Set current user in state and local storage
        setCurrentUser(res.data);
        window.localStorage.setItem("currentUser", JSON.stringify(res.data));
        // Redirect to the feed page upon successful Registration
        router.refresh(); // Client-side refresh
        router.push("/feed");
        return `Successful`;
      },
      error: (res) => {
        // Display the error message from the response data
        return `${res.response.data}`;
      },
    });
  };

  const userLogin = async (inputs: LoginInputType) => {
    toast.promise(SignInUser(inputs), {
      loading: "Logging....",
      success: (res) => {
        // Set current user in state and local storage
        setCurrentUser(res);
        window.localStorage.setItem("currentUser", JSON.stringify(res));
        router.refresh(); // Client-side refresh
        router.push("/feed");
        return `Login Successful`;
      },
      error: (res) => {
        return `${res.response.data}`;
      },
    });
  };

  const userLogout = async () => {
    try {
      await LogOutUser();
      window.localStorage.removeItem("currentUser");
      window.localStorage.removeItem("auth_token");
      setCurrentUser(null);
      router.push("/");
    } catch (error) {
      console.log("logout Error:", error);
    }
  };

  // Check on page reload if user is saved in local storage
  useEffect(() => {
    try {
      const loggedUser = window.localStorage.getItem("currentUser");
      const token = window.localStorage.getItem("auth_token");

      if (loggedUser && token) {
        const user = JSON.parse(loggedUser);
        setCurrentUser(user);
      } else {
        // Clear any partial state
        window.localStorage.removeItem("currentUser");
        window.localStorage.removeItem("auth_token");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      // Clear any corrupted data
      window.localStorage.removeItem("currentUser");
      window.localStorage.removeItem("auth_token");
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // // Use this effect to track changes in currentUser
  // useEffect(() => {
  //   console.log(currentUser); // This will show the updated value
  // }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, userLogin, userSignUp, userLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
