'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionManager({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastResetRef = useRef<number>(0);
  
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 Minutes
  const THROTTLE_DELAY = 1000; 

  const logout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Use window.location for a hard reset, or router.push for SPA feel
    window.location.href = '/login?reason=inactivity';
  }, []);

  const resetTimer = useCallback((sync = true) => {
    const now = Date.now();
    if (now - lastResetRef.current < THROTTLE_DELAY) return;
    lastResetRef.current = now;

    // Multi-tab sync: Update a value in localStorage
    if (sync) {
      localStorage.setItem('lastActive', now.toString());
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Listen for activity in OTHER tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastActive') {
        resetTimer(false); // Reset timer but don't re-sync to storage
      }
    };

    const events = ['mousedown', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, () => resetTimer(true)));
    window.addEventListener('storage', handleStorageChange);
    
    // Initial Start
    resetTimer(false);

    return () => {
      events.forEach(e => window.removeEventListener(e, () => resetTimer(true)));
      window.removeEventListener('storage', handleStorageChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return <>{children}</>;
}