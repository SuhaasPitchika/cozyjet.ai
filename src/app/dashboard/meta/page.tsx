"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, ArrowUp, Loader2, Volume2, VolumeX, Plus, MessageSquare, Trash2, Phone, PhoneOff, Waves } from "lucide-react";

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
  const t = firstMsg.slice(0, 28).trim();
  return `✍️ ${t}${firstMsg.length > 28 ? "…" : ""}`;
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

async function speakText(text: string, onEnd?: () => void): Promise<HTMLAudioElement | null> {
  try {
    const res = await fetch("/api/ai/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, emotion: "warm" }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { onEnd?.(); URL.revokeObjectURL(url); };
      audio.onerror = () => { onEnd?.(); URL.revokeObjectURL(url); };
      await audio.play();
      return audio;
    }
  } catch {}
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text.slice(0, 500));
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } else { onEnd?.(); }
  return null;
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

  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceMessages, setVoiceMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceMsgsRef = useRef<{ role: "user" | "bot"; text: string }[]>([]);

  useEffect(() => { setSessions(loadSessions()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { voiceMsgsRef.current = voiceMessages; }, [voiceMessages]);

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
    const audio = await speakText(msg.content, () => setSpeakingId(null));
    if (audio) audioRef.current = audio;
  };

  const callMeta = useCallback(async (userText: string, history: { role: string; content: string }[]) => {
    const res = await fetch("/api/ai/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...history, { role: "user", content: userText }],
        skippyContext: null,
      }),
    });
    const data = await res.json();
    return data.reply || data.response || data.message || "Here's what I'd craft for you…";
  }, []);

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
      const reply = await callMeta(msg, history);
      const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: reply, timestamp: new Date() };
      const all = [...next, botMsg];
      setMessages(all); persistSession(all, sid);
    } catch {
      const err: ChatMsg = { id: (Date.now() + 1).toString(), role: "bot", content: "Connection error — please try again.", timestamp: new Date() };
      const all = [...next, err];
      setMessages(all); persistSession(all, sid);
    } finally { setLoading(false); }
  }, [input, loading, messages, activeId, persistSession, callMeta]);

  const handleVoiceInput = useCallback(async () => {
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

  const startVoiceConversation = async () => {
    setVoiceMode(true);
    setVoiceMessages([]);
    setVoiceTranscript("");
    setVoiceState("idle");
    voiceMsgsRef.current = [];
  };

  const stopVoiceConversation = () => {
    voiceAudioRef.current?.pause();
    voiceAudioRef.current = null;
    recorderRef.current?.stop();
    window.speechSynthesis?.cancel();
    setVoiceMode(false);
    setVoiceState("idle");
    setVoiceTranscript("");
  };

  const voiceListen = useCallback(async () => {
    if (voiceState !== "idle") return;
    setVoiceState("listening");
    setVoiceTranscript("");

    const recordAndTranscribe = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorderRef.current = recorder;
        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: "audio/webm" });

          let transcript = "";
          try {
            const form = new FormData();
            form.append("audio", blob, "audio.webm");
            const res = await fetch("/api/ai/stt", { method: "POST", body: form });
            if (res.ok) { const d = await res.json(); transcript = d.text || ""; }
          } catch {}

          if (!transcript.trim()) { setVoiceState("idle"); return; }

          setVoiceTranscript(transcript);
          const newUserMsg = { role: "user" as const, text: transcript };
          const updatedMsgs = [...voiceMsgsRef.current, newUserMsg];
          setVoiceMessages(updatedMsgs);
          voiceMsgsRef.current = updatedMsgs;

          setVoiceState("thinking");
          try {
            const history = voiceMsgsRef.current.slice(0, -1).map(m => ({
              role: m.role === "bot" ? "assistant" : "user",
              content: m.text,
            }));
            const res = await fetch("/api/ai/meta", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [...history, { role: "user", content: transcript }],
                skippyContext: null,
              }),
            });
            const data = await res.json();
            const reply = data.reply || data.response || data.message || "Let me help you with that.";

            const newBotMsg = { role: "bot" as const, text: reply };
            const allMsgs = [...updatedMsgs, newBotMsg];
            setVoiceMessages(allMsgs);
            voiceMsgsRef.current = allMsgs;

            setVoiceState("speaking");
            const audio = await speakText(reply, () => setVoiceState("idle"));
            if (audio) voiceAudioRef.current = audio;
          } catch {
            setVoiceState("idle");
          }
        };

        recorder.start();
        setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 8000);
      } catch {
        setVoiceState("idle");
      }
    };

    await recordAndTranscribe();
  }, [voiceState]);

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

  const voiceStateLabel = voiceState === "listening" ? "Listening…" : voiceState === "thinking" ? "Thinking…" : voiceState === "speaking" ? "Speaking…" : "Tap to speak";
  const voiceStateColor = voiceState === "listening" ? "#f43f5e" : voiceState === "thinking" ? "#f97316" : voiceState === "speaking" ? "#8b5cf6" : "rgba(0,0,0,0.5)";

  return (
    <>
      {/* ─── VOICE CONVERSATION OVERLAY ─── */}
      <AnimatePresence>
        {voiceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between"
            style={{ background: "linear-gradient(160deg, #0f0f1a 0%, #1a0a14 50%, #0a0f1a 100%)" }}
          >
            {/* Close button */}
            <div className="w-full flex justify-end p-6">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={stopVoiceConversation}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "inherit" }}
              >
                <PhoneOff size={14} /> End Call
              </motion.button>
            </div>

            {/* Conversation transcript */}
            <div className="flex-1 w-full max-w-lg overflow-y-auto px-6 flex flex-col gap-3 justify-end pb-4">
              {voiceMessages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] px-4 py-3 rounded-2xl"
                    style={{
                      background: m.role === "user" ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.06)",
                      border: m.role === "user" ? "1px solid rgba(244,63,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 13,
                      lineHeight: 1.55,
                      fontFamily: "inherit",
                    }}
                  >
                    {m.text.length > 200 ? m.text.slice(0, 200) + "…" : m.text}
                  </div>
                </motion.div>
              ))}
              {voiceTranscript && voiceState === "listening" && (
                <div className="flex justify-end">
                  <div className="px-4 py-2 rounded-2xl" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "inherit", fontStyle: "italic" }}>
                    {voiceTranscript}
                  </div>
                </div>
              )}
            </div>

            {/* Big mic / status */}
            <div className="flex flex-col items-center gap-6 pb-16">
              <motion.div
                animate={voiceState === "speaking" ? { scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 0.8 } } : {}}
                style={{ color: voiceStateColor, fontSize: 12, fontFamily: "inherit", letterSpacing: "0.08em" }}
              >
                {voiceStateLabel}
              </motion.div>

              <motion.button
                onClick={voiceListen}
                disabled={voiceState === "thinking" || voiceState === "speaking"}
                whileHover={voiceState === "idle" ? { scale: 1.06 } : {}}
                whileTap={voiceState === "idle" ? { scale: 0.94 } : {}}
                className="relative flex items-center justify-center"
                style={{
                  width: 88, height: 88, borderRadius: "50%",
                  background: voiceState === "listening"
                    ? "radial-gradient(circle, rgba(244,63,94,0.9), rgba(244,63,94,0.5))"
                    : voiceState === "speaking"
                    ? "radial-gradient(circle, rgba(139,92,246,0.9), rgba(139,92,246,0.5))"
                    : "radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                  border: voiceState === "idle" ? "2px solid rgba(255,255,255,0.15)" : "none",
                  boxShadow: voiceState === "listening"
                    ? "0 0 0 12px rgba(244,63,94,0.12), 0 0 0 24px rgba(244,63,94,0.06)"
                    : voiceState === "speaking"
                    ? "0 0 0 12px rgba(139,92,246,0.12), 0 0 0 24px rgba(139,92,246,0.06)"
                    : "0 0 0 1px rgba(255,255,255,0.1)",
                }}
              >
                {voiceState === "thinking" ? (
                  <Loader2 size={28} className="animate-spin" style={{ color: "rgba(249,115,22,0.8)" }} />
                ) : voiceState === "speaking" ? (
                  <Waves size={28} style={{ color: "rgba(255,255,255,0.9)" }} />
                ) : (
                  <Mic size={28} style={{ color: voiceState === "listening" ? "#fff" : "rgba(255,255,255,0.6)" }} />
                )}
              </motion.button>

              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "inherit" }}>
                {voiceState === "idle" ? "Tap mic • Auto-stops after 8 seconds" : voiceState === "speaking" ? "AI is speaking…" : ""}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full flex overflow-hidden mesh-bg">

        {/* ─── SIDEBAR ─── */}
        <div
          className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: 230, borderRight: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.85), rgba(249,115,22,0.85))", color: "#fff", fontSize: 12, letterSpacing: "0.02em", boxShadow: "0 3px 10px rgba(244,63,94,0.22)" }}
            >
              <Plus size={13} /> New Chat
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={startVoiceConversation}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl mt-1.5"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", color: "rgba(139,92,246,0.8)", fontSize: 11, letterSpacing: "0.02em" }}
            >
              <Phone size={11} /> Voice Call Meta
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5 px-2">
            {sessions.length === 0 ? (
              <div className="pt-6 text-center">
                <MessageSquare size={22} className="mx-auto mb-2 text-black/15" />
                <p className="text-black/30" style={{ fontSize: 11, lineHeight: 1.5 }}>No conversations yet</p>
              </div>
            ) : sessions.map(s => (
              <motion.div
                key={s.id}
                onClick={() => loadSession(s)}
                className="relative group mb-0.5 px-2.5 py-2 rounded-lg cursor-pointer flex flex-col"
                style={{ background: activeId === s.id ? "rgba(244,63,94,0.08)" : "transparent", border: activeId === s.id ? "1px solid rgba(244,63,94,0.15)" : "1px solid transparent" }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
              >
                <p className="text-black/75 truncate" style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{s.name}</p>
                <p className="text-black/30 mt-0.5" style={{ fontSize: 10 }}>{fmtDate(s.createdAt)}</p>
                <button
                  onClick={e => deleteSession(e, s.id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-md flex items-center justify-center hover:bg-red-50"
                >
                  <Trash2 size={10} className="text-red-400" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── CHAT PANEL ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <div
            className="flex items-center justify-center gap-3 py-3 flex-shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,245,250,0.55), rgba(255,255,255,0.6))", backdropFilter: "blur(32px) saturate(180%) brightness(108%)", WebkitBackdropFilter: "blur(32px) saturate(180%) brightness(108%)", borderBottom: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(244,63,94,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.55), rgba(255,255,255,0), rgba(255,200,220,0.15))", mixBlendMode: "screen" }} />
            <div className="relative z-10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.9), rgba(249,115,22,0.9))", boxShadow: "0 2px 6px rgba(244,63,94,0.3)" }}>
                <span style={{ color: "#fff", fontSize: 7, fontWeight: 700 }}>ME</span>
              </div>
              <div>
                <h1 className="font-pixel text-black/70 leading-none" style={{ fontSize: 10 }}>META</h1>
                <p className="text-black/40 mt-0.5" style={{ fontSize: 11 }}>AI Copywriter — drop a seed or idea</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pt-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  <span style={{ fontSize: 24 }}>✍️</span>
                </div>
                <p className="text-black/50" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 300 }}>
                  Drop a content seed, raw idea, or topic. Meta writes three platform-ready variations that sound like you.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {["Write a LinkedIn post about my SaaS launch", "Twitter thread on lessons learned", "Instagram caption for my journey"].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-1.5 rounded-xl transition-all hover:bg-black/5"
                      style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.07)", fontSize: 11, color: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[78%] px-5 py-4 rounded-3xl"
                  style={{ background: msg.role === "user" ? "#1a1a2e" : "rgba(255,255,255,0.92)", border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)", boxShadow: msg.role === "user" ? "0 4px 16px rgba(26,26,46,0.25)" : "0 2px 12px rgba(0,0,0,0.06)", borderBottomRightRadius: msg.role === "user" ? 8 : 24, borderBottomLeftRadius: msg.role === "bot" ? 8 : 24 }}
                >
                  <p className="font-pixel-thin leading-relaxed whitespace-pre-wrap" style={{ fontSize: 15, color: msg.role === "user" ? "#fff" : "rgba(0,0,0,0.78)" }}>
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <p style={{ fontSize: 10, color: msg.role === "user" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)" }}>{fmt(msg.timestamp)}</p>
                    {msg.role === "bot" && (
                      <button onClick={() => handleSpeak(msg)} className="flex items-center gap-1 rounded-lg px-2 py-0.5 transition-all hover:bg-black/5" style={{ opacity: 0.6 }} title="Read aloud">
                        {speakingId === msg.id ? <VolumeX size={12} className="text-red-400" /> : <Volume2 size={12} className="text-black/40" />}
                        <span style={{ fontSize: 10, color: "rgba(0,0,0,0.35)" }}>{speakingId === msg.id ? "Stop" : "Read"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-5 py-4 rounded-3xl rounded-bl-lg" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <Loader2 size={13} className="animate-spin text-black/30" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div className="px-6 pb-2 flex flex-wrap gap-2 flex-shrink-0">
              {attachedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)", fontSize: 11, color: "rgba(0,0,0,0.45)" }}>
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
                <button onClick={() => fileRef.current?.click()} className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors mb-0.5" title="Attach file">
                  <Paperclip size={15} className={attachedFiles.length > 0 ? "text-rose-500" : "text-black/30"} />
                </button>
                <textarea
                  ref={textareaRef} rows={1} value={input} onChange={handleTextareaChange}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Give Meta a content seed or idea…"
                  className="flex-1 bg-transparent outline-none resize-none font-pixel-thin placeholder:text-black/25"
                  style={{ fontSize: 15, lineHeight: 1.55, minHeight: 26, maxHeight: 160, color: "rgba(0,0,0,0.75)" }}
                />
                <button onClick={handleVoiceInput} className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors mb-0.5" title={listening ? "Stop recording" : "Voice input"}>
                  <Mic size={15} className={listening ? "text-red-400 animate-pulse" : "text-black/30"} />
                </button>
                <motion.button
                  onClick={send} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} disabled={!input.trim() || loading}
                  className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
                  style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #f43f5e, #f97316)" : "rgba(0,0,0,0.07)", boxShadow: input.trim() && !loading ? "0 4px 16px rgba(244,63,94,0.35), 0 2px 6px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                >
                  <ArrowUp size={15} style={{ color: input.trim() && !loading ? "#fff" : "rgba(0,0,0,0.25)" }} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
