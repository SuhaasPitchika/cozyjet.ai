"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Sparkles, X, Zap, Eye, EyeOff, Plus, Check,
  RefreshCw, ArrowRight,
} from "lucide-react";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { useRouter } from "next/navigation";

/* ── Integration definitions ── */
const INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    desc: "Commits, PRs & releases",
    color: "#171717",
    bg: "#f6f8fa",
    connected: true,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "notion",
    name: "Notion",
    desc: "Pages, docs & databases",
    color: "#000000",
    bg: "#f7f6f3",
    connected: true,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </svg>
    ),
  },
  {
    id: "figma",
    name: "Figma",
    desc: "Design files & components",
    color: "#a259ff",
    bg: "#faf5ff",
    connected: false,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.02s1.354 3.018 3.019 3.018h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019h3.117V8.981H8.148zm-3.019 8.49c0-1.665 1.355-3.019 3.019-3.019s3.019 1.354 3.019 3.019-1.355 3.019-3.019 3.019-3.019-1.355-3.019-3.019zm3.019-1.548c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019 3.019-1.354 3.019-3.019-1.355-3.019-3.019-3.019zm7.734-3.491c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49-4.49-2.014-4.49-4.49 2.014-4.49 4.49-4.49zm0 1.471c-1.665 0-3.019 1.354-3.019 3.019s1.354 3.019 3.019 3.019 3.019-1.354 3.019-3.019-1.354-3.019-3.019-3.019z" />
      </svg>
    ),
  },
  {
    id: "gdrive",
    name: "Google Drive",
    desc: "Docs, sheets & slides",
    color: "#4285f4",
    bg: "#f0f7ff",
    connected: true,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M4.433 22.396l2.266-3.925H22.5l-2.267 3.925zm3.995-6.925L6.16 12.008 14.255 1.5h4.534zm-6.928 3l2.267-3.925L8 8.075 1.5 19.471z" />
      </svg>
    ),
  },
  {
    id: "gcal",
    name: "Google Calendar",
    desc: "Events & meetings",
    color: "#1a73e8",
    bg: "#f0f5ff",
    connected: true,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-9.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm.5-4h-1v2.12l1.75 1.06.5-.87-1.25-.76V14z" />
      </svg>
    ),
  },
  {
    id: "linear",
    name: "Linear",
    desc: "Issues & projects",
    color: "#5E6AD2",
    bg: "#f2f3ff",
    connected: false,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M3.533 7.773a8.44 8.44 0 009.694 9.694l-9.694-9.694zM2.8 6.067l15.133 15.133a8.5 8.5 0 01-4.93 1.8L2.8 6.067zm18.4 10.733l-14.1-14.1A8.44 8.44 0 0121.2 16.8zM6.067 2.8l16.2 16.2a8.44 8.44 0 00-16.2-16.2z" />
      </svg>
    ),
  },
  {
    id: "slack",
    name: "Slack",
    desc: "Team conversations",
    color: "#4A154B",
    bg: "#fdf5ff",
    connected: false,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    id: "vscode",
    name: "VS Code",
    desc: "Editor activity & commits",
    color: "#0078d4",
    bg: "#f0f7ff",
    connected: false,
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 00-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 00-1.276.057L.327 7.261A1 1 0 00.326 8.74L3.899 12 .326 15.26a1 1 0 00.001 1.479L1.65 17.94a.999.999 0 001.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 001.704.29l4.942-2.377A1.5 1.5 0 0024 20.06V3.939a1.5 1.5 0 00-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
      </svg>
    ),
  },
];

interface ContentSeed {
  id: string;
  source: string;
  title: string;
  summary: string;
  platform_fit: string[];
}

const SAMPLE_SEEDS: ContentSeed[] = [
  { id: "s1", source: "GitHub", title: "JWT auth with refresh token support shipped", summary: "You shipped JWT authentication with refresh token support — a security implementation junior developers struggle with and seniors love seeing documented.", platform_fit: ["LinkedIn", "Twitter"] },
  { id: "s2", source: "Notion", title: "Q2 product roadmap updated with 8 features", summary: "You updated your product roadmap prioritized by real user feedback. A behind-the-scenes look at how solo founders make tough trade-offs.", platform_fit: ["LinkedIn", "Instagram"] },
  { id: "s3", source: "Google Drive", title: "New dashboard UI design finalized", summary: "You designed a glassmorphism dashboard component. The decisions you made — contrast, blur depth, color hierarchy — are exactly what designers want documented.", platform_fit: ["Twitter", "Instagram"] },
];

