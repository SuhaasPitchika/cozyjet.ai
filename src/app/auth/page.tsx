"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";
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
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

/* ── Animated gradient orbs ── */
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary large orb */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 60, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.2) 50%, transparent 80%)",
          filter: "blur(60px)",
        }}
      />
      {/* Secondary orb */}
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 60, -30, 0], scale: [1, 0.85, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(168,85,247,0.18) 50%, transparent 80%)",
          filter: "blur(70px)",
        }}
      />
      {/* Accent orb top-right */}
      <motion.div
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -50, 0], scale: [1, 1.2, 0.8, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-20 right-20 w-[350px] h-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.12) 50%, transparent 80%)",
          filter: "blur(50px)",
        }}
      />
      {/* Center shimmer */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

/* ── Floating particles ── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: 1 + (i % 3),
  x: (i * 37 + 11) % 100,
  y: (i * 23 + 17) % 100,
  duration: 12 + (i % 8) * 2,
  delay: (i % 7) * 1.5,
}));

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.5, 0.15],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Grid lines ── */
function GridLines() {
  return (
    <div
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
  );
}

/* ── Google icon ── */
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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName: displayName.split(" ")[0] || "Studio",
          lastName: displayName.split(" ").slice(1).join(" ") || "User",
          onboarded: false,
          lastLogin: now,
          createdAt: now,
          updatedAt: now,
          skippyEnabled: true,
          flippoEnabled: true,
          snooksEnabled: true,
          subscription_tier: "free",
        });
      } else {
        await setDoc(userRef, { lastLogin: now, updatedAt: now }, { merge: true });
      }
    } catch (err) {
      console.error("Firestore sync error:", err);
    }
  };

  const handleGoogle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) { await syncUserProfile(result.user); router.push("/dashboard/skippy"); }
    } catch (err: any) {
      let msg = "Google sign-in failed.";
      if (err.code === "auth/popup-closed-by-user") msg = "Sign-in window was closed.";
      else if (err.code === "auth/popup-blocked") msg = "Please enable popups for this site.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email || !password) return;
    setIsLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
      if (result.user) { await syncUserProfile(result.user); router.push("/dashboard/skippy"); }
    } catch (err: any) {
      let msg = "Authentication failed.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") msg = "Incorrect email or password.";
      else if (err.code === "auth/email-already-in-use") msg = "An account with this email already exists.";
      else if (err.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      else if (err.code === "auth/user-not-found") msg = "No account found with this email.";
      else if (err.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      toast({ title: "Authentication Error", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const inputClass = (field: string) =>
    [
      "w-full h-12 px-4 rounded-xl text-sm text-white outline-none transition-all duration-200",
      "placeholder-white/20 bg-transparent",
      focusedField === field
        ? "border border-white/20 shadow-[0_0_0_2px_rgba(139,92,246,0.2)] bg-white/[0.08]"
        : "border border-white/8 hover:border-white/14 bg-white/[0.04]",
    ].join(" ");

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Deep dark background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0a0015 0%, #0d0020 25%, #080018 50%, #0c001a 75%, #06000f 100%)",
        }}
      />

      {/* Secondary gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.1) 0%, transparent 55%)",
        }}
      />

      <GridLines />
      <GradientOrbs />
      <Particles />

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 w-full max-w-[420px] mx-4"
      >
        {/* Glow behind card */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.25) 0%, transparent 70%)",
            filter: "blur(30px)",
            transform: "translateY(-20px) scale(0.9)",
          }}
        />

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Top gradient stripe */}
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(99,102,241,0.6), transparent)",
            }}
          />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            {/* Logo */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(99,102,241,0.9) 100%)",
                boxShadow: "0 8px 32px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <span className="text-white font-bold text-lg tracking-tight">CJ</span>
            </motion.div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              {isLogin ? "Welcome back" : "Join CozyJet"}
            </h1>
            <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
              {isLogin ? "Sign in to your AI agentic studio" : "Your AI-powered productivity studio"}
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex mx-8 mb-6 rounded-xl p-1 gap-1"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[{ label: "Create account", login: false }, { label: "Sign in", login: true }].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setIsLogin(tab.login)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={
                  isLogin === tab.login
                    ? {
                        background: "rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.9)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }
                    : { color: "rgba(255,255,255,0.35)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleEmail} className="px-8 space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass("name")}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass("password")} pr-11`}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-1">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.1) inset",
                }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                {isLoading ? (
                  <><Loader2 size={15} className="animate-spin" /><span>Processing...</span></>
                ) : (
                  <><span>{isLogin ? "Sign In" : "Create Account"}</span><ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </motion.button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 px-8 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[10px] text-white/25 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Google */}
          <div className="px-8 pb-8">
            <motion.button
              onClick={handleGoogle}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white/80 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset",
              }}
            >
              <div className="group-hover:scale-110 transition-transform">
                <GoogleIcon />
              </div>
              <span>Continue with Google</span>
            </motion.button>

            <p className="text-center text-[10px] text-white/20 mt-5 leading-relaxed">
              By continuing you agree to our{" "}
              <span className="text-white/35 underline cursor-pointer hover:text-white/55 transition-colors">Terms</span>
              {" & "}
              <span className="text-white/35 underline cursor-pointer hover:text-white/55 transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-white/25 mt-5 tracking-wide"
        >
          CozyJet.AI · Autonomous Marketing & Productivity Studio
        </motion.p>
      </motion.div>
    </div>
  );
}
