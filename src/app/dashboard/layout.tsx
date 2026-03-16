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
  Loader2,
  Sparkles,
  Send
} from "lucide-react";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { skippyProvideContextualAssistance } from "@/ai/flows/skippy-provide-contextual-assistance";
import { skippyChat } from "@/ai/flows/skippy-chat-interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { label: "Skippy", href: "/dashboard/skippy", icon: Eye },
  { label: "Flippo", href: "/dashboard/flippo", icon: Clock },
  { label: "Snooks", href: "/dashboard/snooks", icon: MessageSquare },
  { label: "AI Tuning", href: "/dashboard/tuning", icon: Settings2 },
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

  // Global Skippy State
  const { 
    skippyActive, 
    skippyStuck, 
    setSkippyStuck, 
    assistanceMsg, 
    setAssistanceMsg, 
    showGlobalChat, 
    setShowGlobalChat 
  } = useDashboardStore();

  const [isThinking, setIsThinking] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMsg[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Session Protection Redirect
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  // Background Observation Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (skippyActive && user) {
      timer = setInterval(async () => {
        setIsThinking(true);
        try {
          const result = await skippyProvideContextualAssistance({
            currentActivityContext: `User is currently viewing: ${pathname}`,
            recentActionsSummary: "Navigating between agent nodes",
            timeSinceLastMeaningfulInteractionSeconds: 75
          });
          
          if (result.assistanceMessage.includes("?")) {
            setAssistanceMsg(result.assistanceMessage);
            setSkippyStuck(true);
          }
        } catch (e) {
          console.error("Skippy Logic Error:", e);
        } finally {
          setIsThinking(false);
        }
      }, 45000); 
    } else {
      setSkippyStuck(false);
      setShowGlobalChat(false);
    }
    return () => clearInterval(timer);
  }, [skippyActive, pathname, user, setSkippyStuck, setAssistanceMsg, setShowGlobalChat]);

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
      console.error("Skippy Chat Error:", e);
      setLocalMessages(prev => [...prev, { role: 'bot', content: "Bleep bloop... brain glitch. Try again!" }]);
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-black/5 border-t-black rounded-full animate-spin" />
          <p className="text-[8px] font-pixel text-black/20 uppercase tracking-widest">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden text-black font-pixel selection:bg-black/5 bg-white">
      <CustomCursor name={user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User"} />
      
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className="relative h-full glass border-r border-white/40 flex flex-col shrink-0 z-50 m-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
      >
        <div className="p-8 flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-[8px] font-bold tracking-tighter text-black uppercase">Studio</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-black/5 rounded-2xl transition-colors mx-auto"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-5 rounded-3xl text-sm font-medium transition-all duration-300 group relative",
                  isActive 
                    ? "bg-black text-white shadow-2xl scale-[1.02]" 
                    : "text-black/40 hover:bg-white/60 hover:text-black"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-black/40 group-hover:text-black")} />
                {!isCollapsed && <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-black/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-5 py-5 text-red-500 hover:bg-red-500/5 rounded-3xl transition-colors group"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-[8px] font-bold uppercase tracking-widest">Exit</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto relative p-4 pl-0">
        <div className="glass h-full rounded-[3rem] overflow-y-auto custom-scrollbar relative border border-white/40 shadow-2xl">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {skippyActive && (
          <>
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-8 right-12 z-[100] flex items-center gap-4 bg-white/80 backdrop-blur-md border-4 border-black px-6 py-3 rounded-full shadow-2xl"
            >
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-500 animate-ping opacity-40" />
              </div>
              <Bot size={20} className="text-black" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Skippy Intelligence</span>
                <span className="text-[5px] text-black/40 uppercase mt-1">Real-time observation active</span>
              </div>
              {isThinking && <Loader2 size={12} className="animate-spin ml-2" />}
            </motion.div>

            {skippyStuck && !showGlobalChat && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed bottom-12 right-12 z-[110] flex flex-col items-end gap-6"
              >
                <div className="bg-black text-white p-8 rounded-[2rem] rounded-br-none shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative border-2 border-white/20 max-w-sm">
                  <div className="absolute -bottom-3 right-0 w-6 h-6 bg-black rotate-45" />
                  <p className="text-[10px] leading-relaxed uppercase tracking-tighter">
                    {assistanceMsg.toUpperCase() || "YO! YOU GOOD? 👀"}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowGlobalChat(true)}
                  className="bg-white text-black hover:bg-gray-100 rounded-3xl shadow-2xl px-10 h-14 font-bold text-[8px] uppercase border-2 border-black"
                >
                  Start Debug Session
                </Button>
              </motion.div>
            )}

            {showGlobalChat && (
              <motion.div
                initial={{ x: 500 }}
                animate={{ x: 0 }}
                exit={{ x: 500 }}
                className="fixed inset-y-6 right-6 w-[400px] glass rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] z-[120] flex flex-col overflow-hidden border border-white/60"
              >
                <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Skippy Guide</span>
                  </div>
                  <button onClick={() => setShowGlobalChat(false)} className="text-black/40 hover:text-black text-xl">×</button>
                </div>
                
                <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-white/20 custom-scrollbar">
                  <div className="bg-black text-white p-6 rounded-3xl rounded-tl-none text-[8px] leading-loose uppercase tracking-tight shadow-xl">
                    {assistanceMsg || "I see you're working through the system. Need a hand with the current view?"}
                  </div>

                  {localMessages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-4",
                      msg.role === 'user' ? "flex-row-reverse" : ""
                    )}>
                      <div className={cn(
                        "p-4 rounded-2xl text-[8px] leading-loose uppercase tracking-tight shadow-md",
                        msg.role === 'user' ? "bg-black text-white rounded-tr-none" : "bg-white text-black border-2 border-black rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {isSending && (
                    <div className="flex justify-center">
                      <Loader2 className="animate-spin text-black/20" size={16} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-4 bg-amber-500/10 border-2 border-amber-500 rounded-2xl">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="text-[6px] font-bold uppercase text-amber-500">Local context sync active</span>
                  </div>
                </div>

                <div className="p-8 bg-white/60 border-t border-black/5">
                  <div className="relative">
                    <Input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSkippyChat()}
                      disabled={isSending}
                      className="pr-16 h-16 rounded-[2rem] bg-white border-2 border-black/10 focus:border-black text-[8px] uppercase font-bold" 
                      placeholder="Ask Skippy..." 
                    />
                    <button 
                      onClick={handleSkippyChat}
                      disabled={isSending || !chatInput.trim()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black text-white rounded-2xl disabled:opacity-50"
                    >
                      <Send size={18} />
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
