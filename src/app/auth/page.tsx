
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const skyImage = PlaceHolderImages.find(img => img.id === "auth-sky");

  const syncUserProfile = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New User Identity Initialization
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        authProviderId: user.providerData[0]?.providerId || "unknown",
        firstName: user.displayName?.split(" ")[0] || "Studio",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "User",
        onboarded: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        localOnlyMode: true,
        anonymizedAnalytics: true,
        skippyEnabled: true,
        flippoEnabled: true,
        snooksEnabled: true,
        deepWorkSessionLength: 25,
        stuckDetectionSensitivity: 50,
        appearanceTheme: "light",
        skippyEncryptedDataBlob: ""
      });
    } else {
      // Returning User - Update Session
      await setDoc(userRef, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
      toast({
        title: "Identity Verified",
        description: `Welcome back, ${result.user.displayName}`,
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Auth Failure",
        description: error.message || "Could not complete Google verification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
      await syncUserProfile(result.user);
      toast({
        title: isLogin ? "Access Granted" : "Identity Initialized",
        description: `Studio secure connection established.`,
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message || "Invalid credentials or system error.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-pixel">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={skyImage?.imageUrl || "https://picsum.photos/seed/sky-dawn/1920/1080"}
          alt="Cinematic Sky"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[4px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 z-20 mx-4"
      >
        <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/60">
          <div className="mb-10 text-center">
            <h1 className="text-lg font-bold mb-3 text-black uppercase tracking-tight">
              {isLogin ? "Welcome Back" : "Initialize Identity"}
            </h1>
            <p className="text-black/40 text-[8px] uppercase font-bold tracking-[0.2em]">
              Autonomous Studio Access
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase font-bold tracking-widest text-black/60 ml-2">Email Hash</Label>
              <Input 
                type="email" 
                required 
                placeholder="USER@COZYJET.AI"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50 border-white h-12 rounded-2xl focus:ring-black/5 text-[8px] uppercase font-bold" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[8px] uppercase font-bold tracking-widest text-black/60 ml-2">Security Passcode</Label>
              <Input 
                type="password" 
                required 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 border-white h-12 rounded-2xl focus:ring-black/5 text-[8px]" 
              />
            </div>

            <Button 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-[8px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
            >
              {isLoading ? "PROCESSSING..." : (isLogin ? "ENTER STUDIO" : "CREATE ACCOUNT")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-black/5"></div>
              <span className="flex-shrink mx-4 text-[8px] text-black/30 font-bold">VERIFY VIA</span>
              <div className="flex-grow border-t border-black/5"></div>
            </div>

            <Button 
              type="button"
              variant="outline" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl border-white bg-white/50 hover:bg-white text-black font-bold text-[8px] uppercase tracking-widest transition-all"
            >
              Continue with Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[8px] text-black/40 font-bold uppercase tracking-widest hover:text-black transition-colors"
            >
              {isLogin ? "New to the Studio? Register" : "Existing Identity? Log In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
