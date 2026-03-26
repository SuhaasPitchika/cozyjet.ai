
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Key, Bell, Database } from "lucide-react";

export default function SettingsPage() {
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
              <Database className="w-4 h-4 text-amber-500" />
              Workspace Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs text-zinc-500 uppercase font-bold">Sync Frequency</Label>
              <Input className="bg-white/5 border-white/10" placeholder="15 minutes" />
            </div>
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
              Force Re-index All integrations
            </Button>
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
