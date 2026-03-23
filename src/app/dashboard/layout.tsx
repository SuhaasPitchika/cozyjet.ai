"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  BarChart2,
  Sparkles,
  SlidersHorizontal,
  LogOut,
  Bot,
  Send,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { skippyChatClient } from "@/ai/client";

const NAV_ITEMS = [
  { label: "Observer", href: "/dashboard/skippy", icon: Eye },
  { label: "Timeline", href: "/dashboard/flippo", icon: BarChart2 },
  { label: "Marketing", href: "/dashboard/snooks", icon: Sparkles },
  { label: "Tuning", href: "/dashboard/tuning", icon: SlidersHorizontal },
];

interface ChatMsg {
  role: "user" | "bot";
  content: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { assistanceMsg, showGlobalChat, setShowGlobalChat } = useDashboardStore();

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/auth");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const handleSkippyChat = async () => {
    if (!chatInput.trim() || isSending) return;
    const userMsg = chatInput;
    setChatInput("");
    setMessages((p) => [...p, { role: "user", content: userMsg }]);
    setIsSending(true);
    try {
      const result = await skippyChatClient({
        userMessage: userMsg,
        currentView: pathname,
        observationContext: assistanceMsg || "Active observation in progress.",
      });
      setMessages((p) => [...p, { role: "bot", content: result.response }]);
    } catch {
      setMessages((p) => [...p, { role: "bot", content: "I'm having a brief brain glitch. Try again?" }]);
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading || !user) return null;

  const activeLabel = NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Studio";
  const initials = (user.displayName || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0f0f] text-white">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-white/5 bg-[#141414] z-40">
        <div className="px-5 py-5 border-b border-white/5">
          <span className="text-sm font-bold tracking-tight text-white">CozyJet</span>
          <span className="text-sm font-bold tracking-tight text-white/30">.ai</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-white text-black font-medium"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
          <button
            onClick={() => setShowGlobalChat(!showGlobalChat)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <Bot size={15} />
            <span>Skippy Chat</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>

        <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white/70 truncate">
              {user.displayName || user.email?.split("@")[0]}
            </div>
            <div className="text-[10px] text-white/30 truncate">{user.email}</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-[#141414]">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>Studio</span>
            <ChevronRight size={12} />
            <span className="text-white/80">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-white/30">Live</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Skippy Chat Panel */}
      <AnimatePresence>
        {showGlobalChat && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-[#141414] border-l border-white/5 flex flex-col z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot size={14} className="text-white/60" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Skippy</div>
                  <div className="text-[10px] text-white/30">Workspace Intelligence</div>
                </div>
              </div>
              <button
                onClick={() => setShowGlobalChat(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Bot size={18} className="text-white/20" />
                  </div>
                  <p className="text-xs text-white/20 max-w-[200px] leading-relaxed">
                    Ask Skippy anything about your workflow or the studio.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-white text-black rounded-br-sm"
                        : "bg-white/5 text-white/70 rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white/5">
                    <Loader2 size={12} className="animate-spin text-white/30" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 focus-within:ring-1 focus-within:ring-white/10 transition-all">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSkippyChat()}
                  disabled={isSending}
                  className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
                  placeholder="Ask for guidance..."
                />
                <button
                  onClick={handleSkippyChat}
                  disabled={isSending || !chatInput.trim()}
                  className="p-1.5 rounded-lg bg-white text-black disabled:opacity-20 hover:bg-white/90 transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
