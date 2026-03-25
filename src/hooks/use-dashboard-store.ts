"use client";

import { create } from 'zustand';

export type AgentStatus = 'active' | 'processing' | 'idle';

export interface SkippyContext {
  signal?: string;
  activity?: string;
  context?: string;
  apps?: string[];
  insights?: string;
  focus_score?: number;
}

interface DashboardState {
  skippyActive: boolean;
  setSkippyActive: (active: boolean) => void;
  skippyStuck: boolean;
  setSkippyStuck: (stuck: boolean) => void;

  assistanceMsg: string;
  setAssistanceMsg: (msg: string) => void;

  skippyContext: SkippyContext | null;
  setSkippyContext: (ctx: SkippyContext | null) => void;

  showGlobalChat: boolean;
  setShowGlobalChat: (show: boolean) => void;

  flippoGenerated: boolean;
  setFlippoGenerated: (generated: boolean) => void;
  trainingProgress: number;
  setTrainingProgress: (progress: number) => void;

  agentParams: { creativity: number; focus: number; identity: number };
  setAgentParams: (params: { creativity: number; focus: number; identity: number }) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  skippyActive: false,
  setSkippyActive: (active) => set({ skippyActive: active }),
  skippyStuck: false,
  setSkippyStuck: (stuck) => set({ skippyStuck: stuck }),

  assistanceMsg: "",
  setAssistanceMsg: (msg) => set({ assistanceMsg: msg }),

  skippyContext: null,
  setSkippyContext: (ctx) => set({ skippyContext: ctx }),

  showGlobalChat: false,
  setShowGlobalChat: (show) => set({ showGlobalChat: show }),

  flippoGenerated: false,
  setFlippoGenerated: (generated) => set({ flippoGenerated: generated }),
  trainingProgress: 0,
  setTrainingProgress: (progress) => set({ trainingProgress: progress }),

  agentParams: { creativity: 0.7, focus: 0.9, identity: 0.85 },
  setAgentParams: (params) => set({ agentParams: params }),
}));
