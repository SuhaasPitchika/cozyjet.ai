'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface ReplitUser {
  id: string;
  name: string | null;
  bio: string | null;
  url: string | null;
  profileImage: string | null;
  roles: string | null;
}

interface ReplitAuthContextState {
  replitUser: ReplitUser | null;
  isReplitLoading: boolean;
  refetchReplitUser: () => Promise<void>;
  signOutReplit: () => void;
}

const ReplitAuthContext = createContext<ReplitAuthContextState | undefined>(undefined);

const REPLIT_SIGNOUT_KEY = 'replit_signed_out';

export function ReplitAuthProvider({ children }: { children: ReactNode }) {
  const [replitUser, setReplitUser] = useState<ReplitUser | null>(null);
  const [isReplitLoading, setIsReplitLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const localSignedOut = sessionStorage.getItem(REPLIT_SIGNOUT_KEY) === 'true';
      if (localSignedOut) {
        setReplitUser(null);
        setIsReplitLoading(false);
        return;
      }
      const res = await fetch('/api/auth/replit-user');
      const data = await res.json();
      setReplitUser(data.user);
    } catch {
      setReplitUser(null);
    } finally {
      setIsReplitLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, signedOut]);

  const refetchReplitUser = useCallback(async () => {
    sessionStorage.removeItem(REPLIT_SIGNOUT_KEY);
    setIsReplitLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const signOutReplit = useCallback(() => {
    sessionStorage.setItem(REPLIT_SIGNOUT_KEY, 'true');
    setReplitUser(null);
    setSignedOut(true);
  }, []);

  return (
    <ReplitAuthContext.Provider value={{ replitUser, isReplitLoading, refetchReplitUser, signOutReplit }}>
      {children}
    </ReplitAuthContext.Provider>
  );
}

export function useReplitAuth(): ReplitAuthContextState {
  const ctx = useContext(ReplitAuthContext);
  if (!ctx) throw new Error('useReplitAuth must be used within ReplitAuthProvider');
  return ctx;
}