function IntegrationCard({ integration, onToggle }: {
  integration: typeof INTEGRATIONS[0];
  onToggle: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
      className="relative rounded-2xl p-4 cursor-pointer group transition-all"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: integration.connected
          ? `1.5px solid ${integration.color}30`
          : "1.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: integration.bg,
              color: integration.color,
              border: `1px solid ${integration.color}20`,
            }}
          >
            {integration.logo}
          </div>
          <div>
            <p className="text-[13px] font-bold text-black/80">{integration.name}</p>
            <p className="text-[11px] text-black/40 mt-0.5">{integration.desc}</p>
          </div>
        </div>

        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggle(integration.id); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={
            integration.connected
              ? { background: `${integration.color}15`, border: `1px solid ${integration.color}30` }
              : { background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }
          }
        >
          {integration.connected
            ? <Check size={14} style={{ color: integration.color }} />
            : <Plus size={14} className="text-black/35" />
          }
        </motion.button>
      </div>

      {integration.connected && (
        <div className="mt-3 flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10b981" }}
          />
          <span className="text-[10px] font-semibold text-emerald-600">Connected · syncing now</span>
        </div>
      )}
    </motion.div>
  );
}

function SeedCard({ seed, onGenerate, onDismiss }: {
  seed: ContentSeed;
  onGenerate: (seed: ContentSeed) => void;
  onDismiss: (id: string) => void;
}) {
  const intg = INTEGRATIONS.find((i) => i.name === seed.source || i.id === seed.source.toLowerCase());
  const color = intg?.color || "#6366f1";
  const bg = intg?.bg || "#f5f5ff";

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      className="rounded-2xl p-4 group"
      style={{
        background: "rgba(255,255,255,0.68)",
        backdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
            {intg?.logo || <Zap size={14} />}
          </div>
          <div>
            <span className="text-[11px] font-bold" style={{ color }}>{seed.source}</span>
            <div className="flex gap-1 mt-0.5">
              {seed.platform_fit?.map((p) => (
                <span key={p} className="text-[9px] font-medium px-1.5 py-px rounded-full bg-black/5 text-black/35">{p}</span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDismiss(seed.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center bg-black/5 hover:bg-red-50"
        >
          <X size={11} className="text-black/30 hover:text-red-400" />
        </button>
      </div>

      <h3 className="text-[13px] font-semibold text-black/80 leading-snug mb-1">{seed.title}</h3>
      <p className="text-[11px] text-black/45 leading-relaxed mb-3">{seed.summary}</p>

      <motion.button
        onClick={() => onGenerate(seed)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}
      >
        <Sparkles size={11} />
        Generate Content
        <ArrowRight size={10} />
      </motion.button>
    </motion.div>
  );
}

export default function SkippyPage() {
  const { skippyActive, setSkippyActive, setAssistanceMsg, setSkippyContext } = useDashboardStore();
  const router = useRouter();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [seeds, setSeeds] = useState<ContentSeed[]>([]);
  const [showSample, setShowSample] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const connectedCount = integrations.filter((i) => i.connected).length;

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => i.id === id ? { ...i, connected: !i.connected } : i)
    );
  };

  const captureAndAnalyze = useCallback(async () => {
    setIsCapturing(true);
    setApiError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => { video.play(); setTimeout(resolve, 600); };
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(video.videoWidth || 1280, 1280);
      canvas.height = Math.round(canvas.width * ((video.videoHeight || 720) / (video.videoWidth || 1280)));
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((t) => t.stop());
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      const base64 = dataUrl.split(",")[1];

      const res = await fetch("/api/ai/screen-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (data.analysis) {
        setSkippyContext(data.analysis);
        if (Array.isArray(data.analysis.content_seeds) && data.analysis.content_seeds.length > 0) {
          setSeeds(data.analysis.content_seeds);
          setShowSample(false);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name !== "NotAllowedError") setApiError("Capture failed. Please try again.");
      setSkippyActive(false);
    } finally {
      setIsCapturing(false);
    }
  }, [setSkippyActive, setSkippyContext]);

  const handleToggle = async () => {
    if (skippyActive) {
      setSkippyActive(false);
    } else {
      setSkippyActive(true);
      await captureAndAnalyze();
    }
  };

  const handleGenerate = (seed: ContentSeed) => {
    setAssistanceMsg(`Generate content for: ${seed.title}. Context: ${seed.summary}`);
    router.push("/dashboard/meta");
  };

  const displaySeeds = showSample ? SAMPLE_SEEDS : seeds;

  return (
    <div
      className="h-full flex overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f5f0eb 0%, #ede8e3 40%, #f0ece7 100%)" }}
    >
      {/* Left — Integrations */}
      <div className="w-[420px] shrink-0 flex flex-col overflow-y-auto border-r" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        {/* Header */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <span style={{ fontSize: 18 }}>👁</span>
              </div>
              <div>
                <h1 className="text-[17px] font-bold text-black/80">Skippy</h1>
                <p className="text-[11px] text-black/35">Observer Agent</p>
              </div>
            </div>

            {/* Observer toggle */}
            <motion.button
              onClick={handleToggle}
              disabled={isCapturing}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
              style={
                skippyActive
                  ? { background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1.5px solid rgba(99,102,241,0.3)" }
                  : { background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.45)", border: "1.5px solid rgba(0,0,0,0.08)" }
              }
            >
              {isCapturing ? (
                <><RefreshCw size={13} className="animate-spin" />Scanning…</>
              ) : skippyActive ? (
                <><Eye size={13} />Active</>
              ) : (
                <><EyeOff size={13} />Observe</>
              )}
            </motion.button>
          </div>

          <p className="text-[12px] text-black/40 mt-4 leading-relaxed">
            Connect your tools so Skippy can watch your work silently and extract content seeds worth sharing — without you having to document anything manually.
          </p>

          {apiError && (
            <div className="mt-3 px-3 py-2.5 rounded-xl text-xs text-red-500 bg-red-50 border border-red-100">
              {apiError}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="px-6 mb-5">
          <div
            className="flex items-center gap-6 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div className="text-center">
              <p className="text-lg font-bold text-black/75">{connectedCount}</p>
              <p className="text-[10px] text-black/35">Connected</p>
            </div>
            <div className="h-8 w-px bg-black/08" />
            <div className="text-center">
              <p className="text-lg font-bold text-black/75">{integrations.length - connectedCount}</p>
              <p className="text-[10px] text-black/35">Available</p>
            </div>
            <div className="h-8 w-px bg-black/08" />
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "#6366f1" }}>{displaySeeds.length}</p>
              <p className="text-[10px] text-black/35">Seeds ready</p>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="px-6 mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Integrations</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-[10px] font-semibold text-black/35 hover:text-black/60 transition-colors"
          >
            <Plus size={11} />
            Request new
          </motion.button>
        </div>

        {/* Integration grid */}
        <div className="px-6 pb-6 grid grid-cols-1 gap-3">
          {integrations.map((intg, i) => (
            <motion.div key={intg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <IntegrationCard integration={intg} onToggle={toggleIntegration} />
            </motion.div>
          ))}
        </div>

        {/* Privacy */}
        <div className="px-6 pb-6">
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.8)" }}
          >
            <ShieldCheck size={13} className="text-black/25 shrink-0" />
            <p className="text-[10px] text-black/35 leading-relaxed">
              Privacy-first. Skippy reads your activity locally. One snapshot, never video. PII is blocked before leaving your device.
            </p>
          </div>
        </div>
      </div>

      {/* Right — Content Seeds Feed */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="px-6 pt-7 pb-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div>
            <h2 className="text-[16px] font-bold text-black/75">Content Seeds</h2>
            <p className="text-[11px] text-black/35 mt-0.5">
              {showSample ? "Sample seeds — activate Skippy to generate from your workspace" : `${displaySeeds.length} seed${displaySeeds.length !== 1 ? "s" : ""} ready`}
            </p>
          </div>
          {showSample && (
            <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)" }}>
              Sample
            </span>
          )}
        </div>

        <div className="flex-1 px-6 py-5 space-y-3">
          <AnimatePresence mode="popLayout">
            {displaySeeds.map((seed) => (
              <SeedCard
                key={seed.id}
                seed={seed}
                onGenerate={handleGenerate}
                onDismiss={(id) => {
                  if (showSample) setShowSample(false);
                  else setSeeds((prev) => prev.filter((s) => s.id !== id));
                }}
              />
            ))}
          </AnimatePresence>

          {displaySeeds.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
                <Eye size={24} className="text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black/40">No seeds yet</p>
                <p className="text-[11px] text-black/25 mt-1 max-w-xs leading-relaxed">
                  Toggle Observer and share your screen to extract content seeds from your workspace.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
