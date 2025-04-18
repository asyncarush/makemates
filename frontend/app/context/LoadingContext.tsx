"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import Loader from "@/components/Loader";

// Define the context type
interface LoadingContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

// Create the context with default values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoader: () => {},
  hideLoader: () => {},
});

// Hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

// Provider component
export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial page load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Functions to control the loader
  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {isLoading && <Loader />}
      <div
        className={
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-500"
        }
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
}
