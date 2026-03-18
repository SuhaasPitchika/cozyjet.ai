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

  // Timeline Activities
  integrationActivities: Array<{
    id: string;
    name: string;
    timestamp: number;
    status: string;
  }>;
  addIntegrationActivity: (activity: {
    id: string;
    name: string;
    timestamp: number;
    status: string;
  }) => void;

  // Voice Queue - with title and body for voice page
  contentQueue: Array<{
    id: string;
    content: string;
    timestamp: number;
    title?: string;
    body?: string;
  }>;
  addToQueue: (item: { id: string; content: string; timestamp: number; title?: string; body?: string }) => void;
  removeFromQueue: (id: string) => void;
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

  // Timeline Activities - initialize empty
  integrationActivities: [],
  addIntegrationActivity: (activity) => set((state) => ({
    integrationActivities: [...state.integrationActivities, activity].slice(-50) // Keep last 50
  })),

  // Voice Queue - initialize empty
  contentQueue: [],
  addToQueue: (item) => set((state) => ({
    contentQueue: [...state.contentQueue, item]
  })),
  removeFromQueue: (id) => set((state) => ({
    contentQueue: state.contentQueue.filter((item) => item.id !== id)
  })),
}));
