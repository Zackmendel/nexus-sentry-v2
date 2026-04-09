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
  RefreshCcw,
  Zap,
  Layers,
  Fuel,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";

const API_BASE = "https://x-layer-api-349808161165.us-central1.run.app";
const CDN_TOKENS = "https://storage.googleapis.com/x-layer-metadata-349808161165/tokens_196.json";

interface Token {
  s: string; // symbol
  n: string; // name
  a: string; // address
  d: string; // decimals
  l?: string; // logo
}

const COMMON_TOKENS: Token[] = [
  { s: "OKB", n: "OKB", a: "0xec729b1399718442d87e0743b4af040b208eb675", d: "18", l: "https://static.okx.com/cdn/oksupport/asset/currency/icon/okb.png" },
  { s: "ETH", n: "Ether", a: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", d: "18", l: "https://static.okx.com/cdn/oksupport/asset/currency/icon/eth.png" },
  { s: "USDT", n: "Tether USD", a: "0x1e4a5963a4d9a2d140342c237c16f8efc06b7ad0", d: "6", l: "https://static.okx.com/cdn/oksupport/asset/currency/icon/usdt.png" },
  { s: "USDC", n: "USD Coin", a: "0x74b7f11373d40fd8429ec97010f3c0502a5c1e36", d: "6", l: "https://static.okx.com/cdn/oksupport/asset/currency/icon/usdc.png" },
];

export default function SwapPage() {
  const [tokens, setTokens] = useState<Token[]>(COMMON_TOKENS);
  const [fromToken, setFromToken] = useState<Token>(COMMON_TOKENS[1]); // ETH
  const [toToken, setToToken] = useState<Token>(COMMON_TOKENS[2]); // USDT
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null);
  const [showRouting, setShowRouting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchTokens() {
      try {
        const res = await fetch(CDN_TOKENS);
        if (!res.ok) throw new Error("GCS fetch failed");
        const data = await res.json();
        
        if (Array.isArray(data) && data.length >= 2) {
          setTokens(data);
          // Auto-select valid tokens from the REAL supported list
          setFromToken(data[0]);
          setToToken(data[1]);
        }
      } catch (error) {
        console.error("Using fallback tokens:", error);
      }
    }
    fetchTokens();
  }, []);

  const getQuote = async () => {
    if (!amount || isNaN(Number(amount))) {
      setQuote(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const [whole, fraction = ""] = amount.split(".");
      const decimals = Number(fromToken.d);
      const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
      const rawAmount = (BigInt(whole || "0") * BigInt(10) ** BigInt(decimals) + BigInt(paddedFraction)).toString();
      
      const res = await fetch(
        `${API_BASE}/trade/quote?from_token=${fromToken.a}&to_token=${toToken.a}&amount=${rawAmount}&slippage=${slippage}`
      );
      const data = await res.json();
      
      if (data.code !== "0") {
        setError(data.msg || "Price fetch failed. Try a larger amount.");
        setQuote(null);
      } else {
        setQuote(data.data?.[0] || null);
      }
    } catch (e) {
      console.error("Failed to fetch quote", e);
      setError("Network error. Is the backend running?");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    setSimulating(true);
    // Simulate transaction
    await new Promise(r => setTimeout(r, 2000));
    setSimulating(false);
    alert("Simulation complete: Success (X Layer Mainnet)");
  };

  useEffect(() => {
    // Clear quote if inputs change
    setQuote(null);
  }, [amount, fromToken, toToken]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px]"
      >
        <Card className="bg-zinc-950/80 border-white/10 backdrop-blur-2xl p-4 shadow-2xl relative overflow-hidden grain">
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

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold tracking-wider flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {error.toUpperCase()}
              </motion.div>
            )}
          </AnimatePresence>

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
                <Button 
                  variant="outline" 
                  onClick={() => setShowTokenSelector('from')}
                  className="bg-white/10 border-white/10 rounded-xl px-3 py-2 h-auto gap-2 hover:bg-white/20"
                >
                  <img src={fromToken.l || `https://via.placeholder.com/20?text=${fromToken.s}`} className="h-5 w-5 rounded-full" />
                  <span className="font-bold">{fromToken.s}</span>
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
                  value={loading ? "..." : (quote ? (Number(quote.toTokenAmount) / Math.pow(10, Number(toToken.d))).toFixed(6) : "0.0")}
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowTokenSelector('to')}
                  className="bg-white/10 border-white/10 rounded-xl px-3 py-2 h-auto gap-2 hover:bg-white/20"
                >
                  <img src={toToken.l || `https://via.placeholder.com/20?text=${toToken.s}`} className="h-5 w-5 rounded-full" />
                  <span className="font-bold">{toToken.s}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </Button>
              </div>
            </div>
          </div>

          {quote && (
            <div className="mt-6 px-2 flex flex-col gap-3">
              <div className="flex justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Rate</span>
                <div className="flex items-center gap-1 font-mono text-zinc-300">
                  1 {fromToken.s} = { (Number(quote.toTokenAmount) / Number(quote.fromTokenAmount) * (Math.pow(10, Number(fromToken.d)) / Math.pow(10, Number(toToken.d)))).toFixed(4) } {toToken.s}
                  <RefreshCcw className="h-3 w-3 inline cursor-pointer hover:rotate-180 transition-transform duration-500" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><TrendingDown className="h-3 w-3" /> Price Impact</span>
                <span className={cn(
                  "font-mono font-bold",
                  Math.abs(Number(quote.priceImpactPercent || 0)) > 2 ? "text-red-500" : "text-green-500"
                )}>
                  {Number(quote.priceImpactPercent || 0).toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><Fuel className="h-3 w-3" /> Est. Gas Units</span>
                <span className="font-mono text-zinc-300">{quote.estimateGasFee || "0"}</span>
              </div>

              {/* Routing Visualizer */}
              <div className="mt-2">
                 <Button 
                   variant="ghost" 
                   onClick={() => setShowRouting(!showRouting)}
                   className="w-full h-8 text-[10px] uppercase font-bold tracking-[0.2em] bg-white/5 hover:bg-white/10 flex justify-between px-4"
                 >
                   <span className="flex items-center gap-2"><Layers className="h-3 w-3" /> Trade Route</span>
                   <ChevronDown className={cn("h-3 w-3 transition-transform", showRouting && "rotate-180")} />
                 </Button>
                 <AnimatePresence>
                   {showRouting && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                     >
                       <div className="py-4 flex items-center justify-between gap-2 px-2">
                          <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold border border-white/10">{fromToken.s}</div>
                          <div className="flex-1 h-[2px] bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-cyan relative">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
                                {quote.dexRouterList?.map((r: any, idx: number) => (
                                  <div key={idx} className="bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-[8px] font-bold whitespace-nowrap text-neon-cyan shadow-xl">
                                    {r.dexProtocol?.dexName || "Route"}
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold border border-white/10">{toToken.s}</div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>
          )}

          <Button 
            disabled={!amount || loading || simulating}
            onClick={quote ? handleSwap : getQuote}
            className={cn(
               "w-full mt-6 py-6 rounded-2xl font-black text-lg transition-all active:scale-[0.98] neon-glow group",
               quote ? "bg-neon-cyan text-black hover:bg-neon-cyan/90" : "bg-white text-black hover:bg-zinc-200"
            )}
          >
            {loading || simulating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              !amount ? "Enter an amount" : (
                quote ? (
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5 fill-current" />
                    Confirm Swap
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Get Best Quote
                  </span>
                )
              )
            )}
          </Button>
        </Card>

        <div className="mt-4 text-center">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Powered by OKX DEX Aggregator</span>
        </div>
      </motion.div>

      {/* Searchable Token Selector Overlay */}
      <AnimatePresence>
        {showTokenSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowTokenSelector(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Select a Token</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowTokenSelector(null)} className="rounded-full">
                    <ChevronDown className="h-5 w-5 rotate-180" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Search by name or address" 
                    className="bg-white/5 border-white/10 pl-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <div className="grid grid-cols-1 gap-1">
                  {tokens
                    .filter(t => 
                      t.s.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      t.n.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.a.toLowerCase() === searchQuery.toLowerCase()
                    )
                    .slice(0, 100)
                    .map((t) => (
                    <button
                      key={t.a}
                      onClick={() => {
                        if (showTokenSelector === 'from') setFromToken(t);
                        else setToToken(t);
                        setShowTokenSelector(null);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <img src={t.l || `https://via.placeholder.com/24?text=${t.s.slice(0, 1)}`} className="h-8 w-8 rounded-full bg-zinc-800" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-neon-cyan transition-colors">{t.s}</span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-[200px]">{t.n}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                         <span className="text-[9px] font-mono text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                           {t.a.slice(0, 6)}...{t.a.slice(-4)}
                         </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
