
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Key, Bell, Database, MessageSquare, Trash2 } from "lucide-react";
import { getSecureItem, setSecureItem, clearSecureStorage, STORAGE_KEYS } from "@/lib/encrypted-storage";

export default function SettingsPage() {
  const [tempChatMode, setTempChatMode] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      const pref = await getSecureItem<{ tempChat: boolean }>(STORAGE_KEYS.USER_PREFERENCES);
      if (pref) {
        setTempChatMode(pref.tempChat);
      }
    };
    loadPreference();
  }, []);

  const handleTempChatToggle = async (checked: boolean) => {
    setTempChatMode(checked);
    await setSecureItem(STORAGE_KEYS.USER_PREFERENCES, { tempChat: checked });
    
    // If turning on temporary mode, clear existing chat history
    if (checked) {
      await clearSecureStorage();
    }
  };

  const handleClearAllData = async () => {
    if (confirm("Are you sure you want to delete ALL local data? This cannot be undone.")) {
      setIsClearing(true);
      await clearSecureStorage();
      setIsClearing(false);
      alert("All local data has been cleared.");
    }
  };

  return (
    <div className="p-10 space-y-10 max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-tighter text-white">System <span className="text-amber-500">Settings</span></h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Hardware-Backed Security Configuration</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Security Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-zinc-200">Zero-Trust Local Sync</Label>
                <p className="text-[10px] text-zinc-500">Enable hardware-backed encryption for all workspace data</p>
              </div>
              <Switch checked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-zinc-200">Adversarial Compliance</Label>
                <p className="text-[10px] text-zinc-500">Run VERA check on all content before UI disclosure</p>
              </div>
              <Switch checked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Chat & History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-zinc-200">Temporary Chat Mode</Label>
                <p className="text-[10px] text-zinc-500">Automatically clear chats after each session</p>
              </div>
              <Switch 
                checked={tempChatMode} 
                onCheckedChange={handleTempChatToggle}
              />
            </div>
            <div className="pt-2 border-t border-white/10">
              <Button 
                variant="outline" 
                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                onClick={handleClearAllData}
                disabled={isClearing}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isClearing ? "Clearing..." : "Clear All Local Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="ghost" className="text-zinc-500 font-bold uppercase text-xs">Reset to Factory</Button>
          <Button className="bg-amber-500 text-black font-bold px-8">SAVE CONFIGURATION</Button>
        </div>
      </div>
    </div>
  );
}
