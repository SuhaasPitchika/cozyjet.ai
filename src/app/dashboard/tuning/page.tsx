"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, ArrowUp, Loader2, Volume2, VolumeX,
  Plus, Trash2, Zap, CheckCircle2, ChevronDown, ChevronUp, FileText
} from "lucide-react";

/* ─── Types ─── */
interface ChatMsg {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface VoiceSample {
  id: string;
  text: string;
  label: string;
  chars: number;
  added_at: string;
}

interface VoiceProfile {
  tone?: string;
  formality?: string;
  humor?: string;
  length_preference?: string;
  preferred_style?: string;
  style_observations?: string[];
  signature_moves?: string[];
  avoid?: string[];
  processed_at?: string;
  samples_count?: number;
}

/* ─── localStorage keys ─── */
const SAMPLES_KEY = "cozyjet_voice_samples";
const PROFILE_KEY = "cozyjet_voice_profile";

function loadSamples(): VoiceSample[] {
  try { return JSON.parse(localStorage.getItem(SAMPLES_KEY) || "[]"); } catch { return []; }
}
function saveSamples(s: VoiceSample[]) {
  try { localStorage.setItem(SAMPLES_KEY, JSON.stringify(s)); } catch {}
}
function loadProfile(): VoiceProfile | null {
  try { const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveProfile(p: VoiceProfile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

/* ─── Helpers ─── */
function fmt(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/* ─── Background ─── */
function TuningBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #f8fbff 0%, #edf6ff 50%, #f3f9ff 100%)" }} />
      <div className="absolute" style={{ top: "10%", left: "5%", width: "50vw", height: "50vh", background: "radial-gradient(ellipse, rgba(147,210,255,0.22) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute" style={{ bottom: "15%", right: "10%", width: "40vw", height: "40vh", background: "radial-gradient(ellipse, rgba(200,180,255,0.15) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(140,180,220,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(140,180,220,0.12) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

/* ─── Glass panel wrapper ─── */
function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.70)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(200,225,255,0.55)",
        boxShadow: "0 4px 32px rgba(100,160,255,0.10), inset 0 1px 0 rgba(255,255,255,0.90)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%)", borderRadius: "inherit" }} />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}

/* ─── Voice Profile display ─── */
function ProfileCard({ profile, onClear }: { profile: VoiceProfile; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const obs = profile.style_observations || [];
  const moves = profile.signature_moves || [];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(220,240,255,0.8), rgba(200,220,255,0.6))",
        border: "1px solid rgba(150,200,255,0.5)",
        boxShadow: "0 2px 12px rgba(100,160,255,0.15)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} style={{ color: "#3b82f6" }} />
          <span className="font-pixel-thin text-blue-700" style={{ fontSize: 13, fontWeight: 600 }}>Voice profile active</span>
          {profile.samples_count && (
            <span className="font-pixel-thin" style={{ fontSize: 11, color: "rgba(60,100,160,0.6)" }}>
              {profile.samples_count} sample{profile.samples_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setOpen(o => !o)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-100/50 transition-colors">
            {open ? <ChevronUp size={12} style={{ color: "rgba(60,100,160,0.7)" }} /> : <ChevronDown size={12} style={{ color: "rgba(60,100,160,0.7)" }} />}
          </button>
          <button onClick={onClear} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors" title="Clear profile">
            <Trash2 size={11} style={{ color: "rgba(200,80,80,0.5)" }} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Tone", value: profile.tone },
                  { label: "Formality", value: profile.formality },
                  { label: "Humor", value: profile.humor },
                  { label: "Length", value: profile.length_preference },
                  { label: "Style", value: profile.preferred_style },
                ].filter(t => t.value).map(tag => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(150,200,255,0.5)", fontSize: 11 }}
                  >
                    <span className="font-pixel-thin" style={{ color: "rgba(80,120,180,0.6)" }}>{tag.label}:</span>
                    <span className="font-pixel-thin font-semibold" style={{ color: "rgba(30,60,120,0.85)" }}>{tag.value}</span>
                  </span>
                ))}
              </div>

              {obs.length > 0 && (
                <div>
                  <p className="font-pixel-thin mb-1.5" style={{ fontSize: 11, color: "rgba(60,100,160,0.55)", letterSpacing: "0.06em" }}>STYLE OBSERVATIONS</p>
                  <ul className="flex flex-col gap-1">
                    {obs.map((o, i) => (
                      <li key={i} className="font-pixel-thin" style={{ fontSize: 12, color: "rgba(20,50,100,0.75)" }}>
                        <span style={{ color: "rgba(100,160,255,0.6)" }}>•</span> {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {moves.length > 0 && (
                <div>
                  <p className="font-pixel-thin mb-1.5" style={{ fontSize: 11, color: "rgba(60,100,160,0.55)", letterSpacing: "0.06em" }}>SIGNATURE MOVES</p>
                  <ul className="flex flex-col gap-1">
                    {moves.map((m, i) => (
                      <li key={i} className="font-pixel-thin" style={{ fontSize: 12, color: "rgba(20,50,100,0.75)" }}>
                        <span style={{ color: "rgba(140,100,255,0.6)" }}>•</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sample item ─── */
function SampleItem({ sample, onDelete }: { sample: VoiceSample; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const preview = sample.text.slice(0, 120);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(200,225,255,0.5)",
        boxShadow: "0 2px 8px rgba(100,160,255,0.08)",
      }}
    >
      <div className="flex items-start gap-2.5 px-3.5 py-3">
        <FileText size={14} style={{ color: "rgba(100,150,200,0.6)", flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1 min-w-0">
          {sample.label && (
            <p className="font-pixel-thin font-semibold mb-0.5" style={{ fontSize: 12, color: "rgba(30,60,120,0.8)" }}>{sample.label}</p>
          )}
          <p className="font-pixel-thin" style={{ fontSize: 12, color: "rgba(30,60,100,0.65)", lineHeight: 1.6 }}>
            {expanded ? sample.text : preview}
            {!expanded && sample.text.length > 120 && (
              <button onClick={() => setExpanded(true)} style={{ color: "rgba(100,150,220,0.7)", marginLeft: 4, fontSize: 11 }}>...more</button>
            )}
          </p>
          <p className="font-pixel-thin mt-1" style={{ fontSize: 10, color: "rgba(100,140,180,0.5)" }}>
            {sample.chars.toLocaleString()} chars
          </p>
        </div>
        <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 hover:bg-red-50 transition-colors">
          <Trash2 size={12} style={{ color: "rgba(200,80,80,0.45)" }} />
        </button>
      </div>
    </div>
  );
}

/* ─── Add sample form ─── */
function AddSampleForm({ onAdd }: { onAdd: (text: string, label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");

  const submit = () => {
    const t = text.trim();
    if (t.length < 30) return;
    onAdd(t, label.trim());
    setText("");
    setLabel("");
    setOpen(false);
  };

  return (
    <div>
      {!open ? (
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3"
          style={{
            background: "rgba(255,255,255,0.55)",
            border: "1.5px dashed rgba(150,200,255,0.5)",
            color: "rgba(80,130,200,0.7)",
          }}
        >
          <Plus size={14} />
          <span className="font-pixel-thin" style={{ fontSize: 13 }}>Add writing sample</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(150,200,255,0.5)", boxShadow: "0 4px 20px rgba(100,160,255,0.12)" }}
        >
          <div className="p-3.5 flex flex-col gap-2.5">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Label (optional) — e.g. LinkedIn post, Email"
              className="w-full bg-transparent outline-none font-pixel-thin"
              style={{ fontSize: 12, color: "rgba(30,60,120,0.8)", borderBottom: "1px solid rgba(150,200,255,0.3)", paddingBottom: 6 }}
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your writing here — a blog post, email, LinkedIn post, anything that sounds like you. Minimum 30 characters."
              rows={5}
              className="w-full bg-transparent outline-none resize-none font-pixel-thin"
              style={{ fontSize: 13, color: "rgba(20,40,80,0.8)", lineHeight: 1.6 }}
            />
            <div className="flex items-center justify-between">
              <p className="font-pixel-thin" style={{ fontSize: 11, color: text.length < 30 ? "rgba(200,100,100,0.6)" : "rgba(80,140,80,0.6)" }}>
                {text.length} chars{text.length < 30 ? " (need 30+)" : " — good"}
              </p>
              <div className="flex gap-2">
                <button onClick={() => { setOpen(false); setText(""); setLabel(""); }} className="px-3 py-1.5 rounded-xl font-pixel-thin" style={{ fontSize: 12, color: "rgba(80,100,140,0.6)", background: "rgba(0,0,0,0.04)" }}>
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={text.trim().length < 30}
                  className="px-3 py-1.5 rounded-xl font-pixel-thin"
                  style={{
                    fontSize: 12,
                    background: text.trim().length >= 30 ? "linear-gradient(135deg, #4facfe, #00d4ff)" : "rgba(180,210,240,0.3)",
                    color: text.trim().length >= 30 ? "#fff" : "rgba(100,140,180,0.4)",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Left panel: Voice Studio ─── */
function VoiceStudio({
  samples, profile, processing,
  onAddSample, onDeleteSample, onProcess, onClearProfile,
}: {
  samples: VoiceSample[];
  profile: VoiceProfile | null;
  processing: boolean;
  onAddSample: (text: string, label: string) => void;
  onDeleteSample: (id: string) => void;
  onProcess: () => void;
  onClearProfile: () => void;
}) {
  return (
    <GlassPanel className="rounded-3xl h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(200,225,255,0.35)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(255,217,125,0.9), rgba(255,157,226,0.9))", boxShadow: "0 2px 8px rgba(255,180,100,0.3)" }}
          >
            <span className="font-pixel text-black/70" style={{ fontSize: 7 }}>VS</span>
          </div>
          <div>
            <h2 className="font-pixel text-black/75 leading-none" style={{ fontSize: 11 }}>VOICE STUDIO</h2>
            <p className="font-pixel-thin text-black/45 mt-0.5" style={{ fontSize: 13 }}>Samples teach Meta your voice</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {/* Profile card */}
        {profile && <ProfileCard profile={profile} onClear={onClearProfile} />}

        {/* Samples */}
        {samples.length === 0 && !profile && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center" style={{ background: "rgba(150,200,255,0.15)", border: "1px solid rgba(150,200,255,0.3)" }}>
              <FileText size={20} style={{ color: "rgba(100,150,220,0.5)" }} />
            </div>
            <p className="font-pixel-thin" style={{ fontSize: 14, color: "rgba(60,100,160,0.6)" }}>No samples yet</p>
            <p className="font-pixel-thin mt-1 max-w-44" style={{ fontSize: 12, color: "rgba(80,120,160,0.45)", lineHeight: 1.5 }}>
              Paste writing that sounds like you — posts, emails, anything
            </p>
          </div>
        )}

        {samples.map(s => (
          <SampleItem key={s.id} sample={s} onDelete={() => onDeleteSample(s.id)} />
        ))}

        {/* Add form */}
        <AddSampleForm onAdd={onAddSample} />
      </div>

      {/* Process button */}
      {samples.length > 0 && (
        <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(200,225,255,0.35)" }}>
          <motion.button
            onClick={onProcess}
            disabled={processing}
            whileHover={!processing ? { scale: 1.02 } : {}}
            whileTap={!processing ? { scale: 0.97 } : {}}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl"
            style={{
              background: processing
                ? "rgba(180,210,240,0.4)"
                : "linear-gradient(135deg, rgba(79,172,254,0.9), rgba(0,212,255,0.9))",
              boxShadow: processing ? "none" : "0 4px 20px rgba(79,172,254,0.35)",
              color: processing ? "rgba(100,150,200,0.5)" : "#fff",
              border: "none",
            }}
          >
            {processing
              ? <Loader2 size={14} className="animate-spin" />
              : <Zap size={14} />
            }
            <span className="font-pixel-thin font-semibold" style={{ fontSize: 14 }}>
              {processing ? "Building profile..." : `Build Voice Profile (${samples.length} sample${samples.length !== 1 ? "s" : ""})`}
            </span>
          </motion.button>
          <p className="font-pixel-thin text-center mt-2" style={{ fontSize: 11, color: "rgba(80,120,160,0.45)" }}>
            Profile is used by Meta and Snooks when generating content
          </p>
        </div>
      )}
    </GlassPanel>
  );
}

/* ─── Parse a profile proposal out of AI text ─── */
function parseProfileFromText(text: string): VoiceProfile | null {
  const tone = text.match(/TONE:\s*(.+)/i)?.[1]?.trim();
  const formality = text.match(/FORMALITY:\s*(.+)/i)?.[1]?.trim();
  if (!tone && !formality) return null;

  const humor = text.match(/HUMOR:\s*(.+)/i)?.[1]?.trim();
  const length = text.match(/LENGTH(?:\s+PREFERENCE)?:\s*(.+)/i)?.[1]?.trim();
  const style = text.match(/STYLE:\s*(.+)/i)?.[1]?.trim();

  const extractList = (label: string): string[] => {
    const re = new RegExp(`${label}[:\\s]*\\n([\\s\\S]*?)(?=\\n[A-Z ]{3,}:|$)`, "i");
    const block = text.match(re)?.[1] || "";
    return block.split("\n").map(l => l.replace(/^[-*•\d.]+\s*/, "").trim()).filter(l => l.length > 4);
  };

  return {
    tone,
    formality,
    humor,
    length_preference: length,
    preferred_style: style,
    style_observations: extractList("OBSERVATIONS?"),
    signature_moves: extractList("SIGNATURE MOVES?"),
    avoid: extractList("AVOID"),
  };
}

/* ─── Right panel: Voice Calibration Chat ─── */
function TuningChat({
  voiceProfile,
  onSaveProfile,
}: {
  voiceProfile: VoiceProfile | null;
  onSaveProfile: (p: VoiceProfile) => void;
}) {
  const openingMsg = voiceProfile
    ? `I've extracted a profile from your writing samples. Let me verify it's accurate — the tone is marked as "${voiceProfile.tone || "not set"}". Does that sound right, or is it off somehow?`
    : "When you write — a post, an email, anything — do you usually open with a statement, a question, or do you jump straight into a story?";

  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "init", role: "bot", content: openingMsg, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [pendingProfile, setPendingProfile] = useState<{ msgId: string; profile: VoiceProfile } | null>(null);
  const [savedMsgIds, setSavedMsgIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSpeak = (msg: ChatMsg) => {
    if (speakingId === msg.id) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(msg.id);
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(msg.content.slice(0, 600));
    u.rate = 1.0;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis?.speak(u);
  };

  const addBotMessage = (content: string) => {
    const id = (Date.now() + 1).toString();
    const msg: ChatMsg = { id, role: "bot", content, timestamp: new Date() };
    setMessages(prev => [...prev, msg]);

    const parsed = parseProfileFromText(content);
    if (parsed) setPendingProfile({ msgId: id, profile: parsed });

    return id;
  };

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await fetch("/api/ai/tuning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: msg }],
          voiceProfile: voiceProfile || undefined,
        }),
      });
      const data = await res.json();
      addBotMessage(data.response || data.reply || data.message || "Something went wrong.");
    } catch {
      addBotMessage("Connection issue — please retry.");
    } finally { setLoading(false); }
  }, [input, loading, messages, voiceProfile]);

  const handleSaveProfile = (msgId: string, profile: VoiceProfile) => {
    const full: VoiceProfile = {
      ...profile,
      processed_at: new Date().toISOString(),
      samples_count: voiceProfile?.samples_count || 0,
    };
    onSaveProfile(full);
    setSavedMsgIds(prev => new Set([...prev, msgId]));
    setPendingProfile(null);
    setMessages(prev => [...prev, {
      id: Date.now().toString(), role: "bot",
      content: "Profile saved. Meta and Snooks will now generate content in your voice — no editing needed.",
      timestamp: new Date(),
    }]);
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported."); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    setListening(true);
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <GlassPanel className="rounded-3xl h-full">
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,225,255,0.35)" }}
      >
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(147,210,255,0.9), rgba(100,180,255,0.9))", boxShadow: "0 2px 8px rgba(100,180,255,0.3)" }}
        >
          <span className="font-pixel text-white/90" style={{ fontSize: 7 }}>TN</span>
        </div>
        <div>
          <h2 className="font-pixel text-black/75 leading-none" style={{ fontSize: 11 }}>VOICE CALIBRATION</h2>
          <p className="font-pixel-thin text-black/45 mt-0.5" style={{ fontSize: 13 }}>
            {voiceProfile ? "Refining your profile — Meta and Snooks are listening" : "Teaching Meta and Snooks how you write"}
          </p>
        </div>
        {voiceProfile && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(79,172,254,0.12)", border: "1px solid rgba(79,172,254,0.3)" }}>
            <CheckCircle2 size={11} style={{ color: "#3b82f6" }} />
            <span className="font-pixel-thin" style={{ fontSize: 11, color: "#3b82f6" }}>Profile active</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className="max-w-[85%] px-5 py-4 rounded-3xl"
              style={
                msg.role === "user"
                  ? {
                      background: "rgba(255,255,255,0.92)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 4px 20px rgba(160,210,255,0.18), 0 1px 4px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(200,230,255,0.6)",
                      borderBottomRightRadius: 8,
                    }
                  : {
                      background: "rgba(255,255,255,0.50)",
                      border: "1px solid rgba(200,225,255,0.45)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      boxShadow: "0 2px 12px rgba(160,210,255,0.10)",
                      borderBottomLeftRadius: 8,
                    }
              }
            >
              <p className="font-pixel-thin leading-relaxed whitespace-pre-wrap" style={{ fontSize: 16, color: "rgba(20,40,80,0.82)" }}>
                {msg.content}
              </p>
              <div className="flex items-center justify-between mt-2 gap-3">
                <p className="font-pixel-thin" style={{ fontSize: 11, color: "rgba(60,100,160,0.35)" }}>{fmt(msg.timestamp)}</p>
                {msg.role === "bot" && (
                  <button onClick={() => handleSpeak(msg)} className="flex items-center gap-1 rounded-lg px-2 py-0.5 hover:bg-blue-50 transition-all" style={{ opacity: 0.65 }}>
                    {speakingId === msg.id
                      ? <VolumeX size={12} className="text-red-400" />
                      : <Volume2 size={12} style={{ color: "rgba(100,150,200,0.7)" }} />
                    }
                    <span className="font-pixel-thin" style={{ fontSize: 10, color: "rgba(80,130,190,0.6)" }}>
                      {speakingId === msg.id ? "Stop" : "Read"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Save Profile button when AI proposes a profile */}
            {msg.role === "bot" && pendingProfile?.msgId === msg.id && !savedMsgIds.has(msg.id) && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSaveProfile(msg.id, pendingProfile.profile)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(79,172,254,0.9), rgba(0,212,255,0.85))",
                  boxShadow: "0 4px 16px rgba(79,172,254,0.35)",
                  border: "none",
                  color: "#fff",
                }}
              >
                <CheckCircle2 size={13} />
                <span className="font-pixel-thin font-semibold" style={{ fontSize: 13 }}>Save as my voice profile</span>
              </motion.button>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-3xl rounded-bl-lg" style={{ background: "rgba(255,255,255,0.50)", border: "1px solid rgba(200,225,255,0.45)", backdropFilter: "blur(24px)" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: "rgba(100,160,220,0.6)" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(200,225,255,0.35)" }}>
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.90)",
            border: "1.5px solid rgba(200,230,255,0.70)",
            boxShadow: "0 6px 28px rgba(100,170,255,0.12), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
        >
          <div className="flex items-end gap-2 px-4 py-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Answer or paste a sample of your writing..."
              className="flex-1 bg-transparent outline-none resize-none font-pixel-thin"
              style={{ fontSize: 16, lineHeight: 1.55, minHeight: 26, maxHeight: 160, color: "rgba(20,40,80,0.8)" }}
            />

            <motion.button
              onClick={handleVoice}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: listening ? "rgba(239,68,68,0.10)" : "rgba(180,210,240,0.20)",
                border: `1.5px solid ${listening ? "rgba(239,68,68,0.4)" : "rgba(180,210,240,0.5)"}`,
                boxShadow: listening ? "0 0 0 3px rgba(239,68,68,0.15)" : "none",
              }}
            >
              <Mic size={14} className={listening ? "text-red-400 animate-pulse" : ""} style={{ color: listening ? undefined : "rgba(100,150,200,0.65)" }} />
            </motion.button>

            <motion.button
              onClick={send}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mb-0.5"
              style={{
                background: input.trim() && !loading ? "linear-gradient(135deg, #4facfe, #00d4ff)" : "rgba(180,210,240,0.3)",
                boxShadow: input.trim() && !loading ? "0 4px 16px rgba(79,172,254,0.4)" : "none",
                border: "1.5px solid " + (input.trim() && !loading ? "rgba(79,172,254,0.5)" : "rgba(180,210,240,0.4)"),
                transition: "all 0.2s",
              }}
            >
              <ArrowUp size={14} style={{ color: input.trim() && !loading ? "#fff" : "rgba(100,150,200,0.4)" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

/* ─── Main page ─── */
export default function TuningPage() {
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setSamples(loadSamples());
    setProfile(loadProfile());
  }, []);

  const handleAddSample = (text: string, label: string) => {
    const newSample: VoiceSample = {
      id: Date.now().toString(),
      text,
      label,
      chars: text.length,
      added_at: new Date().toISOString(),
    };
    const updated = [newSample, ...samples];
    setSamples(updated);
    saveSamples(updated);
  };

  const handleDeleteSample = (id: string) => {
    const updated = samples.filter(s => s.id !== id);
    setSamples(updated);
    saveSamples(updated);
  };

  const handleProcess = async () => {
    if (samples.length === 0 || processing) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          samples: samples.map(s => ({ text: s.text, label: s.label })),
        }),
      });
      const data = await res.json();
      if (data.profile) {
        const p: VoiceProfile = {
          ...data.profile,
          processed_at: new Date().toISOString(),
          samples_count: samples.length,
        };
        setProfile(p);
        saveProfile(p);
      }
    } catch (e) {
      console.error("Voice processing failed:", e);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearProfile = () => {
    setProfile(null);
    localStorage.removeItem(PROFILE_KEY);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <TuningBackground />

      {/* Two-column layout */}
      <div className="relative z-10 flex-1 flex gap-5 p-5 overflow-hidden">
        {/* Left: Voice Studio */}
        <div className="w-80 flex-shrink-0 h-full">
          <VoiceStudio
            samples={samples}
            profile={profile}
            processing={processing}
            onAddSample={handleAddSample}
            onDeleteSample={handleDeleteSample}
            onProcess={handleProcess}
            onClearProfile={handleClearProfile}
          />
        </div>

        {/* Right: Voice Calibration Chat */}
        <div className="flex-1 min-w-0 h-full">
          <TuningChat
            voiceProfile={profile}
            onSaveProfile={(p) => { setProfile(p); saveProfile(p); }}
          />
        </div>
      </div>
    </div>
  );
}
