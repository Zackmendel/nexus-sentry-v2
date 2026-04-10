"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatInterface } from "@/components/chat-interface";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-hidden relative bg-black">
            <div className="absolute top-6 left-6 z-50 lg:hidden">
              <SidebarTrigger className="h-12 w-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl" />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          <ChatInterface />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
