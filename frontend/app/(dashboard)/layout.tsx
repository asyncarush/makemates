import { Poppins } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AIAssistant from "@/components/AIAssistant";

import Navbar from "@/components/Navbar";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "800"],
  subsets: ["latin"],
});

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col ${poppins.className} min-h-screen`}>
      <div className="sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar />
        </div>
      </div>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
        <div className="absolute right-2 bottom-2">
          <AIAssistant />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
