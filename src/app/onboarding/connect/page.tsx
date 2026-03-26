"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Github, FileText, Layout, 
  CheckCircle2, Loader2, Link2, 
  ArrowRight, Sparkles, SlidersHorizontal, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api"; // Axios instance with auth interceptors

const INTEGRATIONS = [
  { id: "github", label: "GitHub", icon: Github, desc: "Your commits and shipped features.", color: "bg-slate-900" },
  { id: "notion", label: "Notion", icon: FileText, desc: "Pages and docs you update.", color: "bg-white border-slate-200" },
  { id: "figma", label: "Figma", icon: Layout, desc: "Files and designs you edit.", color: "bg-purple-600" },
  { id: "google", label: "Google", icon: Globe, desc: "Drive files and Calendar events.", color: "bg-red-500" },
  { id: "twitter", label: "X / Twitter", icon: Link2, desc: "Your social engagement.", color: "bg-blue-400" },
  { id: "linkedin", label: "LinkedIn", icon: Link2, desc: "Your professional growth.", color: "bg-blue-600" },
];

export default function OnboardingConnectPage() {
  const router = useRouter();
  const [connected, setConnected] = useState<string[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Poll current integrations status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get("/api/integrations/");
        const active = data.filter((i: any) => i.status === "connected").map((i: any) => i.platform);
        setConnected(active);
      } catch (e) {
        console.error("Failed to load integrations", e);
      }
    };
    fetchStatus();

    // Listen for OAuth messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.success && event.data?.platform) {
        setConnected(prev => [...prev, event.data.platform]);
        setConnectingId(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = async (platform: string) => {
    setConnectingId(platform);
    try {
      const { data } = await api.get(`/api/integrations/connect/${platform}`);
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      window.open(
        data.url, 
        'oauth', 
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );
    } catch (e) {
      console.error(`Failed to connect ${platform}`, e);
      setConnectingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Dots */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] h-full w-full">
           {Array.from({ length: 400 }).map((_, i) => (
             <div key={i} className="w-1 h-1 rounded-full bg-slate-400 m-auto" />
           ))}
        </div>
      </div>

      <div className="max-w-4xl w-full text-center space-y-8 relative z-10 py-20 pb-40">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">
            <Sparkles size={12} /> Step 2: Intelligence Setup
          </div>
          <h1 className="text-4xl lg:text-5xl font-headline font-bold text-slate-900 tracking-tight">Connect your tools</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">CozyJet silently monitors these for content seeds. No more screen-watching required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {INTEGRATIONS.map((platform) => {
             const isConnected = connected.includes(platform.id);
             const isConnecting = connectingId === platform.id;

             return (
               <motion.div 
                 key={platform.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className={cn(
                   "p-8 rounded-[2.5rem] border transition-all flex flex-col gap-6 group relative overflow-hidden",
                   isConnected 
                     ? "bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-500/10" 
                     : "bg-white border-slate-100 shadow-2xl shadow-slate-200/50 hover:border-indigo-200 hover:shadow-indigo-500/10"
                 )}
               >
                 {/* platform logo */}
                 <div className={cn(
                   "w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                   platform.color
                 )}>
                    <platform.icon size={28} className={platform.id === "notion" ? "text-slate-900" : ""} />
                 </div>

                 <div className="text-left space-y-1">
                    <h3 className="font-bold text-lg text-slate-900">{platform.label}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{platform.desc}</p>
                 </div>

                 <div className="mt-auto">
                    {isConnected ? (
                      <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 py-3 uppercase tracking-widest bg-white border border-emerald-100 rounded-2xl justify-center">
                         <CheckCircle2 size={16} /> Connected
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting}
                        className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-widest uppercase"
                      >
                         {isConnecting ? <Loader2 className="animate-spin" size={16} /> : "CONNECT"}
                      </Button>
                    )}
                 </div>

                 {isConnected && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute top-4 right-4 text-emerald-500"
                    >
                       <CheckCircle2 size={24} />
                    </motion.div>
                 )}
               </motion.div>
             );
           })}
        </div>

        <div className="pt-20">
           <Button 
             onClick={() => router.push("/dashboard")}
             className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-widest uppercase flex items-center gap-4 group"
           >
              Continue to Dashboard 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </Button>
           <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors" onClick={() => router.push("/dashboard")}>
              Skip For Now
           </p>
        </div>
      </div>
    </div>
  );
}
