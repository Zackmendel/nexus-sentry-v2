"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  LineChart,
  Command,
  Maximize2,
  Minimize2,
  Cpu,
  RefreshCcw,
  Trash2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStore } from "@/store/useChatStore";
import { useWalletStore } from "@/store/useWalletStore";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import axios from "axios";

export function ChatInterface() {
  const { messages, isOpen, isLoading, setIsOpen, addMessage, setIsLoading, clearHistory } = useChatStore();
  const { address } = useWalletStore();
  const [input, setInput] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Open chat automatically on some pages or just by default for "vibe"
    setIsOpen(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !address) return;

    const userMessage = {
      role: 'user' as const,
      parts: [{ text: input.trim() }]
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);
    
    // Scroll to bottom only when user sends a message
    setTimeout(scrollToBottom, 100);

    try {
      const context = `User is currently on: ${pathname}`;
      const url = "/api/chat"; 
      const res = await axios.post(url, {
        message: `${context}\n\n${userMessage.parts[0].text}`,
        wallet_address: address,
        chain_id: 196,
        history: messages.slice(-10).map(m => ({
          role: m.role,
          parts: m.parts
        }))
      });

      const data = res.data;
      
      let type: 'text' | 'swap_proposal' = 'text';
      let actionData = null;
      
      if (data.response.includes("SWAP_PROPOSAL")) {
        try {
          const match = data.response.match(/SWAP_PROPOSAL:\s*({.*?})/);
          if (match) {
            actionData = JSON.parse(match[1]);
            type = 'swap_proposal';
          }
        } catch (e) {
          console.error("Failed to parse action data", e);
        }
      }

      addMessage({
        role: 'model',
        parts: [{ text: data.response }],
        type,
        data: actionData
      });
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        role: 'model',
        parts: [{ text: "System override failed. Connection to Nexus lost. Please recalibrate." }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (if closed) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-okx-cyan text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,255,204,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group"
        >
          <Bot className="h-7 w-7 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white border-4 border-black animate-pulse" />
        </motion.button>
      )}

      {/* Floating Command Center */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMaximized ? "600px" : "400px",
              height: isMaximized ? "80vh" : "600px"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 glass-dark rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-50 border border-white/10"
          >
            {/* Spotlight Effect Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-okx-cyan/5 to-okx-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,255,204,0.2)]">
                    <Bot className="h-7 w-7 text-okx-cyan" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2 text-white">
                    SENTRY PRO 1.0
                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-zinc-500">BETA</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-okx-cyan animate-pulse" />
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Nexus Protocol Connected</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 relative z-10">
                <button 
                  onClick={() => clearHistory()}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  title="Clear Conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <Minimize2 className="h-4 w-4 rotate-45" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-50"
                  >
                    <Cpu className="h-10 w-10 text-okx-cyan animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tighter">Initializing Sentry Interface</p>
                      <p className="text-[10px] font-bold text-zinc-500">I am your onchain intelligence layer for X Layer.</p>
                    </div>
                  </motion.div>
                )}
                
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={cn(
                      "flex flex-col gap-3",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "group relative px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[90%] transition-all",
                      msg.role === 'user' 
                        ? "bg-okx-cyan text-black font-black" 
                        : "bg-white/5 border border-white/5 text-zinc-300 hover:border-white/10"
                    )}>
                      {msg.role === 'model' && msg.parts[0].text.includes("HIGH PRICE IMPACT DETECTED") && (
                        <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/5">
                          <Sparkles className="h-3 w-3 text-okx-cyan shrink-0" />
                          <span className="text-[10px] font-black text-okx-cyan uppercase tracking-widest">Strategic Intelligence Report</span>
                        </div>
                      )}
                      <div className={cn(
                        "prose prose-sm break-words",
                        msg.role === 'user' ? "prose-neutral text-black" : "prose-invert"
                      )}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.parts[0].text.replace(/SWAP_PROPOSAL:\s*{.*?}/, "")}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Meta info on hover */}
                      <div className={cn(
                        "absolute top-full mt-1 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity",
                        msg.role === 'user' ? "right-0 text-okx-cyan/50" : "left-0 text-zinc-600"
                      )}>
                        {msg.role === 'user' ? 'Transmission Sent' : 'System Response'}
                      </div>
                    </div>
                    
                    {msg.type === 'swap_proposal' && msg.data && (
                      <ProposedTradeCard 
                        data={msg.data} 
                        onAction={() => {
                          localStorage.setItem('pending_swap', JSON.stringify(msg.data));
                          router.push('/swap');
                        }} 
                      />
                    )}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex flex-col gap-3 items-start">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 animate-pulse">
                      <div className="flex gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-okx-cyan animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-okx-cyan animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-okx-cyan animate-bounce" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Decoding Stream</span>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Overlay */}
            <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/5">
              {!address ? (
                <div className="flex items-center justify-center p-3 rounded-2xl bg-okx-cyan/10 border border-okx-cyan/20">
                  <p className="text-[10px] font-black text-okx-cyan uppercase tracking-widest">Connect Wallet to Interface with Sentry</p>
                </div>
              ) : (
                <div className="relative group/input">
                  <div className="absolute -inset-1 bg-gradient-to-r from-okx-cyan/20 to-okx-purple/20 rounded-[1.25rem] blur opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-2">
                    <div className="absolute left-4 text-zinc-500">
                      <Command className="h-4 w-4" />
                    </div>
                    <textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Enter command..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-sm font-medium focus:outline-none focus:border-okx-cyan/40 focus:bg-white/10 transition-all resize-none placeholder:text-zinc-600"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center disabled:opacity-20 hover:bg-okx-cyan hover:text-black hover:border-okx-cyan transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-okx-cyan" />
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Gemini 1.5 Flash</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-zinc-800" />
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Latency: 24ms</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProposedTradeCard({ data, onAction }: { data: any, onAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full spotlight-card bg-white/5 border border-white/10 rounded-3xl p-5 overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-okx-cyan/20 flex items-center justify-center border border-okx-cyan/20">
            <Zap className="h-4 w-4 text-okx-cyan" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none block">Trade Proposal</span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Smart Execution</span>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-okx-cyan animate-ping" />
      </div>
      
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-6">
        <div className="space-y-1">
          <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Exchange</span>
          <div className="text-xl font-black italic tracking-tighter truncate">{data.amount} <span className="text-zinc-500">{data.from}</span></div>
        </div>
        
        <div className="p-2 rounded-full bg-white/5 border border-white/10">
          <ArrowRight className="h-4 w-4 text-okx-cyan" />
        </div>
        
        <div className="space-y-1 text-right">
          <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Receive</span>
          <div className="text-xl font-black italic tracking-tighter text-white truncate">{data.to}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col">
          <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Est. APY Boost</span>
          <span className="text-lg font-black text-okx-cyan">+{data.apy}%</span>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col">
          <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Route Accuracy</span>
          <span className="text-lg font-black text-white">99.8%</span>
        </div>
      </div>

      <button
        onClick={onAction}
        className="w-full py-4 bg-okx-cyan text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,255,204,0.3)]"
      >
        Execute in Swap Hub
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
