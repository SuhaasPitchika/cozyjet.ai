"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useFirestore, useUser } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function CloudSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="currentColor">
      <ellipse cx="100" cy="60" rx="90" ry="30" />
      <ellipse cx="70" cy="45" rx="50" ry="35" />
      <ellipse cx="130" cy="50" rx="45" ry="30" />
      <ellipse cx="100" cy="35" rx="40" ry="30" />
    </svg>
  );
}

function TreeSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 120" className={className} fill="currentColor" style={style}>
      <rect x="24" y="80" width="12" height="40" />
      <polygon points="30,0 5,50 55,50" />
      <polygon points="30,20 2,70 58,70" />
      <polygon points="30,40 0,90 60,90" />
    </svg>
  );
}

function BushSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 50" className={className} fill="currentColor">
      <ellipse cx="40" cy="35" rx="38" ry="25" />
      <ellipse cx="20" cy="30" rx="22" ry="20" />
      <ellipse cx="60" cy="30" rx="22" ry="20" />
      <ellipse cx="40" cy="20" rx="25" ry="22" />
    </svg>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) router.push("/dashboard");
  }, [user, isUserLoading, router]);

  const syncUserProfile = async (firebaseUser: any) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    try {
      const userSnap = await getDoc(userRef);
      const now = new Date().toISOString();
      if (!userSnap.exists()) {
        const displayName = firebaseUser.displayName || "";
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
        });
      } else {
        await setDoc(userRef, { lastLogin: now, updatedAt: now }, { merge: true });
      }
    } catch (error) {
      console.error("Firestore sync error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncUserProfile(result.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      let msg = "Google sign-in failed.";
      if (error.code === "auth/popup-closed-by-user") msg = "Sign-in window was closed.";
      else if (error.code === "auth/popup-blocked") msg = "Enable popups for this site.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
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
      if (result.user) {
        await syncUserProfile(result.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      let msg = "Authentication failed.";
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") msg = "Incorrect email or password.";
      else if (error.code === "auth/email-already-in-use") msg = "Email already registered.";
      else if (error.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      else if (error.code === "auth/user-not-found") msg = "No account with this email.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6bb8e8] via-[#a8d8f0] to-[#c8eeaa]" />

      {/* Animated sun */}
      <motion.div
        animate={{ y: [0, -10, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-[22%] w-20 h-20 rounded-full bg-gradient-to-br from-[#ffe066] to-[#ffaa00]"
        style={{ boxShadow: "0 0 70px 24px rgba(255,210,0,0.45)" }}
      />

      {/* Rays */}
      {[0,30,60,90,120,150,200,240,300,330].map((deg, i) => (
        <motion.div
          key={deg}
          animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          className="absolute bg-yellow-200/40 rounded-full"
          style={{
            width: 60, height: 2,
            top: "calc(10% + 40px)",
            right: "calc(22% + 40px)",
            transformOrigin: "-40px 1px",
            transform: `rotate(${deg}deg)`,
          }}
        />
      ))}

      {/* Background clouds */}
      <motion.div animate={{ x: [0, 35, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute top-14 left-[3%]">
        <CloudSVG className="w-52 h-20 text-white/85" />
      </motion.div>
      <motion.div animate={{ x: [0, -25, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }} className="absolute top-6 right-[8%]">
        <CloudSVG className="w-60 h-24 text-white/75" />
      </motion.div>
      <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-28 left-[38%]">
        <CloudSVG className="w-40 h-14 text-white/60" />
      </motion.div>
      <motion.div animate={{ x: [0, -18, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 right-[32%]">
        <CloudSVG className="w-48 h-18 text-white/55" />
      </motion.div>

      {/* Green ground */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#2d5a1e] via-[#3d7a28] to-transparent" />
      <div
        className="absolute bottom-0 inset-x-0 h-32"
        style={{
          background: "linear-gradient(to top, #1e3d14, #3a6e22)",
          borderRadius: "60% 60% 0 0 / 40% 40% 0 0",
        }}
      />

      {/* Far background trees */}
      {[2,7,13,80,88,94].map((left, i) => (
        <div key={i} className="absolute bottom-28" style={{ left: `${left}%`, opacity: 0.45 + i * 0.03 }}>
          <TreeSVG className={`text-[#2a5018] w-${8+i} h-${20+i*2}`} style={{ width: 30+i*4, height: 70+i*6 }} />
        </div>
      ))}

      {/* Foreground trees */}
      <div className="absolute bottom-14 -left-2">
        <TreeSVG className="text-[#1a3c0e]" style={{ width: 70, height: 160 }} />
      </div>
      <div className="absolute bottom-14 -right-2">
        <TreeSVG className="text-[#1a3c0e]" style={{ width: 75, height: 170 }} />
      </div>
      <div className="absolute bottom-16 left-[11%]">
        <TreeSVG className="text-[#1e4a10]" style={{ width: 50, height: 130 }} />
      </div>
      <div className="absolute bottom-16 right-[13%]">
        <TreeSVG className="text-[#1e4a10]" style={{ width: 55, height: 140 }} />
      </div>
      <div className="absolute bottom-16 left-[22%]">
        <TreeSVG className="text-[#254e14]" style={{ width: 40, height: 110 }} />
      </div>
      <div className="absolute bottom-16 right-[24%]">
        <TreeSVG className="text-[#254e14]" style={{ width: 44, height: 115 }} />
      </div>

      {/* Foreground bushes */}
      <BushSVG className="absolute bottom-8 left-[5%] w-24 h-14 text-[#2a6a1a]" />
      <BushSVG className="absolute bottom-8 right-[6%] w-28 h-16 text-[#2a6a1a]" />
      <BushSVG className="absolute bottom-6 left-[26%] w-18 h-10 text-[#38882a]" />
      <BushSVG className="absolute bottom-6 right-[28%] w-20 h-11 text-[#38882a]" />

      {/* Foreground clouds (closer) */}
      <motion.div animate={{ x: [0, 22, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[32%] -left-8">
        <CloudSVG className="w-44 h-18 text-white/90" />
      </motion.div>
      <motion.div animate={{ x: [0, -20, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[26%] -right-8">
        <CloudSVG className="w-48 h-20 text-white/88" />
      </motion.div>

      {/* Floating birds */}
      {[15,40,65].map((left, i) => (
        <motion.div
          key={i}
          animate={{ x: [0, 30, 60, 90], y: [0, -8, -4, -10], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 8+i*2, repeat: Infinity, delay: i*3, ease: "linear" }}
          className="absolute text-[#1a3c0e]/60 text-xs"
          style={{ top: `${20+i*5}%`, left: `${left}%` }}
        >
          ˄ ˄
        </motion.div>
      ))}

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 w-full max-w-sm mx-4"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.60)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 12px 80px rgba(30,80,10,0.18), 0 2px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.72)",
          }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-2 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, #4a9a2a, #2d6a18)",
                boxShadow: "0 6px 24px rgba(74,154,42,0.35)",
              }}
            >
              ✈️
            </motion.div>
            <h1 className="text-xl font-bold text-[#1a3c0e] tracking-tight">CozyJet Studio</h1>
            <p className="text-xs text-[#3a7a20]/65 mt-1">Your AI agentic workspace</p>
          </div>

          {/* Tab toggle */}
          <div className="flex mx-8 mt-5 rounded-xl bg-white/40 p-1 gap-1">
            {["Sign Up", "Sign In"].map((label, idx) => (
              <button
                key={label}
                onClick={() => setIsLogin(idx === 1)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  (idx === 1) === isLogin
                    ? "bg-white text-[#1e4010] shadow-sm"
                    : "text-[#4a7a30]/55 hover:text-[#3a6020]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmailAuth} className="px-8 pt-5 pb-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#1e4010]/60 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl bg-white/55 border border-white/80 text-sm text-[#1e3010] placeholder:text-[#4a7a30]/35 outline-none focus:ring-2 focus:ring-[#4a9030]/25 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#1e4010]/60 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-white/55 border border-white/80 text-sm text-[#1e3010] placeholder:text-[#4a7a30]/35 outline-none focus:ring-2 focus:ring-[#4a9030]/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7a30]/45 hover:text-[#4a7a30] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3a8a22, #2a6018)" }}
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="px-8 pb-2">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#4a7a30]/12" />
              <span className="text-[10px] text-[#4a7a30]/45 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-[#4a7a30]/12" />
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-white/75 border border-white/90 text-sm font-semibold text-[#1e3010] hover:bg-white disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <p className="text-center text-[10px] text-[#4a7a30]/45 pb-7 px-8 mt-1">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-[#3a6020]">Terms</span>
            {" & "}
            <span className="underline cursor-pointer hover:text-[#3a6020]">Privacy Policy</span>
          </p>
        </div>

        <p className="text-center text-[11px] text-white/75 mt-4 font-medium drop-shadow-sm">
          CozyJet.AI · Autonomous Marketing & Productivity
        </p>
      </motion.div>
    </div>
  );
}
