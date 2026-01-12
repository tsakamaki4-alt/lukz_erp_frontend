'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionManager({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 30 Minutes (change to 10000 for a 10-second test)
  //const INACTIVITY_LIMIT = 30 * 60 * 1000; 
  const INACTIVITY_LIMIT = 10000; 

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performLogout = useCallback(() => {
    // 1. Clear everything
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // 2. Redirect
    window.location.href = '/lukz_erp_frontend/login?reason=inactivity';
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(performLogout, INACTIVITY_LIMIT);
  }, [performLogout, INACTIVITY_LIMIT]);

  useEffect(() => {
    // --- GLOBAL ACCESS GUARD ---
    const publicPaths = ['/login', '/signup'];
    const isPublicPath = publicPaths.includes(pathname);
    const token = localStorage.getItem('token');

    // If they are on a dashboard/internal page without a token, KICK THEM OUT
    if (!isPublicPath && !token) {
      performLogout();
      return;
    }

    // --- AUTO LOGOUT LOGIC ---
    if (isPublicPath) return; // Don't run inactivity timer on login page

    const events = ['mousedown', 'keydown', 'click', 'scroll'];
    const onActivity = () => resetTimer();

    events.forEach(e => window.addEventListener(e, onActivity));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, resetTimer, performLogout]);

  return <>{children}</>;
}