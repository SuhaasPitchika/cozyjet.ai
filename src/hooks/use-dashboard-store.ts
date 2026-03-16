"use client";

import { create } from 'zustand';

export type AgentStatus = 'active' | 'processing' | 'idle';

interface DashboardState {
  skippyActive: boolean;
  setSkippyActive: (active: boolean) => void;
  flippoGenerated: boolean;
  setFlippoGenerated: (generated: boolean) => void;
  trainingProgress: number;
  setTrainingProgress: (progress: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  skippyActive: false,
  setSkippyActive: (active) => set({ skippyActive: active }),
  flippoGenerated: false,
  setFlippoGenerated: (generated) => set({ flippoGenerated: generated }),
  trainingProgress: 0,
  setTrainingProgress: (progress) => set({ trainingProgress: progress }),
}));