"use client";

import React, { useState, useEffect } from "react";
import { 
  Github, FileText, Layout, 
  CheckCircle2, Loader2, Link2, 
  X, RefreshCw, AlertCircle, 
  ExternalLink, Globe, Smartphone, Sparkles,
  Search, SlidersHorizontal, Settings2, Trash2, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const INTEGRATIONS = [
  { id: "github", label: "GitHub", icon: Github, desc: "Your commits and shipped features.", color: "bg-slate-900" },
  { id: "notion", label: "Notion", icon: FileText, desc: "Pages and docs you update.", color: "bg-white border-slate-200" },
  { id: "figma", label: "Figma", icon: Layout, desc: "Files and designs you edit.", color: "bg-purple-600" },
  { id: "google", label: "Google", icon: Globe, desc: "Drive files and Calendar events.", color: "bg-red-500" },
  { id: "twitter", label: "X / Twitter", icon: Link2, desc: "Your social engagement.", color: "bg-blue-400" },
  { id: "linkedin", label: "LinkedIn", icon: Link2, desc: "Your professional growth.", color: "bg-blue-600" },
];

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      const { data } = await api.get("/api/integrations/");
      setIntegrations(data);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load integrations", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    
    // Listen for OAuth messages from popup for reconnects
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.success) {
        fetchIntegrations();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSyncNow = async (platform: string) => {
    setSyncingId(platform);
    try {
      // POST /api/integrations/{platform}/sync-now endpoint placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));
      fetchIntegrations();
      setSyncingId(null);
    } catch (e) {
      console.error(`Failed to sync ${platform}`, e);
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    try {
      await api.delete(`/api/integrations/${platform}`);
      fetchIntegrations();
    } catch (e) {
      console.error(`Failed to disconnect ${platform}`, e);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      const { data } = await api.get(`/api/integrations/connect/${platform}`);
      window.open(data.url, 'oauth', 'width=600,height=700,scrollbars=yes');
    } catch (e) {
      console.error(`Failed to connect ${platform}`, e);
    }
  };

  return (
    <div className="flex-1 space-y-10 p-10 bg-[#fdfbf7] min-h-screen pb-40 relative">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Connected Apps</h1>
        <p className="text-sm text-slate-500 font-medium">Manage how CozyJet listens to your work and creates content seeds.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {INTEGRATIONS.map((platform) => {
          const status = integrations.find(i => i.platform === platform.id);
          const isConnected = status?.status === "connected";
          const isSyncing = syncingId === platform.id;

          return (
            <motion.div 
              key={platform.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden"
            >
              {/* Platform Logo */}
              <div className={cn(
                 "w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                 platform.color
              )}>
                 <platform.icon size={32} className={platform.id === "notion" ? "text-slate-900" : ""} />
              </div>

              {/* Main Detail */}
              <div className="flex-1 space-y-1 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <h3 className="font-bold text-xl text-slate-900">{platform.label}</h3>
                    {isConnected ? (
                       <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Active</span>
                    ) : (
                       <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200">Inactive</span>
                    )}
                 </div>
                 {isConnected ? (
                    <p className="text-sm text-slate-400 font-medium">Connected as <strong className="text-indigo-600">@{status.username}</strong></p>
                 ) : (
                    <p className="text-sm text-slate-400 font-medium">{platform.desc}</p>
                 )}
              </div>

              {/* Last Sync Info */}
              {isConnected && (
                 <div className="flex flex-col text-center md:text-right gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">Last Synced</span>
                    <span className="text-xs font-bold text-slate-600">{status.last_synced ? new Date(status.last_synced).toLocaleString() : "Syncing now..."}</span>
                 </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                 {isConnected ? (
                    <>
                       <Button 
                         variant="outline" 
                         onClick={() => handleSyncNow(platform.id)}
                         disabled={isSyncing}
                         className="h-12 px-6 rounded-2xl border-slate-100 bg-slate-50 text-xs font-bold font-sans hover:bg-white transition-all shadow-sm"
                       >
                          {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <> <RefreshCw size={14} className="mr-2" /> Sync Now </>}
                       </Button>
                       <Button 
                         variant="ghost" 
                         onClick={() => handleDisconnect(platform.id)}
                         className="h-12 px-5 rounded-2xl hover:text-red-500 hover:bg-red-50 text-slate-400 transition-all"
                       >
                          <Trash2 size={18} />
                       </Button>
                    </>
                 ) : (
                    <Button 
                      onClick={() => handleConnect(platform.id)}
                      className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-widest uppercase shadow-xl shadow-indigo-500/10"
                    >
                       CONNECT
                    </Button>
                 )}
              </div>

              {/* Error Banner */}
              {isConnected && status.error && (
                 <div className="absolute bottom-0 inset-x-0 bg-amber-50 border-t border-amber-100 py-2 px-10 flex items-center justify-between group-hover:visible visible">
                    <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
                       <AlertCircle size={12} /> Last sync had an issue — click to reconnect
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleConnect(platform.id)} className="text-[10px] h-6 px-3 bg-white border border-amber-100 text-amber-600 font-bold tracking-widest uppercase hover:bg-amber-100">Reconnect</Button>
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Browser Extension Banner */}
      <div className="p-10 rounded-[3rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-600/30 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 blur-3xl opacity-20" />
         <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-headline font-bold tracking-tight">Connect tools without an API</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed">
              Use our Chrome Extension to send work directly from Jira, Slack, or any browser tab into your Skippy Feed.
            </p>
         </div>
         <Button className="shrink-0 h-14 px-10 rounded-2xl bg-white text-indigo-600 font-bold text-xs tracking-widest uppercase shadow-xl hover:bg-indigo-50 relative z-10">
            INSTALL EXTENSION
         </Button>
      </div>
    </div>
  );
}
