"use client";

import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
});

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "800"],
  subsets: ["latin"],
});

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={`flex flex-col ${poppins.className} min-h-screen bg-gray-50`}
      >
        <div className="sticky top-0 z-50 w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Navbar />
          </div>
        </div>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default DashboardLayout;
