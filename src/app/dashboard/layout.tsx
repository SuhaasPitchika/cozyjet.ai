"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  { label: "Observer", href: "/dashboard/skippy", icon: Eye, desc: "Skippy", color: "#3b82f6" },
  { label: "Timeline", href: "/dashboard/flippo", icon: BarChart2, desc: "Flippo", color: "#8b5cf6" },
  { label: "Marketing", href: "/dashboard/snooks", icon: Sparkles, desc: "Snooks", color: "#ec4899" },
  { label: "Tuning", href: "/dashboard/tuning", icon: SlidersHorizontal, desc: "Studio", color: "#10b981" },
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
    <div className="flex h-screen w-full overflow-hidden bg-[#f0f4f8] text-gray-900">
      <aside
        className="w-[64px] shrink-0 flex flex-col z-40 items-center py-4 gap-1"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "2px 0 16px rgba(0,0,0,0.04)",
        }}
      >
        <Link href="/" className="mb-4 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
            <Image src="/cozyjet-logo.png" alt="CozyJet" width={36} height={36} className="object-contain" />
          </div>
        </Link>

        <nav className="flex flex-col gap-1.5 flex-1 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} title={item.label}>
                <div
                  className={cn(
                    "w-full h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative group",
                    isActive ? "shadow-sm" : "hover:bg-black/5"
                  )}
                  style={isActive ? { background: `${item.color}15`, boxShadow: `0 0 0 1.5px ${item.color}40` } : {}}
                >
                  <item.icon
                    size={17}
                    style={{ color: isActive ? item.color : "rgba(0,0,0,0.35)" }}
                  />
                  <div className="absolute left-full ml-2.5 bg-gray-800 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1.5 w-full px-2">
          <button
            onClick={() => setShowGlobalChat(!showGlobalChat)}
            title="Skippy Chat"
            className={cn(
              "w-full h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              showGlobalChat ? "bg-blue-50 shadow-sm" : "hover:bg-black/5"
            )}
            style={showGlobalChat ? { boxShadow: "0 0 0 1.5px rgba(59,130,246,0.4)" } : {}}
          >
            <Bot size={17} style={{ color: showGlobalChat ? "#3b82f6" : "rgba(0,0,0,0.35)" }} />
          </button>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="w-full h-10 rounded-xl flex items-center justify-center hover:bg-red-50 transition-all duration-200 group"
          >
            <LogOut size={16} className="text-black/25 group-hover:text-red-400 transition-colors" />
          </button>

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mt-1"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 2px 8px rgba(59,130,246,0.25)" }}
          >
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-12 shrink-0 flex items-center justify-between px-6"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-2.5">
            {activeItem && (
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: `${activeItem.color}15` }}
              >
                <activeItem.icon size={13} style={{ color: activeItem.color }} />
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700">{activeItem?.label ?? "Studio"}</span>
            {activeItem?.desc && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{activeItem.desc}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
            <span className="text-[10px] text-gray-400 font-medium">Live</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <AnimatePresence>
        {showGlobalChat && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[340px] flex flex-col z-50"
            style={{
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              borderLeft: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", boxShadow: "0 2px 8px rgba(59,130,246,0.25)" }}
                >
                  <Bot size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Skippy</div>
                  <div className="text-[10px] text-gray-400">Workspace AI</div>
                </div>
              </div>
              <button
                onClick={() => setShowGlobalChat(false)}
                className="w-7 h-7 rounded-lg hover:bg-black/5 text-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center"
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}
                  >
                    <Bot size={18} className="text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-400 max-w-[180px] leading-relaxed">
                    Ask Skippy anything about your workflow or studio.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed",
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "text-gray-600 rounded-bl-sm"
                    )}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 8px rgba(59,130,246,0.25)" }
                        : { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div
                    className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
                    style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <Loader2 size={11} className="animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-black/[0.05]">
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-300/50 transition-all"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSkippyChat()}
                  disabled={isSending}
                  className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
                  placeholder="Ask for guidance..."
                />
                <button
                  onClick={handleSkippyChat}
                  disabled={isSending || !chatInput.trim()}
                  className="p-1.5 rounded-lg disabled:opacity-30 transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 2px 6px rgba(59,130,246,0.3)" }}
                >
                  <Send size={11} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
