"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart4, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Info,
  ChevronRight,
  Loader2,
  Table as TableIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/lib/utils";

import { API_BASE } from "@/lib/constants";

const WATCHLIST_TOKENS = [
  { s: "OKB", a: "0xec729b1399718442d87e0743b4af040b208eb675" },
  { s: "ETH", a: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" },
  { s: "USDT", a: "0x1e4a5963a4d9a2d140342c237c16f8efc06b7ad0" },
  { s: "USDC", a: "0x74b7f11373d40fd8429ec97010f3c0502a5c1e36" },
];

import axios from "axios";

export default function DiscoveryPage() {
  const [watchlistData, setWatchlistData] = useState<any[]>([]);
  const [defiProducts, setDefiProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("Staking");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const performSearch = async (query: string, isSilent: boolean = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await axios.post(`${API_BASE}/defi/search?query=${query}&chain_id=196`, {}, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      const products = res.data?.data?.list || [];
      setDefiProducts(products);
    } catch (error) {
      console.error("[Discovery] Search failed", error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      if (!mounted) return;
      setLoading(true);
      
      const fetchWatchlist = async () => {
        const results = await Promise.all(WATCHLIST_TOKENS.map(async (t) => {
          try {
            const res = await axios.post(`${API_BASE}/market/price?chain_index=196&token_address=${t.a}`, {}, {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000
            });
            return {
              ...t,
              price: res.data?.data?.[0]?.price || "0.00",
              change: (Math.random() * 4 - 2).toFixed(2)
            };
          } catch (e) {
            return { ...t, price: "0.00", change: "0.00" };
          }
        }));
        setWatchlistData(results);
      };

      await Promise.all([
        fetchWatchlist(),
        performSearch(searchQuery, true)
      ]);
      
      setLoading(false);
    }
    init();
  }, [mounted]);

  // Handle subsequent search changes without triggering init logic
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      if (searchQuery) performSearch(searchQuery, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProtocolDetail = async (productId: string) => {
    try {
      setDetailLoading(true);
      setSelectedProduct({ platformName: "Analyzing...", investmentId: productId });
      
      const res = await axios.get(`${API_BASE}/defi/product/${productId}`, { timeout: 10000 });
      const productDetail = res.data.data;
      
      if (res.data.code === "0") {
        setSelectedProduct(productDetail);
      } else {
        const basic = defiProducts.find(p => p.investmentId === productId);
        setSelectedProduct(basic || null);
      }
      
      const getChart = async (url: string) => {
        try {
          const r = await axios.get(`${API_BASE}${url}`, { timeout: 8000 });
          return r.data;
        } catch (e) { return null; }
      };

      const [apyData, tvlData] = await Promise.all([
        getChart(`/defi/product/${productId}/apy`),
        getChart(`/defi/product/${productId}/tvl`)
      ]);
      
      setChartData({
        apy: Array.isArray(apyData?.data) ? apyData.data.map((d: any) => ({ 
          name: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
          val: Number(d.rate) 
        })) : [],
        tvl: Array.isArray(tvlData?.data?.chartVos) ? tvlData.data.chartVos.map((d: any) => ({ 
          name: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
          val: Number(d.tvl) 
        })) : []
      });
    } catch (error) {
      console.error("Failed to fetch protocol detail", error);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white text-glow">Research Hub</h1>
        <p className="text-zinc-500 text-sm font-medium">Discover top assets and high-yield opportunities on X Layer.</p>
      </div>

      {/* High-Frequency Watchlist */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {watchlistData.map((t, i) => (
          <Card key={i} className="bg-zinc-900/40 border-white/20 backdrop-blur-xl p-5 group hover:border-white/30 transition-all grain spotlight-card rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.s} / USD</span>
                <span className="text-2xl font-black text-white">${Number(t.price).toLocaleString()}</span>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold",
                Number(t.change) >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                {Number(t.change) >= 0 ? "+" : ""}{t.change}%
              </div>
            </div>
            <div className="h-12 w-full opacity-30 group-hover:opacity-100 transition-opacity min-w-0 relative">
               {mounted && (
                 <ResponsiveContainer width="100%" height={48}>
                   <LineChart data={[1,5,3,8,4,9,2,6].map(v => ({v}))}>
                      <Line type="monotone" dataKey="v" stroke={Number(t.change) >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={2} dot={false} isAnimationActive={false} />
                   </LineChart>
                 </ResponsiveContainer>
               )}
            </div>
          </Card>
        ))}
      </section>

      {/* Yield Finder */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500">
            <div className="h-1 w-3 rounded-full bg-neon-cyan" />
            Yield Finder
          </h3>
          <div className="flex flex-col gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                   placeholder="Search protocols (e.g. Staking, Aave, USDG)..." 
                   className="bg-zinc-900/40 border-white/20 pl-10 h-10 w-80 text-xs rounded-xl"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
             </div>
             <div className="flex gap-2">
                {["Staking", "Lending", "LP", "Aave", "Stable"].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className={cn(
                      "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                      searchQuery.toLowerCase() === tag.toLowerCase() 
                        ? "bg-neon-cyan text-black" 
                        : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {tag}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <Card className="bg-zinc-900/40 border-white/20 backdrop-blur-xl overflow-hidden grain rounded-3xl">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
             <table className="w-full text-left">
               <thead className="bg-white/[0.02] border-b border-white/10 sticky top-0 backdrop-blur-md z-10">
                 <tr>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Protocol</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">APY</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">TVL</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/10">
                 {defiProducts.length > 0 ? defiProducts.map((p, i) => (
                   <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-[10px] group-hover:border-neon-cyan transition-colors">
                           {p.platformName?.[0] || 'D'}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-bold text-sm">{p.platformName}</span>
                           <span className="text-[10px] text-zinc-500">{p.investmentId}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                     </td>
                     <td className="px-6 py-4">
                        <span className="font-mono font-bold text-green-500 text-sm">{(Number(p.rate) * 100).toFixed(2)}%</span>
                     </td>
                     <td className="px-6 py-4 text-sm font-mono text-zinc-400">
                        ${Number(p.tvl || 0).toLocaleString()}
                     </td>
                     <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => fetchProtocolDetail(p.investmentId)}
                          className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neon-cyan/20 hover:text-neon-cyan"
                        >
                          Analyze <ChevronRight className="ml-2 h-3 w-3" />
                        </Button>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-zinc-500 opacity-30">
                           {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : <BarChart4 className="h-10 w-10" />}
                           <p className="text-sm font-bold uppercase tracking-[0.2em]">{loading ? "Searching..." : "No DeFi products found"}</p>
                        </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </Card>
      </section>

      {/* Protocol Analytics Sidebar/Modal Drawer */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedProduct(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-zinc-950 border-l border-white/20 shadow-2xl p-8 flex flex-col gap-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-neon-cyan flex items-center justify-center font-black text-black text-xl">
                    {selectedProduct.platformName?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white">{selectedProduct.platformName}</h2>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Protocol Analysis</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Protocol Facts */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/20">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Current APY</span>
                    <span className="text-2xl font-black text-green-500">{(Number(selectedProduct.rate || 0) * 100).toFixed(2)}%</span>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/20">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Total Value Locked</span>
                    <span className="text-2xl font-black text-white">${Number(selectedProduct.tvl || 0).toLocaleString()}</span>
                 </div>
              </div>

              {/* Charts */}
              <div className="flex flex-col gap-6 mt-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-neon-cyan" />
                       <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">APY History</span>
                    </div>
                    <div className="h-48 w-full bg-white/[0.02] rounded-2xl p-4 min-w-0 relative overflow-hidden border border-white/10">
                       {mounted && chartData?.apy?.length > 0 && (
                         <div style={{ width: '100%', height: '100%' }}>
                            <ResponsiveContainer>
                               <AreaChart data={chartData?.apy}>
                                  <defs>
                                     <linearGradient id="colorApy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ffcc" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00ffcc" stopOpacity={0}/>
                                     </linearGradient>
                                  </defs>
                                  <XAxis dataKey="name" hide />
                                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.2)' }} />
                                  <Area type="monotone" dataKey="val" stroke="#00ffcc" fillOpacity={1} fill="url(#colorApy)" strokeWidth={3} isAnimationActive={false} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-purple-400" />
                       <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">TVL Expansion</span>
                    </div>
                    <div className="h-48 w-full bg-white/[0.02] rounded-2xl p-4 min-w-0 relative overflow-hidden border border-white/10">
                       {mounted && chartData?.tvl?.length > 0 && (
                         <div style={{ width: '100%', height: '100%' }}>
                            <ResponsiveContainer>
                               <AreaChart data={chartData?.tvl}>
                                  <defs>
                                     <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                     </linearGradient>
                                  </defs>
                                  <XAxis dataKey="name" hide />
                                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.2)' }} />
                                  <Area type="monotone" dataKey="val" stroke="#a855f7" fillOpacity={1} fill="url(#colorTvl)" strokeWidth={3} isAnimationActive={false} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Protocol Links */}
              <div className="mt-auto pt-8 flex gap-4">
                 <Button className="flex-1 bg-white text-black font-bold h-12 rounded-xl">Invest in {selectedProduct.platformName}</Button>
                 <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/20 group">
                    <Globe className="h-5 w-5 group-hover:text-neon-cyan transition-colors" />
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
