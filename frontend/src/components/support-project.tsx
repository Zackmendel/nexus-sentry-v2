"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Coins, ShieldCheck, Loader2, Check, X } from "lucide-react";
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

const PROJECT_WALLET = "0xAFCc6a91705D2DCC7E5dEaE084b726437c35eF17";

export function SupportProject() {
  const { address, isConnected } = useWalletStore();
  const [expanded, setExpanded] = useState(false);
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
      const validBefore = validAfter + 3600 * 24; // 24 hours

      // X402 EIP-712 Data
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

      // In OKX Wallet and MetaMask, the data should be the object, not a JSON string for v4
      const signParams = {
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
      };

      console.log("[X402] Requesting signature for:", signParams);

      const signature = await okxwallet.request({
        method: "eth_signTypedData_v4",
        params: [address, JSON.stringify(signParams)] // Some wallets expect string, some object. OKX usually expects string for compatibility.
      });

      if (!signature) throw new Error("Signature denied");

      // Settlement
      const payload = {
        x402Version: 1,
        chainIndex: "196",
        paymentPayload: {
          x402Version: 1,
          scheme: "exact",
          payload: {
            signature: signature,
            authorization: {
              ...message,
              value: rawValue
            }
          }
        },
        paymentRequirements: {
          scheme: "exact",
          maxAmountRequired: rawValue,
          payTo: PROJECT_WALLET,
          asset: selectedAsset.address,
          description: "Nexus-Sentry Support Donation"
        }
      };

      const res = await axios.post(`${API_BASE}/donate/settle`, payload);
      
      if (res.data.code === "0" && res.data.data?.[0]?.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setExpanded(false);
          setAmount("");
        }, 3000);
      } else {
        throw new Error(res.data.msg || res.data.message || "Settlement failed");
      }

    } catch (e: any) {
      console.error("Donation failed", e);
      setError(e.response?.data?.detail || e.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all group"
      >
        <Heart className="h-4 w-4 text-okx-cyan group-hover:fill-okx-cyan/20 transition-all" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Support Project</span>
      </button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-4 p-4 rounded-xl bg-zinc-900/90 border border-white/10 backdrop-blur-3xl relative"
    >
      <button 
        onClick={() => setExpanded(false)}
        className="absolute top-3 right-3 p-1 text-zinc-600 hover:text-white transition-colors"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Support Nexus</span>
        <div className="flex gap-1">
          {ASSETS.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset)}
              className={cn(
                "flex-1 py-1.5 rounded-lg border text-[8px] font-black transition-all",
                selectedAsset.symbol === asset.symbol 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-transparent border-white/5 text-zinc-600"
              )}
            >
              {asset.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            autoFocus
            onChange={(e) => setAmount(e.target.value)}
            className="bg-black/40 border-white/5 rounded-lg h-10 pl-9 text-[10px] font-bold"
          />
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-okx-cyan" />
        </div>

        <Button
          onClick={handleDonate}
          disabled={loading || success || !amount}
          className={cn(
            "h-10 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all",
            success ? "bg-green-500 text-white" : "bg-okx-cyan text-black"
          )}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : success ? (
            <Check className="h-3 w-3" />
          ) : (
            "Authorize X402"
          )}
        </Button>
      </div>

      {error && (
        <span className="text-[8px] text-red-500 font-bold uppercase text-center">{error}</span>
      )}
    </motion.div>
  );
}
