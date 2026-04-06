"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface OnboardingStatus {
  is_complete: boolean;
  exchange_count: number;
  has_growth_profile: boolean;
  growth_profile: Record<string, unknown> | null;
}

export interface ChatResponse {
  reply: string;
  is_complete: boolean;
  exchange_count: number;
  growth_profile: Record<string, unknown> | null;
}

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = useCallback(async (): Promise<OnboardingStatus | null> => {
    try {
      const { data } = await api.get<OnboardingStatus>("/backend/api/onboarding/status");
      return data;
    } catch {
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<ChatResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<ChatResponse>("/backend/api/onboarding/chat", { message });
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      await api.post("/backend/api/onboarding/reset");
    } catch {}
  }, []);

  return { loading, error, getStatus, sendMessage, reset };
}
