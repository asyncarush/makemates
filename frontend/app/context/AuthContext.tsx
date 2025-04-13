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
    const response = await LogOutUser();
    window.localStorage.removeItem("currentUser");
    router.push("/");
  };

  // this will check on page reload if user is saved in LS
  // Check on page reload if user is saved in local storage
  useEffect(() => {
    const loggedUser = window.localStorage.getItem("currentUser");
    if (loggedUser) {
      const user = JSON.parse(loggedUser);
      setCurrentUser(user);
    }
  }, []);

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
