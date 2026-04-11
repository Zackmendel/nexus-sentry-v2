"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Coins, ShieldCheck, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import axios from "axios";
import { API_BASE } from "@/lib/constants";

const ASSETS = [
  { 
    symbol: "USDG", 
    name: "Global Dollar", 
    address: "0x4ae46a509f6b1d9056937ba4500cb143933d2dc8", 
    decimals: 6,
    icon: "https://static.okx.com/cdn/web3/currency/token/large/196-0x4ae46a509f6b1d9056937ba4500cb143933d2dc8-110/type=default_90_0" 
  },
  { 
    symbol: "USDT", 
    name: "Tether USD", 
    address: "0x779ded0c9e1022225f8e0630b35a9b54be713736", 
    decimals: 6,
    icon: "https://static.okx.com/cdn/oksupport/asset/currency/icon/usdt.png" 
  }
];

// PROD DONATION WALLET - Using user-defined placeholder or project dev wallet
const PROJECT_WALLET = "0xAFCc6a91705D2DCC7E5dEaE084b726437c35eF17";

export function SupportProject() {
  const { address, isConnected } = useWalletStore();
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async () => {
    if (!isConnected || !address || !amount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const okxwallet = (window as any).okxwallet;
      if (!okxwallet) throw new Error("OKX Wallet not detected");

      const decimals = selectedAsset.decimals;
      const rawValue = (BigInt(Math.floor(Number(amount) * 10 ** decimals))).toString();
      const nonce = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
      const validAfter = Math.floor(Date.now() / 1000);
      const validBefore = validAfter + 3600; // 1 hour

      // X402 Structured Data for Signing (Standard EIP-712)
      const domain = {
        name: "X402",
        version: "1",
        chainId: 196
      };

      const types = {
        X402Transfer: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" }
        ]
      };

      const message = {
        from: address,
        to: PROJECT_WALLET,
        value: rawValue,
        validAfter: validAfter,
        validBefore: validBefore,
        nonce: nonce
      };

      const msgData = JSON.stringify({
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" }
            ],
            ...types
        },
        primaryType: "X402Transfer",
        domain: domain,
        message: message
      });

      const signature = await okxwallet.request({
        method: "eth_signTypedData_v4",
        params: [address, msgData]
      });

      // Prepare settlement request for Project Backend
      const payload = {
        x402Version: 1,
        chainIndex: "196",
        paymentPayload: {
          x402Version: "1",
          scheme: "exact",
          payload: {
            signature: signature,
            authorization: {
              ...message,
              value: rawValue.toString()
            }
          }
        },
        paymentRequirements: {
          scheme: "exact",
          maxAmountRequired: rawValue,
          payTo: PROJECT_WALLET,
          asset: selectedAsset.address,
          description: "Donation to Nexus-Sentry Project Support"
        }
      };

      const res = await axios.post(`${API_BASE}/donate/settle`, payload);
      
      if (res.data.code === "0" && res.data.data?.[0]?.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setAmount("");
        }, 5000);
      } else {
        throw new Error(res.data.msg || "Settlement failed");
      }

    } catch (e: any) {
      console.error("Donation failed", e);
      setError(e.message || "Payment process interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl overflow-hidden relative spotlight-card">
      <div className="absolute -top-10 -right-10 h-32 w-32 bg-okx-cyan/10 blur-3xl rounded-full" />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-xl bg-okx-cyan/10 flex items-center justify-center border border-okx-cyan/20">
          <Heart className="h-4 w-4 text-okx-cyan fill-okx-cyan/20" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">Support Project</span>
          <span className="text-sm font-black italic tracking-tighter text-white">Donate via X402</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {ASSETS.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-[10px] font-black transition-all",
                selectedAsset.symbol === asset.symbol 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-transparent border-white/5 text-zinc-600 hover:border-white/10"
              )}
            >
              <img src={asset.icon} className="h-3 w-3 rounded-full" alt={asset.symbol} />
              {asset.symbol}
            </button>
          ))}
        </div>

        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-black/40 border-white/5 rounded-2xl h-12 pl-10 text-xs font-bold focus-visible:ring-okx-cyan/50 focus-visible:border-okx-cyan/50"
          />
          <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        </div>

        <Button
          onClick={handleDonate}
          disabled={loading || success || !amount}
          className={cn(
            "h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500",
            success 
              ? "bg-green-500 text-white" 
              : "bg-okx-cyan text-black hover:bg-okx-cyan/90 shadow-[0_0_20px_rgba(0,255,204,0.2)]"
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : success ? (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Support Recorded
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Authorize Donation
            </div>
          )}
        </Button>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[8px] text-red-500 font-bold uppercase tracking-widest text-center mt-1"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 text-center">
        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
          X402 Protocol Secured Settlement
        </span>
      </div>
    </div>
  );
}
