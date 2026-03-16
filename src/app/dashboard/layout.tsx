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
  Send,
  X
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
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-black/5">
      <CustomCursor name={user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User"} />
      
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 70 : 240 }}
        className="relative h-full glass border-r border-gray-100 flex flex-col shrink-0 z-50 m-2 rounded-2xl"
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <span className="font-headline text-lg font-bold tracking-tight">Studio</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors mx-auto"
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
                  isActive 
                    ? "bg-black text-white" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="text-xs font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-xs font-medium">Exit Studio</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto relative p-2 pl-0">
        <div className="glass h-full rounded-2xl overflow-y-auto border border-gray-100 shadow-sm">
          {children}
        </div>
      </main>

      <AnimatePresence>
        {skippyActive && (
          <>
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={() => setShowGlobalChat(true)}
              className="fixed top-6 right-8 z-[100] flex items-center gap-3 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <Bot size={16} className="text-black" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Skippy Active</span>
            </motion.div>

            {showGlobalChat && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                className="fixed inset-y-4 right-4 w-[360px] glass rounded-2xl shadow-xl z-[120] flex flex-col overflow-hidden border border-gray-100"
              >
                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white/40">
                  <div className="flex items-center gap-3">
                    <Bot size={18} />
                    <span className="text-xs font-bold">Skippy Guide</span>
                  </div>
                  <button onClick={() => setShowGlobalChat(false)} className="text-gray-400 hover:text-black transition-colors">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50/30">
                  <div className="bg-black text-white p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed">
                    {assistanceMsg || "Hey! I'm watching your workflow. Need a hand with this section?"}
                  </div>

                  {localMessages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? "flex-row-reverse" : ""
                    )}>
                      <div className={cn(
                        "p-3 rounded-xl text-xs leading-relaxed",
                        msg.role === 'user' ? "bg-gray-100 text-black" : "bg-white border border-gray-100 text-black"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-white border-t border-gray-50">
                  <div className="relative">
                    <Input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSkippyChat()}
                      disabled={isSending}
                      className="pr-12 h-11 rounded-xl text-xs" 
                      placeholder="Ask Skippy..." 
                    />
                    <button 
                      onClick={handleSkippyChat}
                      disabled={isSending || !chatInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      <Send size={14} />
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