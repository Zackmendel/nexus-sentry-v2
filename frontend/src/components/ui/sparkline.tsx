"use client";

import { useState, useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = "#00ffcc" }: SparklineProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0 || !mounted) {
    return <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg" />;
  }

  const chartData = data.map((val, i) => ({ value: val, index: i }));
  const min = Math.min(...data);
  const max = Math.max(...data);

  return (
    <div className="h-10 w-24 relative overflow-hidden">
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="99%" height="99%">
          <LineChart data={chartData}>
            <YAxis domain={[min, max]} hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
