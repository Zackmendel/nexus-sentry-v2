"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, Check, Wallet, History, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://x-layer-api-349808161165.us-central1.run.app";

export default function PortfolioPage() {
  const { address, isConnected } = useWalletStore();
  const [loading, setLoading] = useState(true);
  const [showFullPnl, setShowFullPnl] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    total: null,
    balances: [],
    history: [],
    pnl: null
  });

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
      try {
        setLoading(true);
        const [totalRes, balancesRes, historyRes, pnlRes] = await Promise.all([
          fetch(`${API_BASE}/portfolio/${address}/total`),
          fetch(`${API_BASE}/portfolio/${address}/balances`),
          fetch(`${API_BASE}/portfolio/${address}/history`),
          fetch(`${API_BASE}/portfolio/${address}/pnl`)
        ]);

        const totalData = await totalRes.json();
        const balancesData = await balancesRes.json();
        const historyData = await historyRes.json();
        const pnlData = await pnlRes.json();

        setData({
          total: totalData.data?.[0]?.totalValue || "0.00",
          balances: balancesData.data?.[0]?.tokenAssets || [],
          history: historyData.data?.[0]?.transactions || [],
          pnl: pnlData.data || null
        });
      } catch (error) {
        console.error("Failed to fetch portfolio", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [address]);

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <Lock className="h-12 w-12 text-zinc-600" />
        </div>
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Portfolio Locked</h2>
          <p className="text-zinc-500 max-w-xs">Connect your wallet to view your X Layer assets and transaction history.</p>
        </div>
        <WalletConnect />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-neon-cyan animate-spin" />
          <span className="text-zinc-500 font-medium font-mono text-xs uppercase tracking-widest">Loading assets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto">
      {/* Wallet Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2 p-10 bg-gradient-to-br from-zinc-900 to-black border-white/10 relative overflow-hidden group grain">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Wallet className="h-40 w-40 text-neon-cyan" />
          </div>
          <div className="relative flex flex-col gap-2">
             <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Global Net Worth</span>
             <div className="flex items-baseline gap-4">
               <h2 className="text-5xl lg:text-7xl font-black text-glow tracking-tighter">
                 ${Number(data.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h2>
               <div className="px-3 py-1 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan text-[10px] font-black uppercase tracking-widest hidden sm:block">
                 X Layer Mainnet
               </div>
             </div>
             
             <div className="flex items-center gap-3 mt-8 bg-black/40 w-fit p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="px-4 py-2 text-zinc-400 font-mono text-xs select-all">
                  {address.slice(0, 10)}...{address.slice(-10)}
                </div>
                <div className="flex items-center gap-1 pr-1">
                   <button 
                     onClick={() => handleCopy(address, 'main')}
                     className="p-2.5 rounded-xl hover:bg-white/10 text-zinc-500 hover:text-white transition-all group/copy relative"
                     title="Copy Address"
                   >
                     {copiedAddress === 'main' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 group-hover/copy:scale-110" />}
                   </button>
                   <a 
                     href={`https://www.okx.com/explorer/xlayer/address/${address}`}
                     target="_blank"
                     className="p-2.5 rounded-xl hover:bg-white/10 text-zinc-500 hover:text-white transition-all group/exp"
                     title="View on OKX Explorer"
                   >
                     <ExternalLink className="h-4 w-4 group-hover/exp:scale-110" />
                   </a>
                </div>
             </div>
          </div>
        </Card>

        <Card className="p-8 bg-zinc-900/40 border-white/5 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Realized PnL</span>
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-black ${Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? '+' : ''}${Math.abs(Number(data.pnl?.realizedPnlUsd || 0)).toLocaleString()}
                </span>
                {Number(data.pnl?.realizedPnlUsd || 0) >= 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Win Rate</span>
              <span className="text-2xl font-bold text-white">
                {(Number(data.pnl?.winRate || 0) * 100).toFixed(1)}%
              </span>
            </div>

            <AnimatePresence>
              {showFullPnl && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-6 overflow-hidden pt-6 border-t border-white/10"
                >
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sell Volume</span>
                      <span className="text-xl font-bold text-white">
                        ${Number(data.pnl?.sellTxVolume || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Avg Buy Val</span>
                      <span className="text-xl font-bold text-white">
                        ${Number(data.pnl?.avgBuyValueUsd || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Buy Txs</span>
                      <span className="text-sm font-mono text-zinc-300">
                        {data.pnl?.buyTxCount || 0}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sell Txs</span>
                      <span className="text-sm font-mono text-zinc-300">
                        {data.pnl?.sellTxCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Performance Distribution */}
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Performance Distribution</span>
                    {(() => {
                      const bins: any = data.pnl?.tokenCountByPnlPercent || {};
                      const total = Object.values(bins).reduce((acc: number, val: any) => acc + Number(val), 0) || 1;
                      return (
                        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-zinc-800">
                           <div className="h-full bg-green-500" style={{ width: `${(Number(bins.over500Percent || 0) / (total as number)) * 100}%` }} />
                           <div className="h-full bg-green-400 opacity-60" style={{ width: `${(Number(bins.zeroTo500Percent || 0) / (total as number)) * 100}%` }} />
                           <div className="h-full bg-red-400 opacity-60" style={{ width: `${(Number(bins.zeroToMinus50Percent || 0) / (total as number)) * 100}%` }} />
                           <div className="h-full bg-red-500" style={{ width: `${(Number(bins.overMinus50Percent || 0) / (total as number)) * 100}%` }} />
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setShowFullPnl(!showFullPnl)}
            className="w-full mt-6 border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
          >
            {showFullPnl ? "Show Less" : "Full Analysis"}
          </Button>
        </Card>
      </motion.section>

      {/* Vertical Stack: Assets followed by Activity */}
      <div className="flex flex-col gap-10">
        
        {/* Token List */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500">
            <div className="h-1 w-3 rounded-full bg-neon-cyan" />
            Asset Portfolio
          </h3>
          <Card className="bg-zinc-900/20 border-white/5 backdrop-blur-xl overflow-hidden grain border-t-white/10">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 px-8">Asset</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Balance</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Market Price</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.balances.length > 0 ? data.balances.map((token: any, i: number) => (
                    <TableRow key={i} className="hover:bg-white/5 border-white/5 transition-colors group cursor-default">
                      <TableCell className="py-4 px-8">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] overflow-hidden border border-white/10 group-hover:border-neon-cyan transition-colors">
                            {token.logoUrl ? <img src={token.logoUrl} alt={token.tokenSymbol} /> : token.tokenSymbol?.slice(0, 1)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{token.tokenSymbol}</span>
                            <div className="flex items-center gap-2 group/token">
                              <span className="text-[10px] text-zinc-500 font-mono tracking-tighter opacity-70 italic">{token.tokenAddress?.slice(0, 10)}...</span>
                              <button 
                                onClick={() => handleCopy(token.tokenAddress, token.tokenAddress)}
                                className="opacity-0 group-hover/token:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded"
                                title="Copy Token Address"
                              >
                                {copiedAddress === token.tokenAddress ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-zinc-600 hover:text-white" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">{Number(token.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-zinc-400">${Number(token.price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right px-8">
                        <span className="font-bold text-white text-base group-hover:text-neon-cyan transition-colors">
                          ${Number(token.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24 text-zinc-500 italic">No assets detected on X Layer</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        {/* Activity Feed - Enhanced with more details */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-500">
            <div className="h-1 w-3 rounded-full bg-purple-500" />
            Operational History
          </h3>
          <Card className="bg-zinc-900/20 border-white/5 backdrop-blur-xl overflow-hidden grain border-t-white/10">
            <div className="flex flex-col">
              <div className="divide-y divide-white/5">
                {data.history.length > 0 ? data.history.map((tx: any, i: number) => {
                   const isSend = tx.from?.[0]?.address?.toLowerCase() === address?.toLowerCase();
                   const side = isSend ? "Send" : "Receive";
                   
                   return (
                     <div 
                       key={i}
                       className="grid grid-cols-1 md:grid-cols-12 items-center p-6 hover:bg-white/[0.02] transition-colors group gap-4"
                     >
                        {/* Transaction Icon & Side */}
                        <div className="md:col-span-3 flex items-center gap-4">
                          <div className={`shrink-0 p-2.5 rounded-xl ${side === 'Send' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'} border border-current opacity-60`}>
                            {side === 'Send' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black tracking-tight">{side === 'Send' ? 'Transfer Sent' : 'Payment Received'}</span>
                              <span className={`${tx.txStatus === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} text-[8px] font-black uppercase px-2 py-0.5 rounded border border-current/20`}>
                                {tx.txStatus}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 group/tx">
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[150px]">
                                TX: {tx.txHash?.slice(0, 16)}...
                              </span>
                              <button 
                                onClick={() => handleCopy(tx.txHash, tx.txHash)}
                                className="opacity-0 group-hover/tx:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded"
                                title="Copy Tx Hash"
                              >
                                {copiedAddress === tx.txHash ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-zinc-700 hover:text-white" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Counterparty Info */}
                        <div className="md:col-span-3 flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{side === 'Send' ? 'Recipient' : 'Sender'}</span>
                          <span className="text-xs font-mono text-zinc-300 truncate">
                            {isSend ? tx.to?.[0]?.address : tx.from?.[0]?.address}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="md:col-span-3 grid grid-cols-2 gap-4">
                           <div className="flex flex-col">
                             <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Network Fee</span>
                             <span className="text-xs font-mono text-zinc-400">{tx.txFee || "0.00"} OKB</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Nonce</span>
                             <span className="text-xs font-mono text-zinc-400">#{tx.nonce || "0"}</span>
                           </div>
                        </div>

                        {/* Amount & Action */}
                        <div className="md:col-span-3 flex items-center justify-end gap-6">
                          <div className="flex flex-col items-end">
                            <span className={`text-lg font-black font-mono tracking-tight ${side === 'Send' ? 'text-zinc-200' : 'text-neon-cyan neon-glow-text'}`}>
                              {side === 'Send' ? '-' : '+'}{tx.amount} {tx.symbol}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-bold">{new Date(Number(tx.txTime)).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`https://www.okx.com/explorer/xlayer/tx/${tx.txHash}`} 
                              target="_blank" 
                              className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                     </div>
                   );
                }) : (
                  <div className="p-24 flex items-center justify-center text-zinc-500 italic text-sm">
                    No transactions found for this address.
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
