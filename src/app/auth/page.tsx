"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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

export default function AuthPage() {
  // Default to signup (Create Account) as requested
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const skyImage = PlaceHolderImages.find(img => img.id === "auth-sky");

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, router, isLoading]);

  const syncUserProfile = async (firebaseUser: any) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const now = new Date().toISOString();

    if (!userSnap.exists()) {
      // New Identity Creation
      const firstName = firebaseUser.displayName?.split(" ")[0] || "Studio";
      const lastName = firebaseUser.displayName?.split(" ").slice(1).join(" ") || "User";

      await setDoc(userRef, {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName,
        lastName,
        onboarded: false,
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
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
      // Update existing identity session
      await setDoc(userRef, {
        lastLogin: now,
        updatedAt: now,
      }, { merge: true });
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
      toast({
        title: "Access Granted",
        description: `Welcome back, ${result.user.displayName || "User"}`,
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Failed to connect via Google.",
      });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
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
        title: isLogin ? "Welcome Back" : "Identity Initialized",
        description: "Studio secure connection established.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Email Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Invalid credentials or system timeout.",
      });
      setIsLoading(false);
    }
  };

  if (isUserLoading && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-pixel">
      <div className="absolute inset-0 z-0">
        <Image
          src={skyImage?.imageUrl || "https://picsum.photos/seed/sky-dawn/1920/1080"}
          alt="Atmosphere"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 z-20 mx-4"
      >
        <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/60">
          <div className="mb-10 text-center">
            <h1 className="text-sm font-bold mb-3 text-black uppercase tracking-tight">
              {isLogin ? "Welcome Back" : "New Identity"}
            </h1>
            <p className="text-black/40 text-[6px] uppercase font-bold tracking-[0.2em]">
              Autonomous Studio Access
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div className="space-y-2">
              <Label className="text-[6px] uppercase font-bold tracking-widest text-black/60 ml-2">Email Hash</Label>
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
              <Label className="text-[6px] uppercase font-bold tracking-widest text-black/60 ml-2">Security Passcode</Label>
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
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-black text-white hover:bg-black/90 font-bold text-[8px] uppercase tracking-widest transition-all shadow-xl"
            >
              {isLoading ? "VERIFYING..." : (isLogin ? "ENTER STUDIO" : "INITIALIZE")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-black/5"></div>
              <span className="flex-shrink mx-4 text-[6px] text-black/30 font-bold">VERIFY VIA</span>
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
              className="text-[6px] text-black/40 font-bold uppercase tracking-widest hover:text-black transition-colors"
            >
              {isLogin ? "Need a new identity? Register" : "Already identified? Log In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
