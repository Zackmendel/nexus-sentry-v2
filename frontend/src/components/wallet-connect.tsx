"use client";

import { useWalletStore } from "@/store/useWalletStore";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WalletConnect() {
  const { address, setAddress, disconnect } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const connectWallet = async () => {
    if (typeof window === "undefined") return;

    const okxwallet = (window as any).okxwallet;
    
    if (!okxwallet) {
      window.open("https://www.okx.com/web3", "_blank");
      return;
    }

    try {
      setLoading(true);
      const accounts = await okxwallet.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        router.push("/portfolio");
      }
    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => disconnect()}
          className="rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={loading}
      className="bg-white text-black hover:bg-zinc-200 font-bold px-8 py-6 rounded-2xl text-lg transition-all duration-300 hover:scale-105 neon-glow group"
    >
      <Wallet className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
      {loading ? "Connecting..." : "Connect OKX Wallet"}
    </Button>
  );
}
