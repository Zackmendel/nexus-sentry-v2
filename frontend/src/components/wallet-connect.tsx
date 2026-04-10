"use client";

import { useWalletStore } from "@/store/useWalletStore";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WalletConnect() {
  const { address, setAddress, disconnect } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/portfolio");
        }, 2000);
      }
    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-okx-cyan text-black font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,204,0.4)] z-50 whitespace-nowrap"
          >
            <ShieldCheck className="h-4 w-4" />
            Wallet Synchronized
          </motion.div>
        )}
      </AnimatePresence>

      {address ? (
        <div className="flex items-center gap-3">
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-xl group hover:border-okx-cyan/30 transition-all">
            <div className="h-2 w-2 rounded-full bg-okx-cyan shadow-[0_0_10px_rgba(0,255,204,0.5)]" />
            <span className="text-xs font-black font-mono text-zinc-400 group-hover:text-white transition-colors">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button 
            onClick={() => disconnect()}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={loading}
          className="relative overflow-hidden bg-white text-black hover:bg-zinc-200 font-black px-10 py-8 rounded-[2rem] text-xl transition-all duration-500 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.1)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-okx-cyan/20 to-okx-purple/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Wallet className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform relative z-10" />
          <span className="relative z-10 uppercase italic tracking-tighter">
            {loading ? "Authorizing..." : "Initialize Wallet"}
          </span>
        </Button>
      )}
    </div>
  );
}
