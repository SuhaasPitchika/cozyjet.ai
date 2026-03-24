"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, BarChart2, Sparkles, SlidersHorizontal,
  LogOut, Bot, Send, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { skippyChatClient } from "@/ai/client";

const NAV_ITEMS = [
  { label: "Observer", href: "/dashboard/skippy", icon: Eye, desc: "Skippy" },
  { label: "Timeline", href: "/dashboard/flippo", icon: BarChart2, desc: "Flippo" },
  { label: "Marketing", href: "/dashboard/snooks", icon: Sparkles, desc: "Snooks" },
  { label: "Tuning", href: "/dashboard/tuning", icon: SlidersHorizontal, desc: "Studio" },
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
    try { await signOut(auth); router.push("/auth"); } catch (e) { console.error(e); }
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
      setMessages((p) => [...p, { role: "bot", content: "Brief glitch. Try again?" }]);
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading || !user) return null;

  const activeItem = NAV_ITEMS.find((n) => n.href === pathname);
  const initials = (user.displayName || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0d0d0d] text-white">
      {/* Sidebar */}
      <aside className="w-[56px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#111] z-40 items-center py-4 gap-1">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mb-4 shrink-0">
          <span className="text-black font-bold text-[11px] tracking-tight">CJ</span>
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={item.label}>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/30 hover:text-white hover:bg-white/8"
                  )}
                >
                  <item.icon size={16} />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setShowGlobalChat(!showGlobalChat)}
            title="Skippy Chat"
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              showGlobalChat ? "bg-white/10 text-white" : "text-white/30 hover:text-white hover:bg-white/8"
            )}
          >
            <Bot size={16} />
          </button>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all"
          >
            <LogOut size={15} />
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/6 flex items-center justify-center mt-1">
            <span className="text-[10px] font-bold text-white/50">{initials}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-11 shrink-0 flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#111]">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="text-white/60 font-medium">{activeItem?.label ?? "Studio"}</span>
            {activeItem?.desc && (
              <>
                <span className="text-white/15">·</span>
                <span>{activeItem.desc}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-white/25">Live</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Skippy Chat Panel */}
      <AnimatePresence>
        {showGlobalChat && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[340px] bg-[#111] border-l border-white/[0.06] flex flex-col z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white/8 flex items-center justify-center">
                  <Bot size={13} className="text-white/50" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Skippy</div>
                  <div className="text-[10px] text-white/25">Workspace AI</div>
                </div>
              </div>
              <button
                onClick={() => setShowGlobalChat(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/8 text-white/25 hover:text-white transition-colors flex items-center justify-center"
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Bot size={17} className="text-white/15" />
                  </div>
                  <p className="text-xs text-white/20 max-w-[180px] leading-relaxed">
                    Ask Skippy anything about your workflow or studio.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-white text-black rounded-br-sm"
                      : "bg-white/[0.05] text-white/65 rounded-bl-sm border border-white/5"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white/5 border border-white/5">
                    <Loader2 size={11} className="animate-spin text-white/25" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 bg-white/[0.05] rounded-xl px-4 py-2.5 focus-within:ring-1 focus-within:ring-white/10 transition-all border border-white/5">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSkippyChat()}
                  disabled={isSending}
                  className="flex-1 bg-transparent text-xs text-white/75 placeholder:text-white/20 outline-none"
                  placeholder="Ask for guidance..."
                />
                <button
                  onClick={handleSkippyChat}
                  disabled={isSending || !chatInput.trim()}
                  className="p-1.5 rounded-lg bg-white text-black disabled:opacity-20 hover:bg-white/90 transition-colors"
                >
                  <Send size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
