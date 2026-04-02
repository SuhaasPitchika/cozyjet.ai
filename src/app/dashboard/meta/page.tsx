"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Paperclip, ArrowUp, Loader2, Volume2, VolumeX, Plus, MessageSquare, Trash2 } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  name: string;
  createdAt: string;
  messages: ChatMsg[];
}

const SESSIONS_KEY = "meta_sessions";

function generateSessionName(firstMsg: string): string {
  const lower = firstMsg.toLowerCase();
  const platforms: Record<string, string> = {
    linkedin: "💼", twitter: "🐦", instagram: "📸", threads: "🧵",
    reddit: "🔴", email: "📧", tiktok: "🎵", youtube: "▶️", facebook: "📘",
  };
  const types: Record<string, string> = {
    thread: "Thread", post: "Post", story: "Story", carousel: "Carousel",
    caption: "Caption", bio: "Bio", hook: "Hook", headline: "Headline",
    ad: "Ad Copy", campaign: "Campaign", newsletter: "Newsletter", script: "Script",
  };
  const foundPlatform = Object.keys(platforms).find(p => lower.includes(p));
  const foundType = Object.keys(types).find(t => lower.includes(t));
  const emoji = foundPlatform ? platforms[foundPlatform] : "✍️";
  if (foundPlatform && foundType)
    return `${emoji} ${foundPlatform.charAt(0).toUpperCase() + foundPlatform.slice(1)} ${types[foundType]}`;
  if (foundPlatform) return `${emoji} ${foundPlatform.charAt(0).toUpperCase() + foundPlatform.slice(1)} Content`;
  if (foundType) return `✍️ ${types[foundType]} Craft`;
  const t = firstMsg.slice(0, 30).trim();
  return `✍️ ${t}${firstMsg.length > 30 ? "…" : ""}`;
}

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Session[]).map(s => ({
      ...s,
      messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch { return []; }
}

function saveSessions(sessions: Session[]): void {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

export default function MetaPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => { setSessions(loadSessions()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const persistSession = useCallback((msgs: ChatMsg[], sid: string) => {
    if (msgs.length === 0) return;
    setSessions(prev => {
      const exists = prev.find(s => s.id === sid);
      let next: Session[];
      if (exists) {
        next = prev.map(s => s.id === sid ? { ...s, messages: msgs } : s);
      } else {
        const first = msgs.find(m => m.role === "user");
        next = [{ id: sid, name: first ? generateSessionName(first.content) : "New Chat", createdAt: new Date().toISOString(), messages: msgs }, ...prev];
      }
      saveSessions(next);
      return next;
    });
  }, []);

  const startNewChat = () => {
    if (messages.length > 0 && activeId) persistSession(messages, activeId);
    setActiveId(Date.now().toString());
    setMessages([]);
    setInput("");
    setAttachedFiles([]);
  };

  const loadSession = (s: Session) => {
    if (messages.length > 0 && activeId) persistSession(messages, activeId);
    setActiveId(s.id);
    setMessages(s.messages);
    setInput("");
  };

  const deleteSession = (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    setSessions(prev => { const n = prev.filter(s => s.id !== sid); saveSessions(n); return n; });
    if (activeId === sid) { setActiveId(null); setMessages([]); }
  };

  const handleSpeak = async (msg: ChatMsg) => {
    if (speakingId === msg.id) {
      audioRef.current?.pause(); audioRef.current = null;
      window.speechSynthesis?.cancel(); setSpeakingId(null); return;
    }
    audioRef.current?.pause(); audioRef.current = null;
    window.speechSynthesis?.cancel(); setSpeakingId(msg.id);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.content }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
        audio.onerror = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
        await audio.play(); return;
      }
    } catch {}
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(msg.content);
      u.onend = () => setSpeakingId(null); u.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(u);
    } else { setSpeakingId(null); }
  };

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const sid = activeId || Date.now().toString();
    if (!activeId) setActiveId(sid);
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    const next = [...messages, userMsg];
    setMessages(next); setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/meta", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: msg }], skippyContext: null }),
      });
      const data = await res.json();
      const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: data.reply || data.response || data.message || "Here's what I'd write for you…", timestamp: new Date() };
      const all = [...next, botMsg];
      setMessages(all); persistSession(all, sid);
    } catch {
      const err: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: "Connection error — please try again.", timestamp: new Date() };
      const all = [...next, err];
      setMessages(all); persistSession(all, sid);
    } finally { setLoading(false); }
  }, [input, loading, messages, activeId, persistSession]);

  const handleVoice = useCallback(async () => {
    if (listening) { recorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorderRef.current = recorder;
      setListening(true);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "audio.webm");
        try {
          const res = await fetch("/api/ai/stt", { method: "POST", body: form });
          if (res.ok) { const d = await res.json(); if (d.text) setInput(prev => prev + d.text); }
        } catch {}
        setListening(false);
      };
      recorder.start();
    } catch {
      setListening(false);
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      const r = new SR(); r.lang = "en-US"; setListening(true);
      r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
      r.onerror = () => setListening(false); r.onend = () => setListening(false);
      r.start();
    }
  }, [listening]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const fmtDate = (s: string) => {
    const d = new Date(s), now = new Date(), diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex overflow-hidden mesh-bg">

      {/* ─── SIDEBAR ─── */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 250, borderRight: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="px-3 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-pixel"
            style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.85), rgba(249,115,22,0.85))", color: "#fff", fontSize: 18, boxShadow: "0 4px 14px rgba(244,63,94,0.25)", letterSpacing: "0.02em" }}
          >
            <Plus size={18} /> New Chat
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {sessions.length === 0 ? (
            <div className="pt-8 text-center">
              <MessageSquare size={28} className="mx-auto mb-3 text-black/15" />
              <p className="font-pixel text-black/30" style={{ fontSize: 18, lineHeight: 1.6 }}>No conversations yet</p>
            </div>
          ) : sessions.map(s => (
            <motion.div
              key={s.id}
              onClick={() => loadSession(s)}
              className="relative group mb-0.5 px-3 py-2.5 rounded-xl cursor-pointer flex flex-col"
              style={{ background: activeId === s.id ? "rgba(244,63,94,0.08)" : "transparent", border: activeId === s.id ? "1px solid rgba(244,63,94,0.15)" : "1px solid transparent" }}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
            >
              <p className="font-pixel-thin text-black/75 truncate" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{s.name}</p>
              <p className="font-pixel-thin text-black/30 mt-0.5" style={{ fontSize: 11 }}>{fmtDate(s.createdAt)}</p>
              <button
                onClick={e => deleteSession(e, s.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-50"
              >
                <Trash2 size={11} className="text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── CHAT PANEL ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div
          className="flex items-center justify-center gap-3 py-4 flex-shrink-0 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,245,250,0.55), rgba(255,255,255,0.6))", backdropFilter: "blur(32px) saturate(180%) brightness(108%)", WebkitBackdropFilter: "blur(32px) saturate(180%) brightness(108%)", borderBottom: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(244,63,94,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.55), rgba(255,255,255,0), rgba(255,200,220,0.15))", mixBlendMode: "screen" }} />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.9), rgba(249,115,22,0.9))", boxShadow: "0 2px 8px rgba(244,63,94,0.3), inset 0 1px 0 rgba(255,255,255,0.4)" }}>
              <span className="font-pixel text-white" style={{ fontSize: 8 }}>ME</span>
            </div>
            <div className="text-center">
              <h1 className="font-pixel text-black/70 leading-none" style={{ fontSize: 11 }}>META</h1>
              <p className="font-pixel-thin text-black/40 mt-0.5" style={{ fontSize: 14 }}>AI Copywriter — give me a seed or idea</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pt-12">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <span style={{ fontSize: 28 }}>✍️</span>
              </div>
              <p className="font-pixel-thin text-black/50" style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 320 }}>
                Drop a content seed from Skippy, a raw idea, or a topic. Meta writes three platform-specific variations that sound like you.
              </p>
            </div>
          )}
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[78%] px-5 py-4 rounded-3xl"
                style={{ background: msg.role === "user" ? "#1a1a2e" : "rgba(255,255,255,0.92)", border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)", boxShadow: msg.role === "user" ? "0 4px 16px rgba(26,26,46,0.25)" : "0 2px 12px rgba(0,0,0,0.06)", borderBottomRightRadius: msg.role === "user" ? 8 : 24, borderBottomLeftRadius: msg.role === "bot" ? 8 : 24 }}
              >
                <p className="font-pixel-thin leading-relaxed whitespace-pre-wrap" style={{ fontSize: 18, color: msg.role === "user" ? "#fff" : "rgba(0,0,0,0.75)" }}>
                  {msg.content}
                </p>
                <div className="flex items-center justify-between mt-2 gap-3">
                  <p className="font-pixel-thin" style={{ fontSize: 12, color: msg.role === "user" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.22)" }}>{fmt(msg.timestamp)}</p>
                  {msg.role === "bot" && (
                    <button onClick={() => handleSpeak(msg)} className="flex items-center gap-1 rounded-lg px-2 py-1 transition-all hover:bg-black/5" style={{ opacity: 0.55 }} title="Read aloud">
                      {speakingId === msg.id ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} className="text-black/40" />}
                      <span className="font-pixel-thin text-black/40" style={{ fontSize: 11 }}>{speakingId === msg.id ? "Stop" : "Read"}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-5 py-4 rounded-3xl rounded-bl-lg" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.07)" }}>
                <Loader2 size={14} className="animate-spin text-black/30" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attached files row */}
        {attachedFiles.length > 0 && (
          <div className="px-6 pb-2 flex flex-wrap gap-2 flex-shrink-0">
            {attachedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-pixel-thin text-black/50" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)", fontSize: 12 }}>
                📎 {f.name.slice(0, 22)}{f.name.length > 22 ? "…" : ""}
                <button onClick={() => setAttachedFiles(p => p.filter((_, j) => j !== i))} className="ml-1 hover:text-red-400">×</button>
              </div>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(28px) saturate(180%)", WebkitBackdropFilter: "blur(28px) saturate(180%)", borderTop: "1px solid rgba(255,255,255,0.6)" }}>
          <div className="relative rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(40px) saturate(200%) brightness(108%)", WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(108%)", border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 32px rgba(244,63,94,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0), rgba(255,200,220,0.1))", borderRadius: "inherit" }} />
            <div className="flex items-end gap-2 px-4 py-3 relative z-10">
              <input type="file" ref={fileRef} className="hidden" multiple onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors mb-0.5" title="Attach file">
                <Paperclip size={16} className={attachedFiles.length > 0 ? "text-rose-500" : "text-black/30"} />
              </button>
              <textarea
                ref={textareaRef} rows={1} value={input} onChange={handleTextareaChange}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Give Meta a content seed or idea…"
                className="flex-1 bg-transparent outline-none resize-none font-pixel-thin placeholder:text-black/25"
                style={{ fontSize: 18, lineHeight: 1.55, minHeight: 28, maxHeight: 160, color: "rgba(0,0,0,0.75)" }}
              />
              <button onClick={handleVoice} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors mb-0.5" title={listening ? "Stop recording" : "Voice input (ElevenLabs)"}>
                <Mic size={16} className={listening ? "text-red-400 animate-pulse" : "text-black/30"} />
              </button>
              <motion.button
                onClick={send} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} disabled={!input.trim() || loading}
                className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mb-0.5"
                style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #f43f5e, #f97316)" : "rgba(0,0,0,0.07)", boxShadow: input.trim() && !loading ? "0 4px 16px rgba(244,63,94,0.35), 0 2px 6px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
              >
                <ArrowUp size={16} style={{ color: input.trim() && !loading ? "#fff" : "rgba(0,0,0,0.25)" }} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
