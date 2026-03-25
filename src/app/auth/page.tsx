"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useFirestore, useUser } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, RefreshCw, ArrowLeft } from "lucide-react";

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

function Cloud({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute" style={style}>
      <div className="relative" style={{ width: "100%", height: "100%" }}>
        <div className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ height: "55%", background: "rgba(255,255,255,0.92)", borderRadius: "9999px 9999px 0 0" }} />
        <div className="absolute" style={{
          width: "40%", height: "65%", bottom: "30%", left: "18%",
          background: "rgba(255,255,255,0.88)", borderRadius: "9999px",
        }} />
        <div className="absolute" style={{
          width: "35%", height: "80%", bottom: "30%", left: "42%",
          background: "rgba(255,255,255,0.92)", borderRadius: "9999px",
        }} />
        <div className="absolute" style={{
          width: "28%", height: "55%", bottom: "30%", left: "65%",
          background: "rgba(255,255,255,0.85)", borderRadius: "9999px",
        }} />
      </div>
    </div>
  );
}

function SkyBg() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{
      background: "linear-gradient(180deg, #a8d8f0 0%, #c2e4f5 25%, #d9eef8 55%, #eaf5fb 78%, #f4f9fd 100%)"
    }}>
      <motion.div
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "42%" }}
      >
        <Cloud style={{ width: "28%", height: "75%", bottom: 0, left: "-2%" }} />
        <Cloud style={{ width: "22%", height: "60%", bottom: 0, left: "20%" }} />
        <Cloud style={{ width: "32%", height: "85%", bottom: 0, left: "36%" }} />
        <Cloud style={{ width: "20%", height: "55%", bottom: 0, left: "63%" }} />
        <Cloud style={{ width: "30%", height: "80%", bottom: 0, left: "76%" }} />
      </motion.div>

      <motion.div
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "28%", opacity: 0.65 }}
      >
        <Cloud style={{ width: "18%", height: "70%", bottom: 0, left: "8%" }} />
        <Cloud style={{ width: "24%", height: "90%", bottom: 0, left: "30%" }} />
        <Cloud style={{ width: "16%", height: "60%", bottom: 0, left: "58%" }} />
        <Cloud style={{ width: "26%", height: "80%", bottom: 0, left: "78%" }} />
      </motion.div>

      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 35%, rgba(255,255,255,0.18) 0%, transparent 100%)"
      }} />
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "rgba(0,0,0,0.08)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map((c) => (
            <span key={c.label} className="text-[9px] font-medium transition-colors duration-200"
              style={{ color: c.ok ? "#16a34a" : "rgba(0,0,0,0.3)" }}>
              {c.ok ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span className="text-[10px] font-semibold" style={{ color: colors[score] }}>{labels[score]}</span>}
      </div>
    </div>
  );
}

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);
  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((x, idx) => (idx === i ? d : x)).join("").slice(0, 6);
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
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input key={i} ref={(el) => { inputs.current[i] = el; }} type="text" inputMode="numeric"
          maxLength={1} value={digits[i] || ""} onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)} onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200"
          style={{
            background: "rgba(0,0,0,0.04)",
            caretColor: "#3b82f6",
            border: digits[i] ? "1.5px solid rgba(59,130,246,0.7)" : "1.5px solid rgba(0,0,0,0.12)",
            color: "#111",
          }} />
      ))}
    </div>
  );
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(32px) saturate(200%)",
  WebkitBackdropFilter: "blur(32px) saturate(200%)",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow: "0 24px 64px rgba(80,140,190,0.18), 0 4px 24px rgba(80,140,190,0.12), 0 0 0 1px rgba(255,255,255,0.9) inset",
};

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) router.push("/dashboard/skippy");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        syncUserProfile(result.user).then(() => router.push("/dashboard/skippy"));
      }
    }).catch((err) => {
      if (err.code && err.code !== "auth/no-current-user") {
        console.error("Redirect result error:", err);
      }
    });
  }, [auth]);

  const syncUserProfile = async (firebaseUser: any) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
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
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncUserProfile(result.user);
        router.push("/dashboard/skippy");
      }
    } catch (err: any) {
      console.error("Google popup error:", err.code, err.message);
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, provider);
        } catch {
          toast({ title: "Sign-in Failed", description: "Please allow popups or try again.", variant: "destructive" });
        }
      } else if (err.code === "auth/unauthorized-domain") {
        toast({
          title: "Domain Not Authorized",
          description: "Add this domain to Firebase Console → Authentication → Settings → Authorized domains.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Google Sign-in Error",
          description: err.message || "Please try again or use email/password.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email required", description: "Enter your email address above.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      toast({ title: "Reset email sent!", description: `Check your inbox at ${email}` });
    } catch (err: any) {
      let msg = "Failed to send reset email.";
      if (err.code === "auth/user-not-found") msg = "No account found with this email.";
      else if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
    } else {
      setDevCode(null);
    }
    return data.success;
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const trimmedEmail = email.trim();
    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        if (result.user) {
          await syncUserProfile(result.user);
          router.push("/dashboard/skippy");
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        if (result.user) {
          await syncUserProfile(result.user);
          await sendVerificationCode(trimmedEmail, name);
          setStep("verify");
        }
      }
    } catch (err: any) {
      let msg = "Authentication failed.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") msg = "Incorrect email or password.";
      else if (err.code === "auth/email-already-in-use") msg = "An account with this email already exists. Try signing in.";
      else if (err.code === "auth/user-not-found") msg = "No account found. Create one instead.";
      else if (err.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      else if (err.code === "auth/too-many-requests") msg = "Too many attempts. Wait a moment and try again.";
      else if (err.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      else if (err.message) msg = err.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (isVerifying || code.length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/auth/send-verification?email=${encodeURIComponent(email.trim())}&code=${code}`);
      const data = await res.json();
      if (data.valid) {
        toast({ title: "Verified!", description: "Welcome to CozyJet Studio." });
        router.push("/dashboard/skippy");
      } else {
        const reason = data.reason === "Code expired" ? "Code expired. Request a new one." : "Incorrect code. Try again.";
        toast({ title: "Invalid Code", description: reason, variant: "destructive" });
        setCode("");
      }
    } catch {
      toast({ title: "Error", description: "Verification failed. Please try again.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setCode("");
    try {
      await sendVerificationCode(email.trim(), name);
      toast({ title: "Code Sent", description: "A new verification code has been sent." });
    } catch {
      toast({ title: "Error", description: "Could not resend. Please wait a moment.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (code.length === 6) handleVerifyCode();
  }, [code]);

  const inputBase = "w-full h-11 px-4 rounded-xl text-sm outline-none transition-all duration-200 placeholder-black/25 border text-black/90 font-medium";
  const getInputClass = (f: string) =>
    `${inputBase} bg-black/[0.03] ${focused === f ? "border-blue-400/60" : "border-black/10 hover:border-black/20"}`;

  if (step === "verify") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <SkyBg />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-20 w-full max-w-[420px] mx-4">
          <div className="relative rounded-3xl p-8 text-center" style={glassCard}>
            <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
              style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M16 8V5a4 4 0 0 0-8 0v3" />
                <circle cx="12" cy="14" r="1.5" fill="currentColor" />
              </svg>
            </motion.div>
            <h2 className="text-xl font-bold text-black/90 mb-2">Verify your email</h2>
            <p className="text-sm text-black/40 mb-1">Code sent to</p>
            <p className="text-sm font-semibold text-blue-600 mb-6">{email}</p>
            {devCode && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl p-3 mb-4 text-xs text-amber-700 font-mono"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
                Dev mode · No SMTP configured · Code: <strong className="text-amber-800 text-sm tracking-widest">{devCode}</strong>
              </motion.div>
            )}
            <div className="mb-6">
              <CodeInput value={code} onChange={setCode} />
            </div>
            <motion.button onClick={handleVerifyCode} disabled={isVerifying || code.length !== 6}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full h-12 rounded-xl font-semibold text-white text-sm mb-4 flex items-center justify-center gap-2.5 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
              {isVerifying ? <><Loader2 size={15} className="animate-spin" /><span>Verifying...</span></>
                : <span>Enter Studio</span>}
            </motion.button>
            <button onClick={handleResend} disabled={isResending}
              className="flex items-center justify-center gap-1.5 mx-auto text-xs text-black/30 hover:text-blue-600 transition-colors disabled:opacity-40">
              <RefreshCw size={11} className={isResending ? "animate-spin" : ""} />
              {isResending ? "Sending..." : "Resend code"}
            </button>
            <p className="text-[10px] text-black/25 mt-4">Expires in 10 minutes</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <SkyBg />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-20 w-full max-w-[420px] mx-4">
          <div className="relative rounded-3xl p-8" style={glassCard}>
            <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
              style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)" }} />
            <button onClick={() => { setMode("login"); setResetSent(false); }}
              className="flex items-center gap-1.5 text-xs text-black/35 hover:text-black/70 transition-colors mb-6">
              <ArrowLeft size={12} /> Back to sign in
            </button>
            {!resetSent ? (
              <>
                <h2 className="text-xl font-bold text-black/90 mb-2">Reset your password</h2>
                <p className="text-xs text-black/40 mb-6 leading-relaxed">
                  Enter your email and we'll send a reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-black/35 uppercase tracking-widest">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" className={getInputClass("reset-email")}
                      onFocus={() => setFocused("reset-email")} onBlur={() => setFocused(null)} />
                  </div>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2.5"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                    {isLoading ? <><Loader2 size={15} className="animate-spin" /><span>Sending...</span></>
                      : <span>Send Reset Link</span>}
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-black/90 mb-2">Check your inbox</h2>
                <p className="text-sm text-black/40 leading-relaxed mb-1">Reset link sent to</p>
                <p className="text-sm font-semibold text-emerald-600 mb-6">{email}</p>
                <button onClick={() => { setMode("login"); setResetSent(false); }}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  Back to sign in
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <SkyBg />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 w-full max-w-[420px] mx-4">
        <div className="relative rounded-3xl overflow-hidden" style={glassCard}>
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} />

          <div className="px-8 pt-8 pb-5 text-center">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </motion.div>
            <h1 className="text-xl font-bold text-black/90 tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-xs text-black/35 mt-1.5 leading-relaxed">
              {mode === "login" ? "Sign in to your AI agentic studio" : "Join your AI-powered marketing & productivity studio"}
            </p>
          </div>

          <div className="flex mx-8 mb-6 rounded-xl p-1 gap-1" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}>
            {([{ label: "Sign In", val: "login" }, { label: "Create Account", val: "signup" }] as const).map((tab) => (
              <button key={tab.val} onClick={() => { setMode(tab.val); setPassword(""); }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={mode === tab.val
                  ? { background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.8))", color: "white" }
                  : { color: "rgba(0,0,0,0.35)" }}>
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmail} className="px-8 space-y-4">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="space-y-1.5 overflow-hidden">
                  <label className="text-[10px] font-bold text-black/35 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className={getInputClass("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-widest">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={getInputClass("email")}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-widest">Password</label>
                {mode === "login" && (
                  <button type="button" onClick={() => setMode("forgot")}
                    className="text-[10px] text-blue-500/80 hover:text-blue-600 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={`${getInputClass("password")} pr-11`}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/25 hover:text-black/55 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === "signup" && <PasswordStrength password={password} />}
            </div>

            <div className="pt-1">
              <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2.5 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                {isLoading ? <><Loader2 size={15} className="animate-spin" /><span>Please wait...</span></>
                  : <span>{mode === "login" ? "Sign In" : "Create Account"}</span>}
              </motion.button>
            </div>
          </form>

          <div className="px-8 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
              <span className="text-[10px] text-black/25 font-medium uppercase tracking-widest">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
            </div>
            <motion.button onClick={handleGoogle} disabled={isGoogleLoading || isLoading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-black/70 disabled:opacity-40 transition-all"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)" }}>
              {isGoogleLoading ? <Loader2 size={15} className="animate-spin text-black/40" /> : <GoogleIcon />}
              <span>Continue with Google</span>
            </motion.button>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)" }} />
        </div>
        <p className="text-center text-[10px] text-black/30 mt-5 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
