
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowRight,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useDashboardStore, IntegrationActivity, ContentItem } from "@/hooks/use-dashboard-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS = {
  linkedin: Linkedin,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  reddit: Search
};

const PLATFORM_COLORS = {
  linkedin: "bg-[#0A66C2]",
  x: "bg-black",
  instagram: "bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400",
  youtube: "bg-[#FF0000]",
  reddit: "bg-[#FF4500]"
};

function ActivityCard({ activity }: { activity: IntegrationActivity }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl group cursor-pointer hover:bg-zinc-900 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-amber-500/20 bg-amber-500/5 text-amber-500">
          {activity.integration}
        </Badge>
        <span className="text-[9px] text-zinc-500 font-mono">{formatDistanceToNow(activity.timestamp)} ago</span>
      </div>
      <h4 className="text-sm font-semibold text-zinc-200 mb-1">{activity.status.toUpperCase()}: {activity.title}</h4>
      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter mb-4">Skippy indexed 45 new context markers</p>
      <Button variant="ghost" size="sm" className="w-full text-[10px] h-8 bg-white/5 hover:bg-white/10 group-hover:bg-amber-500 group-hover:text-black transition-all">
        Review Content <ArrowRight className="w-3 h-3 ml-2" />
      </Button>
    </motion.div>
  );
}

function ContentQueueCard({ item }: { item: ContentItem }) {
  const Icon = PLATFORM_ICONS[item.platform];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-4 bg-zinc-900/50 border border-white/5 rounded-xl relative overflow-hidden",
        item.status === 'draft' && "border-l-4 border-l-amber-500/50",
        item.status === 'approved' && "border-l-4 border-l-green-500/50"
      )}
    >
      {item.status === 'draft' && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-y-0 left-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
        />
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-1.5 rounded-md", PLATFORM_COLORS[item.platform])}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.type}</span>
        <Badge className={cn(
          "ml-auto text-[8px] uppercase tracking-tighter",
          item.status === 'published' ? "bg-zinc-800 text-zinc-400" : "bg-white text-black"
        )}>
          {item.status}
        </Badge>
      </div>

      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-4 italic leading-relaxed">
        "{item.body}"
      </p>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 bg-transparent border-white/10 hover:bg-white/5">View</Button>
        {item.status === 'draft' && (
          <Button size="sm" className="flex-1 text-[10px] h-8 bg-amber-500 text-black font-bold hover:bg-amber-400">Approve</Button>
        )}
        {item.status === 'published' && (
          <Button variant="ghost" size="sm" className="flex-1 text-[10px] h-8 bg-green-500/10 text-green-500 hover:bg-green-500/20">Analytics</Button>
        )}
      </div>
    </motion.div>
  );
}

export default function CommandCenter() {
  const { integrationActivities, contentQueue } = useDashboardStore();

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-tighter">Command <span className="text-amber-500">Center</span></h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Autonomous Edge Intelligence Interface</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-2 border-green-500/20 bg-green-500/5 text-green-500 font-mono text-[10px]">
            <CheckCircle2 className="w-3 h-3 mr-2" />
            ZERO TRUST ACTIVE
          </Badge>
          <Badge variant="outline" className="px-4 py-2 border-amber-500/20 bg-amber-500/5 text-amber-500 font-mono text-[10px]">
            <Zap className="w-3 h-3 mr-2 animate-pulse" />
            SKIPPY SYNCED
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Integration Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-white">Integration <span className="text-zinc-500">Activity</span></h3>
            <Button variant="link" className="text-[10px] uppercase text-amber-500 p-0">Configure Sync</Button>
          </div>
          <div className="space-y-4">
            {integrationActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>

        {/* Right: Content Queue */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-white">Content <span className="text-zinc-500">Queue</span></h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[8px] bg-zinc-900 border-white/5">DRAFTS ({contentQueue.filter(i => i.status === 'draft').length})</Badge>
              <Badge variant="outline" className="text-[8px] bg-zinc-900 border-white/5">READY ({contentQueue.filter(i => i.status === 'approved').length})</Badge>
            </div>
          </div>
          <div className="space-y-3">
            {contentQueue.map(item => (
              <ContentQueueCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
