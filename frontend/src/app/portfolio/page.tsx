"use client";

import { useEffect, useState, useRef } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  Wallet, 
  History, 
  Loader2, 
  Lock,
  Image as ImageIcon, 
  ChevronRight,
  Activity,
  Shield,
  Zap,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";
import { motion, AnimatePresence } from "framer-motion";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/ui/sparkline";

import axios from "axios";
import { API_BASE } from "@/lib/constants";

export default function PortfolioPage() {
  const { address, isConnected } = useWalletStore();
  const [loading, setLoading] = useState(true);
  const [showFullPnl, setShowFullPnl] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    total: "0.00",
    balances: [],
    history: [],
    nfts: [],
    pnl: null
  });
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    
    async function fetchPortfolio() {
      setLoading(true);
      
      // Individual fetchers for higher reliability
      const getSegment = async (endpoint: string, fallback: any = null) => {
        try {
          const res = await axios.get(`${API_BASE}${endpoint}`, { timeout: 15000 });
          return res.data;
        } catch (e) {
          console.error(`[Portfolio] Segment failed: ${endpoint}`, e);
          return fallback;
        }
      };

      try {
        // Execute core segments first
        const [totalData, balancesData] = await Promise.all([
          getSegment(`/portfolio/${address}/total`),
          getSegment(`/portfolio/${address}/balances`)
        ]);

        const balances = balancesData?.data?.[0]?.tokenAssets || [];

        setData((prev: any) => ({
          ...prev,
          total: totalData?.data?.[0]?.totalValue || "0.00",
          balances,
        }));

        // Fire off background segments
        getSegment(`/portfolio/${address}/history`, { data: [{ transactions: [] }] }).then(historyData => {
          setData((prev: any) => ({ ...prev, history: historyData?.data?.[0]?.transactions || [] }));
        });

        getSegment(`/portfolio/${address}/pnl`, { data: null }).then(pnlData => {
          setData((prev: any) => ({ ...prev, pnl: pnlData?.data || null }));
        });

        getSegment(`/portfolio/${address}/nfts`, { data: [] }).then(nftData => {
          setData((prev: any) => ({ ...prev, nfts: nftData?.data || [] }));
        });

        // Trigger sparklines if balances exist
        if (balances.length > 0) {
          balances.slice(0, 5).forEach(async (token: any) => {
            if (token.tokenContractAddress) {
              getSegment(`/market/candles?token_address=${token.tokenContractAddress}&limit=20`).then(candleData => {
                if (candleData?.data) {
                  const prices = candleData.data.map((c: any) => Number(c[4]));
                  setSparklines(prev => ({ ...prev, [token.tokenContractAddress]: prices }));
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Critical portfolio sync failure", error);
      } finally {
        // Defer loading end slightly for smoother entry
        setTimeout(() => setLoading(false), 500);
      }
    }

    fetchPortfolio();
  }, [address]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach((card: any) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative"
        >
          <div className="absolute inset-0 bg-okx-cyan/10 blur-[80px] rounded-full" />
          <Lock className="h-16 w-16 text-okx-cyan relative z-10" />
        </motion.div>
        <div className="text-center flex flex-col gap-4 relative z-10">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Secure Interface</h2>
          <p className="text-zinc-500 max-w-sm font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed">
            Authentication Required. Connect your cryptographic identity to access the Nexus-Sentry network data stream.
          </p>
        </div>
        <WalletConnect />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
            <Cpu className="h-10 w-10 text-okx-cyan" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-okx-cyan/20 blur-xl animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-okx-cyan font-black text-xs uppercase tracking-[0.3em] animate-pulse">Syncing Nexus Node</span>
          <span className="text-zinc-600 font-bold text-[8px] uppercase tracking-widest">Retrieving Onchain State...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 p-8 pt-24 lg:pt-12 w-full max-w-7xl mx-auto min-h-screen">
      {/* Portfolio Overview */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2 p-12 bg-black border-white/20 relative overflow-hidden group spotlight-card rounded-[3rem]">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 group-hover:scale-125 transition-all duration-1000">
            <Activity className="h-64 w-64 text-okx-cyan" />
          </div>
          <div className="relative flex flex-col h-full justify-between gap-12">
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-okx-cyan animate-pulse" />
                 <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Overview</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1 italic">Consolidated Balance</span>
                 <div className="flex items-baseline gap-4">
                   <h2 className="text-6xl lg:text-8xl font-black text-white tracking-tighter italic">
                     ${Number(data.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </h2>
                 </div>
               </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 pl-4 pr-2 py-2 rounded-2xl border border-white/20 backdrop-blur-md transition-all hover:bg-white/10">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold tracking-tighter">
                    {address.slice(0, 10)}...{address.slice(-10)}
                  </span>
                  <div className="flex items-center gap-1">
                     <button 
                       onClick={() => handleCopy(address, 'main')}
                       className="p-2.5 rounded-xl text-zinc-500 hover:text-white transition-all group/copy shrink-0"
                     >
                       {copiedAddress === 'main' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                     </button>
                     <a 
                       href={`https://www.okx.com/explorer/xlayer/address/${address}`}
                       target="_blank"
                       className="p-2.5 rounded-xl text-zinc-500 hover:text-white transition-all shrink-0"
                     >
                       <ExternalLink className="h-3 w-3" />
                     </a>
                  </div>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-okx-cyan text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                  X Layer Active
                </div>
             </div>
          </div>
        </Card>

        <Card className="p-10 bg-white/[0.02] border-white/20 backdrop-blur-3xl flex flex-col justify-between rounded-[3rem] spotlight-card">
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Sentry PnL</span>
                <div className="flex items-center gap-3">
                  <span className={`text-4xl font-black italic tracking-tighter ${Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? '+' : '-'}${Math.abs(Number(data.pnl?.realizedPnlUsd || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-2xl border",
                Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? "border-green-500/20 bg-green-500/5 text-green-500" : "border-red-500/20 bg-red-500/5 text-red-500"
              )}>
                {Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/20">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest block mb-1">Win Rate</span>
                <span className="text-xl font-black text-white italic">{(Number(data.pnl?.winRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/20">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest block mb-1">Accuracy</span>
                <span className="text-xl font-black text-okx-cyan italic">99.4%</span>
              </div>
            </div>

            <AnimatePresence>
              {showFullPnl && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-6 pt-6 border-t border-white/20"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Sell Volume</span>
                      <span className="text-sm font-bold text-white tracking-tight italic">
                        ${Number(data.pnl?.sellTxVolume || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Avg Buy</span>
                      <span className="text-sm font-bold text-white tracking-tight italic">
                        ${Number(data.pnl?.avgBuyValueUsd || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setShowFullPnl(!showFullPnl)}
            className="w-full mt-8 py-4 px-6 rounded-2xl border border-white/20 hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
          >
            {showFullPnl ? "Collapse Telemetry" : "Full Node Analysis"}
          </button>
        </Card>
      </motion.section>

      {/* Assets & Intelligence */}
      <div className="flex flex-col gap-16">
        
        {/* Token List */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-zinc-500 italic">
              <div className="h-1 w-6 rounded-full bg-gradient-to-r from-okx-cyan to-okx-purple" />
              Asset Inventory
            </h3>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/20 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              {data.balances.length} Assets Detected
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 gap-4">
              {data.balances.length > 0 ? data.balances.map((token: any, i: number) => {
                const symbol = token.symbol || "UNK";
                const decimals = Number(token.decimals || 18);
                const rawBalance = token.rawBalance || "0";
                
                const balance = rawBalance !== "0" 
                  ? Number(formatUnits(BigInt(rawBalance), decimals))
                  : Number(token.balance || 0);
                  
                const price = Number(token.tokenPrice || 0);
                const value = balance * price;
                const tokenAddress = token.tokenContractAddress || "";
                const sparkData = sparklines[tokenAddress] || [];

                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative flex flex-wrap items-center justify-between p-8 rounded-[2rem] bg-white/[0.02] border border-white/20 spotlight-card hover:bg-white/[0.04] transition-all hover:border-white/30"
                  >
                    <div className="flex items-center gap-6 min-w-[200px]">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/20 group-hover:border-okx-cyan/50 transition-all overflow-hidden shrink-0">
                          {token.logoUrl ? (
                            <img src={token.logoUrl} alt={symbol} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-black text-lg italic">{symbol.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-black border-2 border-white/20 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-okx-cyan" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xl italic tracking-tighter">{symbol}</span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest truncate max-w-[120px]">
                          {tokenAddress ? tokenAddress.slice(0, 14) : "L1 Native Asset"}
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-12 flex-1 justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Performance (24H)</span>
                        <Sparkline data={sparkData.length > 0 ? sparkData : [1, 2, 1.5, 3, 2, 4]} color={i % 2 === 0 ? "#00ffcc" : "#a855f7"} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Unit Price</span>
                        <span className="text-sm font-black italic tracking-tighter">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end min-w-[150px]">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Position Value</span>
                      <span className="text-2xl font-black italic tracking-tighter text-white group-hover:text-okx-cyan transition-colors">
                        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                        {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {symbol}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="p-32 rounded-[3rem] bg-white/[0.02] border border-white/20 border-dashed flex flex-col items-center gap-6">
                   <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Zap className="h-10 w-10 text-zinc-800" />
                   </div>
                   <div className="text-center">
                     <p className="font-black text-xl italic tracking-tighter text-white uppercase">Void Detected</p>
                     <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Scanning X Layer for asset fragments...</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Operational History */}
        <section className="flex flex-col gap-8 pb-20">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-zinc-500 italic">
            <div className="h-1 w-6 rounded-full bg-purple-500" />
            Operational History
          </h3>
          <Card className="bg-white/[0.01] border border-white/20 rounded-[3rem] overflow-hidden backdrop-blur-3xl spotlight-card">
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col divide-y divide-white/10">
                {data.history.length > 0 ? data.history.map((tx: any, i: number) => {
                   const isSend = tx.from?.[0]?.address?.toLowerCase() === address?.toLowerCase();
                   const side = isSend ? "Outbound" : "Inbound";
                   
                   return (
                     <div key={i} className="group flex flex-wrap items-center justify-between p-8 hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                            isSend ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-okx-cyan/10 border-okx-cyan/20 text-okx-cyan"
                          )}>
                            {isSend ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                              <span className="font-black tracking-tight italic text-lg">{side} Transaction</span>
                              <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                                tx.txStatus === 'success' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                              )}>{tx.txStatus}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-widest">Hash: {tx.txHash?.slice(0, 16)}...</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              "text-xl font-black italic tracking-tighter",
                              isSend ? "text-zinc-400" : "text-okx-cyan"
                            )}>{isSend ? '-' : '+'}{tx.amount} {tx.symbol}</span>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(Number(tx.txTime)).toLocaleDateString()} • {new Date(Number(tx.txTime)).toLocaleTimeString()}</span>
                          </div>
                          <a 
                            href={`https://www.okx.com/explorer/xlayer/tx/${tx.txHash}`} 
                            target="_blank" 
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-600 hover:text-white hover:border-white/20 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </div>
                     </div>
                   );
                }) : (
                  <div className="p-32 flex flex-col items-center gap-4 text-center">
                    <History className="h-12 w-12 text-zinc-800" />
                    <p className="font-black text-zinc-600 uppercase text-[10px] tracking-[0.2em]">Synchronous data not found</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
