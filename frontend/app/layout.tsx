import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";

import Providers from "./components/Providers";

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
  icons: {
    icon: "/favicon.ico",
  },
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
      <body className={`${plusJakarta.className} bg-blue-50`}>
        <Providers>
          <Toaster position="bottom-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
