"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentStatus = 'active' | 'processing' | 'idle';

// BroadcastChannel for cross-tab sync
const skippyChannel = typeof window !== 'undefined' 
  ? new BroadcastChannel('maxim_skippy_sync') 
  : null;

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
}

// Handle cross-tab sync
if (typeof window !== 'undefined' && skippyChannel) {
  skippyChannel.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    // Listen for state changes from other tabs
    if (type === 'SKIPPY_STATE_CHANGE') {
      // Update local state via zustand - we'll handle this in the component
      window.dispatchEvent(new CustomEvent('skippy-sync', { detail: payload }));
    }
  };
}

// Function to broadcast state changes
export const broadcastSkippyState = (state: Partial<DashboardState>) => {
  if (skippyChannel) {
    skippyChannel.postMessage({
      type: 'SKIPPY_STATE_CHANGE',
      payload: state,
    });
  }
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      skippyActive: false,
      setSkippyActive: (active) => {
        set({ skippyActive: active });
        broadcastSkippyState({ skippyActive: active });
      },
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
    }),
    {
      name: 'maxim-dashboard-storage',
      partialize: (state) => ({
        skippyActive: state.skippyActive,
      }),
    }
  )
);
