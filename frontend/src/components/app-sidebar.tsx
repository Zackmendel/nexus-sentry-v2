"use client";

import { Home, PieChart, Repeat, Compass, ExternalLink, Code2, MessageCircle } from "lucide-react";
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

export function AppSidebar() {
  const pathname = usePathname();
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("https://x-layer-api-349808161165.us-central1.run.app/");
        setIsApiHealthy(res.ok);
      } catch (error) {
        setIsApiHealthy(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-black/50 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2 overflow-hidden">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-neon-cyan flex items-center justify-center font-bold text-black neon-glow">
            X
          </div>
          <span className="text-xl font-bold tracking-tight text-glow group-data-[collapsible=icon]:hidden">X Layer</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest px-4 py-2 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                          pathname === item.url
                            ? "bg-white/10 text-white text-glow"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 shrink-0", pathname === item.url && "text-neon-cyan")} />
                        <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 w-fit">
            <div className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              isApiHealthy ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            )} />
            <span className="text-[10px] font-semibold text-zinc-400 group-data-[collapsible=icon]:hidden">X Layer Mainnet</span>
          </div>
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:hidden">
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
              <MessageCircle className="h-4 w-4" />
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
              <Code2 className="h-4 w-4" />
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
