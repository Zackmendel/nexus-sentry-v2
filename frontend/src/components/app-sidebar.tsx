"use client";
import { Home, PieChart, Repeat, Compass, ExternalLink, Code2, MessageCircle, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: PieChart,
  },
  {
    title: "Swap",
    url: "/swap",
    icon: Repeat,
  },
  {
    title: "Discovery",
    url: "/discovery",
    icon: Compass,
  },
];

import { API_BASE } from "@/lib/constants";

export function AppSidebar() {
  const pathname = usePathname();
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/`);
        setIsApiHealthy(res.ok);
      } catch (error) {
        setIsApiHealthy(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-black">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 px-2 overflow-hidden group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="relative">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-okx-cyan to-okx-purple flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(0,255,204,0.3)]">
              X
            </div>
            <div className="absolute -inset-1 blur-lg bg-okx-cyan/20 animate-pulse" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black tracking-tight text-white uppercase italic">Nexus Sentry</span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest -mt-1">X LAYER HUB</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "relative h-11 w-full flex items-center gap-3 px-4 rounded-xl transition-all duration-300",
                        isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      )}
                      render={
                        <Link href={item.url}>
                          {isActive && (
                            <motion.div
                              layoutId="active-pill"
                              className="absolute left-0 w-1 h-6 bg-okx-cyan rounded-full shadow-[0_0_10px_rgba(0,255,204,0.5)]"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <item.icon className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-transform duration-300",
                            isActive ? "text-okx-cyan" : "group-hover:scale-110"
                          )} />
                          <span className="text-xs font-bold tracking-tight group-data-[collapsible=icon]:hidden uppercase">
                            {item.title}
                          </span>
                          {isActive && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="ml-auto group-data-[collapsible=icon]:hidden"
                            >
                              <div className="h-1 w-1 rounded-full bg-okx-cyan glow-cyan" />
                            </motion.div>
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-white/5">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="relative">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isApiHealthy ? "bg-green-500" : "bg-red-500"
              )} />
              {isApiHealthy && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />}
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Mainnet</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase truncate">Nexus Node Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <Link href="#" className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                <Code2 className="h-4 w-4" />
              </Link>
            </div>
            <button className="p-2 text-zinc-500 hover:text-white transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
