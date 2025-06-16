"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }

  return context;
};

// Helper hook for checking if user is authenticated
export const useIsAuthenticated = () => {
  const { currentUser } = useAuth();
  return !!currentUser;
};

// Helper hook for getting user data
export const useUser = () => {
  const { currentUser } = useAuth();
  return currentUser;
};
