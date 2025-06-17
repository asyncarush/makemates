"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "../../components/theme-provider";

import AuthContextProvider from "../context/AuthContext";
import ChatContextProvider from "../context/ChatContext";
import LoadingProvider from "../context/LoadingContext";

interface ProvidersProps {
  children: React.ReactNode;
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/feed",
  "/chat",
  "/profile",
  "/settings",
  "/video-chat",
];

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const loggedUser = window.localStorage.getItem("currentUser");
        const token = window.localStorage.getItem("auth_token");

        const authenticated = !!(loggedUser && token);
        setIsAuthenticated(authenticated);

        // If user is not authenticated and trying to access protected route
        if (!authenticated && isProtectedRoute(pathname)) {
          router.push("/");
          return;
        }

        // If user is authenticated and trying to access login page
        if (authenticated && isPublicRoute(pathname)) {
          router.push("/feed");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        if (isProtectedRoute(pathname)) {
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Helper function to check if current route is protected
  const isProtectedRoute = (path: string) => {
    return PROTECTED_ROUTES.some((route) => path.startsWith(route));
  };

  // Helper function to check if current route is public
  const isPublicRoute = (path: string) => {
    return PUBLIC_ROUTES.some((route) => path === route);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ChatContextProvider>
            <LoadingProvider>{children}</LoadingProvider>
          </ChatContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
