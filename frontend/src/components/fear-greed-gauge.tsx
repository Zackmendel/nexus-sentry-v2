"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface FearGreedGaugeProps {
  value: number;
}

export function FearGreedGauge({ value }: FearGreedGaugeProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  // Needle rotation: 0% is left (-90deg), 100% is right (90deg)
  const rotation = (percentage / 100) * 180 - 90;

  const status = useMemo(() => {
    if (value >= 75) return { label: "Extreme Greed", color: "#22c55e" };
    if (value >= 55) return { label: "Greed", color: "#4ade80" };
    if (value >= 45) return { label: "Neutral", color: "#eab308" };
    if (value >= 25) return { label: "Fear", color: "#ef4444" };
    return { label: "Extreme Fear", color: "#b91c1c" };
  }, [value]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg width="240" height="150" viewBox="0 0 240 150">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" /> 
            <stop offset="25%" stopColor="#ef4444" /> 
            <stop offset="50%" stopColor="#eab308" /> 
            <stop offset="75%" stopColor="#4ade80" /> 
            <stop offset="100%" stopColor="#22c55e" /> 
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Track */}
        <path
          d="M 30 120 A 90 90 0 0 1 210 120"
          fill="none"
          stroke="#18181b"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Color Gradient Track */}
        <path
          d="M 30 120 A 90 90 0 0 1 210 120"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Ticks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickRot = (tick / 100) * 180 - 90;
          return (
            <line
              key={tick}
              x1="120" y1="35" x2="120" y2="45"
              stroke="#27272a"
              strokeWidth="2"
              transform={`rotate(${tickRot} 120 120)`}
            />
          );
        })}

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          style={{ transformOrigin: "120px 120px" }}
        >
          <line
            x1="120" y1="120" x2="120" y2="32"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          />
          <circle cx="120" cy="120" r="6" fill="#18181b" stroke="white" strokeWidth="2" />
        </motion.g>

        {/* Numeric Labels */}
        <text x="30" y="145" fill="#52525b" fontSize="10" fontWeight="extrabold" textAnchor="middle">0</text>
        <text x="120" y="20" fill="#52525b" fontSize="10" fontWeight="extrabold" textAnchor="middle">50</text>
        <text x="210" y="145" fill="#52525b" fontSize="10" fontWeight="extrabold" textAnchor="middle">100</text>
      </svg>
      
      <div className="flex flex-col items-center -mt-4">
        <span className="text-5xl font-black text-white tracking-tighter text-glow mb-1">{value}</span>
        <span 
           className="text-[10px] font-black tracking-[0.3em] uppercase py-1 px-3 rounded-full border border-white/5 bg-white/5" 
           style={{ color: status.color, borderColor: `${status.color}20` }}
        >
          {status.label}
        </span>
      </div>
    </div>
  );
}
