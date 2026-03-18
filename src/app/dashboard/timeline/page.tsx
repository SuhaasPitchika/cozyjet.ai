
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Target, TrendingUp } from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

export default function TimelinePage() {
  const { integrationActivities } = useDashboardStore();
  const score = 84;

  const timelineData = useMemo(() => {
    return integrationActivities.map((a: { id: string; name: string; timestamp: number; status: string }, i: number) => ({
      ...a,
      x: 100 + i * 250,
      y: 200 + Math.sin(i) * 40
    }));
  }, [integrationActivities]);

  const path = useMemo(() => {
    if (timelineData.length < 2) return "";
    let d = `M ${timelineData[0].x} ${timelineData[0].y}`;
    for (let i = 0; i < timelineData.length - 1; i++) {
      const curr = timelineData[i];
      const next = timelineData[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      d += ` C ${cp1x} ${curr.y}, ${cp1x} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [timelineData]);

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-tighter text-white">Project <span className="text-amber-500">Timeline</span></h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Causal Linkage of Integration Activity</p>
        </div>
        
        {/* Deep Work Gauge */}
        <div className="relative w-40 h-40 flex items-center justify-center group cursor-help">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
            <motion.circle
              cx="80" cy="80" r="70"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6B7280" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white group-hover:scale-110 transition-transform">{score}</span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Focus Score</span>
          </div>
        </div>
      </div>

      {/* SVG Timeline */}
      <div className="w-full h-[400px] bg-zinc-950/50 rounded-3xl border border-white/5 relative overflow-x-auto overflow-y-hidden custom-scrollbar">
        <svg width={timelineData.length * 250 + 200} height="400" className="absolute top-0 left-0">
          <motion.path
            d={path}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
            className="opacity-20"
          />
          {timelineData.map((node: { id: string; x: number; y: number; name: string; timestamp: number; status: string }, i: number) => (
            <g key={node.id}>
              <motion.circle
                cx={node.x} cy={node.y} r="8"
                fill="#111116"
                stroke="#f59e0b"
                strokeWidth="2"
                whileHover={{ scale: 1.5, fill: "#f59e0b" }}
                className="cursor-pointer transition-colors"
              />
              <text x={node.x} y={node.y - 25} textAnchor="middle" className="fill-zinc-400 text-[10px] font-bold uppercase tracking-tighter">
                {(node.name || 'Activity').length > 20 ? (node.name || 'Activity').slice(0, 20) + "..." : (node.name || 'Activity')}
              </text>
              <text x={node.x} y={node.y + 35} textAnchor="middle" className="fill-zinc-600 text-[8px] font-mono">
                {new Date(node.timestamp).toLocaleDateString()}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Trophy className="w-3 h-3 text-amber-500" />
              Peak Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">4.2x</div>
            <p className="text-[10px] text-green-500 uppercase mt-1">Above baseline engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Target className="w-3 h-3 text-amber-500" />
              Project Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12</div>
            <p className="text-[10px] text-zinc-500 uppercase mt-1">Assets generated this week</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              Reach Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">+15%</div>
            <p className="text-[10px] text-zinc-500 uppercase mt-1">Projected network growth</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
