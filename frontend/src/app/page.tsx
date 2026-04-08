"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FearGreedGauge } from "@/components/fear-greed-gauge";
import { WalletConnect } from "@/components/wallet-connect";
import { TrendingUp, Activity, BarChart3, PieChart, ArrowUpRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/store/useWalletStore";

const API_BASE = "https://x-layer-api-349808161165.us-central1.run.app";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [fearGreed, setFearGreed] = useState<any>(null);
  const [searchAddress, setSearchAddress] = useState("");
  const { setAddress } = useWalletStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const CACHE_KEY = "market_data_cache";
      const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
      
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { stats: cStats, fearGreed: cFG, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setStats(cStats);
            setFearGreed(cFG);
            return;
          }
        }

        const [statsRes, fgRes] = await Promise.all([
          fetch(`${API_BASE}/market/global-stats`),
          fetch(`${API_BASE}/market/fear-greed`)
        ]);
        const statsData = await statsRes.json();
        const fgData = await fgRes.json();
        
        setStats(statsData.data);
        setFearGreed(fgData.data);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          stats: statsData.data,
          fearGreed: fgData.data,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error("Failed to fetch market data", error);
      }
    }
    fetchData();
  }, []);

  const handleWatch = () => {
    if (searchAddress.startsWith("0x")) {
      setAddress(searchAddress, true);
      router.push("/portfolio");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-10 p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto">
      {/* Hero Section - Refactored for efficiency */}
      <section>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-white/5"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-glow leading-[1.1]">
              Manage your <span className="text-neon-cyan neon-glow">X Layer</span> Assets.
            </h1>
            <p className="text-zinc-500 text-sm max-w-lg font-medium">
              Premium portfolio tracking for the next generation of DeFi on OKX's high-performance L2.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
             <div className="relative w-full sm:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
               <Input 
                 placeholder="Watch address (0x...)" 
                 className="bg-transparent border-none pl-10 h-10 focus-visible:ring-0 font-mono text-xs w-full"
                 value={searchAddress}
                 onChange={(e) => setSearchAddress(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleWatch()}
               />
             </div>
             <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
             <WalletConnect />
          </div>
        </motion.div>
      </section>

      {/* Market Ticker Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Market Cap" 
          value={stats?.quote?.USD?.total_market_cap ? formatCurrency(stats.quote.USD.total_market_cap) : "---"} 
          icon={TrendingUp}
          change={stats?.quote?.USD?.total_market_cap_yesterday_percentage_change}
        />
        <StatCard 
          label="24h Volume" 
          value={stats?.quote?.USD?.total_volume_24h ? formatCurrency(stats.quote.USD.total_volume_24h) : "---"} 
          icon={Activity}
          change={stats?.quote?.USD?.total_volume_24h_yesterday_percentage_change}
        />
        <StatCard 
          label="BTC Dominance" 
          value={stats?.btc_dominance ? `${stats.btc_dominance.toFixed(2)}%` : "---"} 
          icon={BarChart3}
          change={stats?.btc_dominance_24h_percentage_change}
        />
        <StatCard 
          label="ETH Dominance" 
          value={stats?.eth_dominance ? `${stats.eth_dominance.toFixed(2)}%` : "---"} 
          icon={PieChart}
          change={stats?.eth_dominance_24h_percentage_change}
        />
      </section>

      {/* Unified Pulse Section: Sentiment + Why X Layer + Ecosystem Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Market Sentiment - Col 1-3 */}
        <Card className="lg:col-span-4 p-8 bg-zinc-900/40 border-white/5 backdrop-blur-xl flex flex-col items-center justify-between gap-6 relative overflow-hidden grain group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-cyan opacity-20" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Market Pulse</h3>
          <FearGreedGauge value={fearGreed?.value || 50} />
          <p className="text-[10px] text-zinc-600 text-center max-w-[220px] leading-relaxed uppercase font-bold tracking-tighter">
            Computed from market volatility, volume, and social trends.
          </p>
        </Card>

        {/* Why X Layer - Col 4-12 (Split) */}
        <Card className="lg:col-span-8 bg-zinc-900/20 border-white/5 backdrop-blur-xl relative overflow-hidden group p-1 grain">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Left Info Column */}
            <div className="md:col-span-2 p-8 flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan text-[10px] font-bold uppercase tracking-widest">Mainnet</span>
                  <h3 className="text-2xl font-black tracking-tight">X Layer Protocol</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                  Powered by OKX and Polygon, X Layer is a ZK-powered Layer 2 that brings institutional-grade throughput and near-zero costs to the Ethereum ecosystem. Our unified SDK integrates directly with OKX Onchain OS.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-neon-cyan">0.01s</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Latency</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-purple-400">&lt; $0.01</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Gas Fee</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">ZK-EVM</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Security</span>
                </div>
              </div>
            </div>
            {/* Right Fast Stats Column */}
            <div className="bg-white/[0.02] border-l border-white/5 p-8 flex flex-col gap-8 justify-center">
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active Pairs</span>
                 <span className="text-xl font-mono font-bold text-white">{stats?.active_market_pairs?.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Global Assets</span>
                 <span className="text-xl font-mono font-bold text-white">{stats?.active_cryptocurrencies?.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">24h Growth</span>
                 <span className="text-xl font-mono font-bold text-green-500">+{stats?.past_24h_incremental_crypto_number?.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Ecosystem Global Stats - Refined for Density */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500">
          <div className="h-1 w-3 rounded-full bg-neon-cyan" />
          Global Crypto Ecosystem
        </h3>
        <Card className="p-8 bg-zinc-900/40 border-white/5 backdrop-blur-xl grain relative overflow-hidden">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
             {/* Assets Proportion */}
             <div className="flex flex-col gap-4">
               <div className="flex flex-col">
                 <span className="text-3xl font-black tracking-tighter mb-1">{stats?.active_cryptocurrencies?.toLocaleString()}</span>
                 <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-4">Active Assets</span>
                 <div className="flex items-center gap-2">
                   <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-neon-cyan shadow-[0_0_8px_rgba(0,255,204,0.5)] transition-all duration-1000" 
                       style={{ width: `${(stats?.active_cryptocurrencies / stats?.total_cryptocurrencies) * 100}%` }}
                     />
                   </div>
                   <span className="text-[10px] font-mono text-neon-cyan font-bold">
                     {((stats?.active_cryptocurrencies / stats?.total_cryptocurrencies) * 100).toFixed(1)}%
                   </span>
                 </div>
               </div>
             </div>

             {/* Exchanges Proportion */}
             <div className="flex flex-col gap-4">
               <div className="flex flex-col">
                 <span className="text-3xl font-black tracking-tighter mb-1">{stats?.active_exchanges?.toLocaleString()}</span>
                 <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-4">Active Exchanges</span>
                 <div className="flex items-center gap-2">
                   <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-purple-500 transition-all duration-1000" 
                       style={{ width: `${(stats?.active_exchanges / stats?.total_exchanges) * 100}%` }}
                     />
                   </div>
                   <span className="text-[10px] font-mono text-purple-400 font-bold">
                     {((stats?.active_exchanges / stats?.total_exchanges) * 100).toFixed(1)}%
                   </span>
                 </div>
               </div>
             </div>

             {/* DeFi Focus */}
             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col">
                   <span className="text-xl font-black tracking-tight">{formatCurrency(stats?.defi_market_cap)}</span>
                   <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">DeFi Market Cap</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xl font-black tracking-tight">{formatCurrency(stats?.defi_volume_24h)}</span>
                   <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">DeFi 24h Volume</span>
                 </div>
               </div>
             </div>

             {/* Trading Sectors */}
             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col">
                   <span className="text-xl font-black tracking-tight">{formatCurrency(stats?.stablecoin_market_cap)}</span>
                   <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Stablecoin Cap</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xl font-black tracking-tight">{formatCurrency(stats?.derivatives_volume_24h)}</span>
                   <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Derivatives 24h</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Trend Footer */}
           <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex flex-col gap-1">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">7d Expansion</span>
               <span className="text-sm font-mono font-bold text-white">+{stats?.past_7d_incremental_crypto_number?.toLocaleString()} Coins</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">30d Expansion</span>
               <span className="text-sm font-mono font-bold text-white">+{stats?.past_30d_incremental_crypto_number?.toLocaleString()} Coins</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">DeFi 24h Change</span>
               <span className={`text-sm font-mono font-bold ${stats?.defi_24h_percentage_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {stats?.defi_24h_percentage_change >= 0 ? '+' : ''}{stats?.defi_24h_percentage_change?.toFixed(2)}%
               </span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Stable 24h Change</span>
               <span className={`text-sm font-mono font-bold ${stats?.stablecoin_24h_percentage_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {stats?.stablecoin_24h_percentage_change >= 0 ? '+' : ''}{stats?.stablecoin_24h_percentage_change?.toFixed(2)}%
               </span>
             </div>
           </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, change }: any) {
  return (
    <Card className="p-6 bg-zinc-900/40 border-white/5 backdrop-blur-xl hover:border-white/15 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-neon-cyan/20 transition-colors">
          <Icon className="h-5 w-5 text-zinc-400 group-hover:text-neon-cyan" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{label}</span>
        <span className="text-2xl font-bold tracking-tight text-glow">{value}</span>
      </div>
    </Card>
  );
}
