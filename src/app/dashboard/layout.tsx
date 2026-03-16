"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Clock, 
  MessageSquare, 
  Settings2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bot,
  Send,
  X,
  Zap
} from "lucide-react";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { skippyChat } from "@/ai/flows/skippy-chat-interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { label: "Observer", href: "/dashboard/skippy", icon: Eye },
  { label: "Timeline", href: "/dashboard/flippo", icon: Clock },
  { label: "Marketing", href: "/dashboard/snooks", icon: MessageSquare },
  { label: "Tuning", href: "/dashboard/tuning", icon: Settings2 },
];

interface ChatMsg {
  role: 'user' | 'bot';
  content: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const { 
    skippyActive, 
    assistanceMsg, 
    showGlobalChat, 
    setShowGlobalChat 
  } = useDashboardStore();

  const [chatInput, setChatInput] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMsg[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const handleSkippyChat = async () => {
    if (!chatInput.trim() || isSending) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setLocalMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);

    try {
      const result = await skippyChat({
        userMessage: userMsg,
        currentView: pathname,
        observationContext: assistanceMsg || "Active observation in progress."
      });

      setLocalMessages(prev => [...prev, { role: 'bot', content: result.response }]);
    } catch (e) {
      setLocalMessages(prev => [...prev, { role: 'bot', content: "I'm having a brief brain glitch. Try that again?" }]);
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading) return null;
  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fdfaf5] selection:bg-black/5">
      <CustomCursor name={user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User"} />
      
      {/* Sidebar with "Skinish" color theme */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 70 : 240 }}
        className="relative h-full bg-[#f5e6d3] border-r border-black/5 flex flex-col shrink-0 z-50 m-2 rounded-3xl shadow-sm"
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <span className="font-headline text-lg font-bold tracking-tight text-[#8c6b4f]">Studio</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors mx-auto text-[#8c6b4f]"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all group",
                  isActive 
                    ? "bg-[#8c6b4f] text-white shadow-md" 
                    : "text-[#8c6b4f]/60 hover:bg-black/5 hover:text-[#8c6b4f]"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto relative p-2 pl-0">
        <div className="bg-white/80 h-full rounded-3xl overflow-y-auto border border-black/5 shadow-inner">
          {children}
        </div>
      </main>

      {/* Persistent Skippy Symbol (Visible on every screen) */}
      <AnimatePresence>
        {skippyActive && (
          <>
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              onClick={() => setShowGlobalChat(true)}
              className="fixed top-6 right-8 z-[100] flex items-center gap-4 bg-white/90 backdrop-blur-xl border border-black/5 pl-4 pr-5 py-2.5 rounded-full shadow-2xl cursor-pointer group hover:scale-105 transition-all"
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-red-500 blur-sm animate-ping" />
              </div>
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-[#8c6b4f]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8c6b4f]">Skippy Intel active</span>
              </div>
              <Zap size={12} className="text-amber-400 fill-amber-400" />
            </motion.div>

            {showGlobalChat && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                className="fixed inset-y-4 right-4 w-[380px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[120] flex flex-col overflow-hidden border border-black/5"
              >
                <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#fdfaf5]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#8c6b4f] rounded-xl">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#8c6b4f] block">Skippy Guide</span>
                      <span className="text-[8px] uppercase tracking-widest text-[#8c6b4f]/40">Active Observation</span>
                    </div>
                  </div>
                  <button onClick={() => setShowGlobalChat(false)} className="text-[#8c6b4f]/40 hover:text-[#8c6b4f] transition-colors p-2 hover:bg-black/5 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#fdfaf5]/30">
                  <div className="bg-[#8c6b4f] text-white p-5 rounded-[1.5rem] rounded-tl-none text-[11px] leading-relaxed shadow-lg">
                    {assistanceMsg || "I'm monitoring your flow state. If you need a pivot or strategic insight, just ask."}
                  </div>

                  {localMessages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? "flex-row-reverse" : ""
                    )}>
                      <div className={cn(
                        "p-4 rounded-[1.2rem] text-[11px] leading-relaxed shadow-sm max-w-[85%]",
                        msg.role === 'user' ? "bg-white text-black border border-black/5" : "bg-[#f5e6d3] text-[#8c6b4f]"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-white border-t border-black/5">
                  <div className="relative">
                    <Input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSkippyChat()}
                      disabled={isSending}
                      className="pr-12 h-14 rounded-2xl text-xs bg-[#fdfaf5] border-transparent focus:ring-[#8c6b4f]/20 shadow-inner" 
                      placeholder="Ask for strategic guidance..." 
                    />
                    <button 
                      onClick={handleSkippyChat}
                      disabled={isSending || !chatInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#8c6b4f] text-white rounded-xl hover:bg-[#6b523c] disabled:opacity-50 transition-all shadow-md active:scale-95"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}