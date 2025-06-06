/**
 * @fileoverview Root layout component that wraps the entire application.
 * Provides global styles, fonts, and context providers.
 */

// Next.js core
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Fonts
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";

// Styles
import "./globals.css";

// UI Components
import { Toaster } from "react-hot-toast";

// Dynamic imports
const AuthContextProvider = dynamic(() => import("./context/AuthContext.tsx"));
const ChatContextProvider = dynamic(() => import("./context/ChatContext.tsx"));
const LoadingProvider = dynamic(() => import("./context/LoadingContext.tsx"));

// Font configuration
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

/**
 * Metadata configuration for the application
 */
export const metadata: Metadata = {
  title: "Makemates",
  description: "Connect with friends and make new connections",
};

/**
 * Root layout component that provides the basic structure for all pages
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable}`}
    >
      <link
        rel="icon"
        href="/makemates_client/public/favicon.ico"
        type="image/png"
        sizes="any"
      />

      <body
        className={`${plusJakarta.className} bg-blue-50`}
        suppressHydrationWarning
      >
        <AuthContextProvider>
          <ChatContextProvider>
            <LoadingProvider>
              <Toaster position="bottom-center" />
              {children}
            </LoadingProvider>
          </ChatContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
