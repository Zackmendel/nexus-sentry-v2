import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X Layer Portfolio | Professional Portfolio Manager",
  description: "Track and manage your assets on OKX's X Layer with institutional-grade data and sleek UX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-black text-white h-screen overflow-hidden`}>
        <TooltipProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto relative bg-zinc-950/20">
                <div className="absolute top-4 left-4 z-50 lg:hidden">
                  <SidebarTrigger className="bg-white/5 border border-white/10 hover:bg-white/10" />
                </div>
                {children}
              </main>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
