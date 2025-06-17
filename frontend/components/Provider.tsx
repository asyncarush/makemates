"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import AuthContextProvider from "@/app/context/AuthContext";
import ChatContextProvider from "@/app/context/ChatContext";
import LoadingProvider from "@/app/context/LoadingContext";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthContextProvider>
        <ChatContextProvider>
          <LoadingProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster position="bottom-center" /> {children}
            </QueryClientProvider>
          </LoadingProvider>
        </ChatContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}
