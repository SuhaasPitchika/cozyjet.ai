
"use client";

import { create } from 'zustand';

export type AgentStatus = 'active' | 'processing' | 'idle';

export interface Activity {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
}

export interface IntegrationActivity {
  id: string;
  integration: 'notion' | 'figma' | 'github';
  title: string;
  timestamp: Date;
  status: 'completed' | 'shared' | 'merged';
}

export interface ContentItem {
  id: string;
  platform: 'linkedin' | 'x' | 'instagram' | 'youtube' | 'reddit';
  type: string;
  title: string;
  body: string;
  status: 'draft' | 'approved' | 'published';
  scheduledAt?: Date;
  engagement?: {
    likes: number;
    comments: number;
    impressions: number;
  };
}

interface DashboardState {
  skippyStatus: AgentStatus;
  flippoStatus: AgentStatus;
  snooksStatus: AgentStatus;
  activities: Activity[];
  integrationActivities: IntegrationActivity[];
  contentQueue: ContentItem[];
  setSkippyStatus: (status: AgentStatus) => void;
  setFlippoStatus: (status: AgentStatus) => void;
  setSnooksStatus: (status: AgentStatus) => void;
  addActivity: (agent: string, action: string) => void;
  approveContent: (id: string, scheduledAt: Date) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  skippyStatus: 'active',
  flippoStatus: 'idle',
  snooksStatus: 'processing',
  activities: [
    { id: '1', agent: 'Skippy', action: 'detected new Notion page', timestamp: new Date(Date.now() - 120000) },
    { id: '2', agent: 'Snooks', action: 'generated LinkedIn draft', timestamp: new Date(Date.now() - 300000) },
    { id: '3', agent: 'Flippo', action: 'scheduled post', timestamp: new Date(Date.now() - 480000) },
  ],
  integrationActivities: [
    { id: 'i1', integration: 'notion', title: 'Q4 Strategy Document', timestamp: new Date(Date.now() - 3600000), status: 'completed' },
    { id: 'i2', integration: 'figma', title: 'Mobile App Redesign', timestamp: new Date(Date.now() - 7200000), status: 'shared' },
    { id: 'i3', integration: 'github', title: 'User Authentication Fix', timestamp: new Date(Date.now() - 86400000), status: 'merged' },
  ],
  contentQueue: [
    { id: 'c1', platform: 'linkedin', type: 'Case Study', title: 'Building Zero-Trust Systems', body: 'Just completed a major overhaul of our infrastructure...', status: 'draft' },
    { id: 'c2', platform: 'x', type: 'Thread', title: '10 Tips for Product Managers', body: 'Product management is 90% communication...', status: 'approved', scheduledAt: new Date(Date.now() + 3600000) },
    { id: 'c3', platform: 'instagram', type: 'Behind the Scenes', title: 'Studio Setup 2024', body: 'Workspace upgrade complete!', status: 'published', engagement: { likes: 124, comments: 12, impressions: 1200 } },
  ],
  setSkippyStatus: (status) => set({ skippyStatus: status }),
  setFlippoStatus: (status) => set({ flippoStatus: status }),
  setSnooksStatus: (status) => set({ snooksStatus: status }),
  addActivity: (agent, action) => set((state) => ({
    activities: [{ id: Math.random().toString(), agent, action, timestamp: new Date() }, ...state.activities].slice(0, 50)
  })),
  approveContent: (id, scheduledAt) => set((state) => ({
    contentQueue: state.contentQueue.map(item => 
      item.id === id ? { ...item, status: 'approved', scheduledAt } : item
    )
  })),
}));
