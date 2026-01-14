'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionManager({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastResetRef = useRef<number>(0); // Used for throttling
  
  //const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 Minutes
  const INACTIVITY_LIMIT = 10 * 1000; // 10 Seconds
  const THROTTLE_DELAY = 1000; // 1 second

  const logout = useCallback(() => {
    // 1. Clear Storage
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Clear Cookies for both root and sub-path to be safe
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; path=/lukz_erp_frontend; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // 3. Redirect (Next.js handles the basePath automatically)
    router.push('/login?reason=inactivity');
  }, [router]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    
    // Throttling: Only reset if at least 1 second has passed since the last reset
    if (now - lastResetRef.current < THROTTLE_DELAY) return;
    lastResetRef.current = now;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  }, [logout, INACTIVITY_LIMIT]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If no token, don't bother setting up listeners
    if (!token) return;

    const events = ['mousedown', 'keydown', 'click', 'scroll'];
    
    // Add listeners
    events.forEach(e => window.addEventListener(e, resetTimer));
    
    // Initial start
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, logout, INACTIVITY_LIMIT]);

  return <>{children}</>;
}