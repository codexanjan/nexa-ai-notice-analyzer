import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import api from '../services/api';

type GoogleAPI = { accounts: { id: {
  initialize: (options: { client_id: string; nonce: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
} } };
declare global { interface Window { google?: GoogleAPI } }

let scriptPromise: Promise<void> | undefined;
function loadGoogle() {
  if (window.google) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { scriptPromise = undefined; script.remove(); reject(new Error('Unable to load Google sign-in. Check your connection or use email sign-in.')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function GoogleSignIn({ password = '' }: { password?: string }) {
  const button = useRef<HTMLDivElement>(null);
  const passwordRef = useRef(password);
  passwordRef.current = password;
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Checking Google sign-in…');
  useEffect(() => {
    let cancelled = false;
    async function setup() {
      try {
        const { data } = await api.get('/auth/google/config');
        if (cancelled) return;
        if (!data.enabled) { setMessage('Google sign-in is coming soon. Use email or a demo account below.'); return; }
        await loadGoogle();
        if (cancelled || !button.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: data.client_id, nonce: data.nonce, callback: async ({ credential }) => {
          if (cancelled) return;
          setMessage('Signing in securely…');
          try {
            const user = await googleLogin(credential, data.challenge, passwordRef.current);
            if (!cancelled) navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
          } catch (error: unknown) {
            const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
            if (!cancelled) setMessage(detail || 'Google sign-in failed. Please retry.');
          }
        } });
        window.google.accounts.id.renderButton(button.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(320, button.current.clientWidth) });
        setMessage('New Google accounts join as students. Existing accounts keep their portal access.');
      } catch { if (!cancelled) setMessage('Google sign-in is unavailable. Use email sign-in or retry later.'); }
    }
    void setup();
    return () => { cancelled = true; };
  }, []);
  return <div className="space-y-2"><div ref={button} className="flex justify-center min-w-0" /><p role="status" className="text-xs text-muted text-center">{message}</p></div>;
}
