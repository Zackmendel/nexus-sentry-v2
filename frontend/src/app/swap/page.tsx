"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Settings2, 
  ArrowDown, 
  Search, 
  Info,
  ChevronDown,
  Loader2,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://x-layer-api-349808161165.us-central1.run.app";

const COMMON_TOKENS = [
  { symbol: "OKB", name: "OKB", address: "0xec729b1399718442d87e0743b4af040b208eb675", icon: "https://static.okx.com/cdn/oksupport/asset/currency/icon/okb.png" },
  { symbol: "ETH", name: "Ether", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", icon: "https://static.okx.com/cdn/oksupport/asset/currency/icon/eth.png" },
  { symbol: "USDT", name: "Tether USD", address: "0x1e4a5963a4d9a2d140342c237c16f8efc06b7ad0", icon: "https://static.okx.com/cdn/oksupport/asset/currency/icon/usdt.png" },
  { symbol: "USDC", name: "USD Coin", address: "0x74b7f11373d40fd8429ec97010f3c0502a5c1e36", icon: "https://static.okx.com/cdn/oksupport/asset/currency/icon/usdc.png" },
];

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(COMMON_TOKENS[1]); // ETH
  const [toToken, setToToken] = useState(COMMON_TOKENS[2]); // USDT
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);

  const getQuote = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setLoading(true);
    try {
      // Amount usually needs to be in wei. For demo, we might need to adjust based on decimals.
      // Assuming 18 decimals for most tokens here for the mock-up logic or handled by API
      const rawAmount = (Number(amount) * 1e18).toString();
      
      const res = await fetch(
        `${API_BASE}/trade/quote?from_token=${fromToken.address}&to_token=${toToken.address}&amount=${rawAmount}&slippage=${slippage}`
      );
      const data = await res.json();
      setQuote(data.data?.[0]);
    } catch (error) {
      console.error("Failed to fetch quote", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount) getQuote();
    }, 500);
    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px]"
      >
        <Card className="bg-zinc-950/80 border-white/10 backdrop-blur-2xl p-4 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-neon-cyan/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/10 rounded-full blur-[100px]" />

          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold tracking-tight">Swap</h2>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="h-5 w-5" />
              </Button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 p-4 rounded-xl z-50 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Slippage Tolerance</span>
                        <Info className="h-3 w-3 text-zinc-500" />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {["0.1", "0.5", "1.0", "Auto"].map((val) => (
                          <Button 
                            key={val}
                            variant={slippage === val ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSlippage(val)}
                            className="text-[10px] font-bold h-8 border-white/10"
                          >
                            {val}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* From Field */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">You Pay</span>
                <span className="text-xs font-mono text-zinc-500">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-4">
                <Input 
                  type="text" 
                  placeholder="0.0" 
                  className="bg-transparent border-none text-2xl font-bold p-0 focus-visible:ring-0 placeholder:text-zinc-700"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button variant="outline" className="bg-white/10 border-white/10 rounded-xl px-3 py-2 h-auto gap-2 hover:bg-white/20">
                  <img src={fromToken.icon} className="h-5 w-5 rounded-full" />
                  <span className="font-bold">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </Button>
              </div>
            </div>

            {/* Switch Icon */}
            <div className="flex justify-center -my-3 z-10">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-white/10 bg-zinc-950 hover:bg-white/5 text-zinc-400 hover:text-white h-10 w-10 shadow-xl"
                onClick={() => {
                  setFromToken(toToken);
                  setToToken(fromToken);
                }}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>

            {/* To Field */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">You Receive</span>
                <span className="text-xs font-mono text-zinc-500">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-4">
                <Input 
                  type="text" 
                  placeholder="0.0" 
                  readOnly
                  className="bg-transparent border-none text-2xl font-bold p-0 focus-visible:ring-0 placeholder:text-zinc-700 cursor-default"
                  value={loading ? "..." : (quote ? (Number(quote.toTokenAmount) / 1e18).toFixed(6) : "0.0")}
                />
                <Button variant="outline" className="bg-white/10 border-white/10 rounded-xl px-3 py-2 h-auto gap-2 hover:bg-white/20">
                  <img src={toToken.icon} className="h-5 w-5 rounded-full" />
                  <span className="font-bold">{toToken.symbol}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </Button>
              </div>
            </div>
          </div>

          {quote && (
            <div className="mt-6 px-2 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Rate</span>
                <div className="flex items-center gap-1 font-mono">
                  1 {fromToken.symbol} = { (Number(quote.toTokenAmount) / Number(quote.fromTokenAmount)).toFixed(4) } {toToken.symbol}
                  <RefreshCcw className="h-3 w-3 inline cursor-pointer hover:rotate-180 transition-transform duration-500" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Minimum Received</span>
                <span className="font-mono">{((Number(quote.toTokenAmount) / 1e18) * 0.995).toFixed(6)} {toToken.symbol}</span>
              </div>
            </div>
          )}

          <Button 
            disabled={!amount || loading}
            className="w-full mt-6 py-6 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black text-lg transition-all active:scale-[0.98] neon-glow shadow-white/10"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              !amount ? "Enter an amount" : "Swap"
            )}
          </Button>
        </Card>

        <div className="mt-4 text-center">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Powered by OKX DEX Aggregator</span>
        </div>
      </motion.div>
    </div>
  );
}
