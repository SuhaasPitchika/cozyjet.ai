"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useFirestore, useUser } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowRight, RefreshCw } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59,130,246,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(236,72,153,0.40) 0%, transparent 60%), radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%), #050814",
            "radial-gradient(ellipse 70% 80% at 70% 20%, rgba(99,102,241,0.50) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 20% 80%, rgba(236,72,153,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%), #050814",
            "radial-gradient(ellipse 90% 50% at 50% 80%, rgba(59,130,246,0.40) 0%, transparent 60%), radial-gradient(ellipse 50% 90% at 10% 30%, rgba(168,85,247,0.40) 0%, transparent 60%), radial-gradient(ellipse 70% 70% at 80% 20%, rgba(236,72,153,0.30) 0%, transparent 60%), #050814",
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(59,130,246,0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(236,72,153,0.40) 0%, transparent 60%), radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%), #050814",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "#050814" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(59,130,246,0.22)", top: "-10%", left: "-10%" }}
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(236,72,153,0.20)", bottom: "-10%", right: "-10%" }}
        animate={{ x: [0, -50, 20, 0], y: [0, -30, -70, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none"
        style={{ background: "rgba(168,85,247,0.18)", top: "40%", left: "40%" }}
        animate={{ x: [0, 40, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[60px] pointer-events-none"
        style={{ background: "rgba(255,255,255,0.06)", top: "20%", right: "25%" }}
        animate={{ x: [0, -30, 50, 0], y: [0, 60, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map((c) => (
            <span key={c.label} className="text-[9px] font-medium transition-colors duration-200"
              style={{ color: c.ok ? "#86efac" : "rgba(255,255,255,0.25)" }}>
              {c.ok ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className="text-[10px] font-semibold" style={{ color: colors[score] }}>{labels[score]}</span>
        )}
      </div>
    </div>
  );
}

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((x, idx) => idx === i ? d : x).join("").slice(0, 6);
    onChange(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    if (pasted.length > 0) inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0,1,2,3,4,5].map((i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: digits[i] ? "1.5px solid rgba(139,92,246,0.7)" : "1.5px solid rgba(255,255,255,0.12)",
            color: "#fff",
            boxShadow: digits[i] ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
            caretColor: "#a78bfa",
          }}
        />
      ))}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

const glassCard: React.CSSProperties = {
  background: "rgba(8,8,22,0.65)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 80px rgba(59,130,246,0.08)",
};

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const pendingUserRef = useRef<any>(null);

  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) router.push("/dashboard/skippy");
  }, [user, isUserLoading, router]);

  const syncUserProfile = async (firebaseUser: any) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    try {
      const snap = await getDoc(userRef);
      const now = new Date().toISOString();
      const displayName = firebaseUser.displayName || name || "";
      if (!snap.exists()) {
        await setDoc(userRef, {
          id: firebaseUser.uid, email: firebaseUser.email || "",
          firstName: displayName.split(" ")[0] || "Studio",
          lastName: displayName.split(" ").slice(1).join(" ") || "User",
          onboarded: false, lastLogin: now, createdAt: now, updatedAt: now,
          skippyEnabled: true, flippoEnabled: true, snooksEnabled: true, subscription_tier: "free",
        });
      } else {
        await setDoc(userRef, { lastLogin: now, updatedAt: now }, { merge: true });
      }
    } catch (err) { console.error("Firestore sync error:", err); }
  };

  const handleGoogle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope("email"); provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) { await syncUserProfile(result.user); router.push("/dashboard/skippy"); }
    } catch (err: any) {
      let msg = "Google sign-in failed. Please try again.";
      if (err.code === "auth/popup-closed-by-user") msg = "Sign-in window was closed.";
      else if (err.code === "auth/popup-blocked") msg = "Please enable popups for this site.";
      toast({ title: "Sign-in Error", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const sendVerificationCode = async (emailAddr: string, displayName: string) => {
    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailAddr, name: displayName }),
    });
    const data = await res.json();
    if (data.devCode) {
      setDevCode(data.devCode);
      toast({ title: "Dev Mode", description: `No SMTP configured. Your code is: ${data.devCode}` });
    } else {
      setDevCode(null);
    }
    return data.success;
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!isValidEmail(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (mode === "signup" && !isStrongPassword(password)) {
      toast({ title: "Weak Password", description: "Password needs 8+ chars, uppercase, number, and special character.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user) { await syncUserProfile(result.user); router.push("/dashboard/skippy"); }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          pendingUserRef.current = result.user;
          await syncUserProfile(result.user);
          await sendVerificationCode(email, name);
          setStep("verify");
        }
      }
    } catch (err: any) {
      let msg = "Authentication failed.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") msg = "Incorrect email or password.";
      else if (err.code === "auth/email-already-in-use") msg = "An account with this email already exists.";
      else if (err.code === "auth/user-not-found") msg = "No account found with this email.";
      else if (err.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      else if (err.code === "auth/too-many-requests") msg = "Too many attempts. Please wait a moment.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleVerifyCode = async () => {
    if (isVerifying || code.length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/auth/send-verification?email=${encodeURIComponent(email)}&code=${code}`);
      const data = await res.json();
      if (data.valid) {
        toast({ title: "Verified!", description: "Welcome to CozyJet Studio." });
        router.push("/dashboard/skippy");
      } else {
        toast({ title: "Invalid Code", description: data.reason === "Code expired" ? "Code expired. Request a new one." : "Incorrect code. Please try again.", variant: "destructive" });
        setCode("");
      }
    } catch {
      toast({ title: "Error", description: "Verification failed. Please try again.", variant: "destructive" });
    } finally { setIsVerifying(false); }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setCode("");
    try {
      await sendVerificationCode(email, name);
      toast({ title: "Code Sent", description: "A new verification code has been sent." });
    } catch {
      toast({ title: "Error", description: "Could not resend. Please wait a moment.", variant: "destructive" });
    } finally { setIsResending(false); }
  };

  useEffect(() => {
    if (code.length === 6) handleVerifyCode();
  }, [code]);

  const inputBase = "w-full h-11 px-4 rounded-xl text-sm outline-none transition-all duration-200 placeholder-white/25 border text-white/90 font-medium";
  const inputFocused = "border-violet-400/60 shadow-[0_0_0_2px_rgba(139,92,246,0.18)]";
  const inputIdle = "border-white/12 hover:border-white/22";
  const inputBg = "bg-white/[0.07]";
  const inputClass = (f: string) => [inputBase, inputBg, focused === f ? inputFocused : inputIdle].join(" ");

  if (step === "verify") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <AnimatedGradientBg />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 w-full max-w-[420px] mx-4"
        >
          <div className="relative rounded-3xl p-8 text-center" style={glassCard}>
            <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(99,102,241,0.7), transparent)" }} />

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset" }}
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M16 8V5a4 4 0 0 0-8 0v3" />
                <circle cx="12" cy="14" r="1.5" fill="currentColor" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-bold text-white mb-2">Enter your code</h2>
            <p className="text-sm text-white/40 mb-1">Verification code sent to</p>
            <p className="text-sm font-semibold text-violet-400 mb-6">{email}</p>

            {devCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-3 mb-4 text-xs text-amber-300 font-mono"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
              >
                Dev mode · Code: <strong className="text-amber-200 text-sm tracking-widest">{devCode}</strong>
              </motion.div>
            )}

            <div className="mb-6">
              <CodeInput value={code} onChange={setCode} />
            </div>

            <motion.button
              onClick={handleVerifyCode}
              disabled={isVerifying || code.length !== 6}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 rounded-xl font-semibold text-white text-sm mb-4 flex items-center justify-center gap-2.5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", boxShadow: "0 4px 24px rgba(124,58,237,0.5)" }}
            >
              {isVerifying
                ? <><Loader2 size={15} className="animate-spin" /><span>Verifying...</span></>
                : <><span>Verify & Enter Studio</span><ArrowRight size={14} /></>}
            </motion.button>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center justify-center gap-1.5 mx-auto text-xs text-white/25 hover:text-violet-400 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={11} className={isResending ? "animate-spin" : ""} />
              {isResending ? "Sending..." : "Resend code"}
            </button>

            <p className="text-[10px] text-white/15 mt-4">Code expires in 10 minutes</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <AnimatedGradientBg />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 w-full max-w-[420px] mx-4"
      >
        <div className="relative rounded-3xl overflow-hidden" style={glassCard}>
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(236,72,153,0.5), transparent)" }} />

          <div className="px-8 pt-8 pb-5 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #ec4899 100%)",
                boxShadow: "0 8px 32px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-xs text-white/35 mt-1.5 leading-relaxed">
              {mode === "login" ? "Sign in to your AI agentic studio" : "Your AI-powered marketing & productivity studio"}
            </p>
          </div>

          <div className="flex mx-8 mb-6 rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {[{ label: "Sign In", val: "login" as const }, { label: "Create Account", val: "signup" as const }].map((tab) => (
              <button
                key={tab.val}
                onClick={() => { setMode(tab.val); setPassword(""); }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={
                  mode === tab.val
                    ? { background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(236,72,153,0.6))", color: "white", boxShadow: "0 2px 12px rgba(124,58,237,0.35)" }
                    : { color: "rgba(255,255,255,0.3)" }
                }
              >{tab.label}</button>
            ))}
          </div>

          <form onSubmit={handleEmail} className="px-8 space-y-4">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className={inputClass("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputClass("email")}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={`${inputClass("password")} pr-11`}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === "signup" && <PasswordStrength password={password} />}
              {mode === "login" && (
                <div className="text-right">
                  <span className="text-[10px] text-violet-400/70 hover:text-violet-400 cursor-pointer transition-colors">Forgot password?</span>
                </div>
              )}
            </div>

            <div className="pt-1">
              <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #ec4899 100%)", boxShadow: "0 4px 24px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.1) inset" }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-200" />
                {isLoading
                  ? <><Loader2 size={15} className="animate-spin" /><span>Please wait...</span></>
                  : <><span>{mode === "login" ? "Sign In" : "Create Account"}</span><ArrowRight size={14} /></>}
              </motion.button>
            </div>
          </form>

          <div className="px-8 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-[10px] text-white/20 font-medium uppercase tracking-widest">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            <motion.button
              onClick={handleGoogle}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-white/75 disabled:opacity-50 transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </motion.button>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        <p className="text-center text-[10px] text-white/20 mt-5 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
