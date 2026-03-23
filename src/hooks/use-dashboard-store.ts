"use client";

import { create } from 'zustand';

export type AgentStatus = 'active' | 'processing' | 'idle';

interface DashboardState {
  // Skippy Global State
  skippyActive: boolean;
  setSkippyActive: (active: boolean) => void;
  skippyStuck: boolean;
  setSkippyStuck: (stuck: boolean) => void;
  assistanceMsg: string;
  setAssistanceMsg: (msg: string) => void;
  showGlobalChat: boolean;
  setShowGlobalChat: (show: boolean) => void;

  // Other Agent States
  flippoGenerated: boolean;
  setFlippoGenerated: (generated: boolean) => void;
  trainingProgress: number;
  setTrainingProgress: (progress: number) => void;

  // Dashboard data from backend (timeline of integration activities)
  integrationActivities: any[];
  setIntegrationActivities: (acts: any[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  skippyActive: false,
  setSkippyActive: (active) => set({ skippyActive: active }),
  skippyStuck: false,
  setSkippyStuck: (stuck) => set({ skippyStuck: stuck }),
  assistanceMsg: "",
  setAssistanceMsg: (msg) => set({ assistanceMsg: msg }),
  showGlobalChat: false,
  setShowGlobalChat: (show) => set({ showGlobalChat: show }),

  flippoGenerated: false,
  setFlippoGenerated: (generated) => set({ flippoGenerated: generated }),
  trainingProgress: 0,
  setTrainingProgress: (progress) => set({ trainingProgress: progress }),

  // Initialize with empty; will be populated from backend API
  integrationActivities: [],
  setIntegrationActivities: (acts) => set({ integrationActivities: acts }),
}));
