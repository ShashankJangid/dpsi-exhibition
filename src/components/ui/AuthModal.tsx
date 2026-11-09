'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { signInWithGoogle, signInWithGoogleRedirect, signInAsGuest } from '@/lib/firebase';
import {
  X,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
} from 'lucide-react';

export default function AuthModal() {
  const isAuthModalOpen = useExhibitionStore((state) => state.isAuthModalOpen);
  const setAuthModalOpen = useExhibitionStore((state) => state.setAuthModalOpen);
  const setUser = useExhibitionStore((state) => state.setUser);

  const [activeTab, setActiveTab] = useState<'google' | 'guest'>('google');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || 'user@dpsi.in',
          name: firebaseUser.displayName || 'Verified Attendee (Google)',
        });
        setAuthModalOpen(false);
      }
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const isPopupBlocked =
        (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'auth/popup-blocked') ||
        (err instanceof Error && err.message.includes('popup-blocked'));

      if (isPopupBlocked) {
        setAuthError('Browser blocked the popup window. Choose Direct Page Redirect below or use the 1-Click Visitor Pass.');
        return;
      }

      const errorMsg =
        err instanceof Error && (err.message.includes('popup-closed-by-user') || err.message.includes('closed'))
          ? 'Sign-in window was closed before completion. If the popup had an issue, try Direct Page Redirect below.'
          : err instanceof Error && err.message.includes('cancelled-popup-request')
          ? 'Another sign-in popup is already open.'
          : err instanceof Error && err.message.includes('auth/unauthorized-domain')
          ? 'Domain not authorized for OAuth in Firebase Console. Please use the Visitor Pass tab.'
          : err instanceof Error
          ? err.message
          : 'Failed to sign in with Google. Please try again or use the Visitor Pass tab.';
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setLoading(true);
    setAuthError(null);
    try {
      const guest = await signInAsGuest(guestName.trim(), guestEmail.trim());
      setUser({
        id: guest.uid,
        name: guest.displayName,
        email: guest.email,
      });
      setAuthModalOpen(false);
    } catch (err: unknown) {
      console.error('Guest sign-in error:', err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Unable to issue visitor pass. Please check your connection and try again.';
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl bg-[#f8fafc]/98 dark:bg-[#0c1220]/95 border border-slate-300/80 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-slate-800 dark:text-slate-100 overflow-hidden"
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              setAuthError(null);
              setAuthModalOpen(false);
            }}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-800 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-all"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* School Brand & Header Alignment */}
          <div className="flex items-center gap-3.5 mb-5 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-slate-200">
              <Image
                src="/dps_shield.png"
                alt="DPS Indirapuram Emblem"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                  DPS Indirapuram
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Official Expo
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Voter Verification
              </h2>
            </div>
          </div>

          {/* Trust & Transparency Feature Ribbon */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] font-sans">
                1 verified vote per booth • Real-time live tally
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
              Anti-Tamper
            </span>
          </div>

          {/* Segmented Tab Control (Google OAuth vs Visitor Pass) */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setActiveTab('google');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Google Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setActiveTab('guest');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'guest'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Visitor Pass</span>
            </button>
          </div>

          {/* Error / Alert Message Banner */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex flex-col gap-2 text-xs text-rose-700 dark:text-rose-300"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-800 dark:text-rose-200">Sign-in Notice</p>
                  <p className="text-[11px] mt-0.5 text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                    {authError}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => signInWithGoogleRedirect()}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  <span>Direct page redirect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setActiveTab('guest');
                    if (!guestName) setGuestName('Exhibition Attendee');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Use 1-Click Visitor Pass instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 1: Google OAuth */}
          {activeTab === 'google' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Sign in with your Google account for instantaneous voting verification across all exhibition zones.
              </p>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full min-h-[48px] flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs sm:text-sm border border-slate-300/80 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
              </button>

              {loading && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setLoading(false)}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold underline"
                  >
                    Cancel authentication
                  </button>
                </div>
              )}

              <div className="pt-1 flex flex-col items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                <button
                  type="button"
                  onClick={() => signInWithGoogleRedirect()}
                  className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Popup having issues? <span className="font-bold underline text-amber-600 dark:text-amber-400">Use Direct Redirect →</span>
                </button>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span>No Google account?</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guest')}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    Use instant Visitor Pass →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Quick Visitor Pass */}
          {activeTab === 'guest' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleGuestSignIn}
              className="space-y-3.5 font-sans"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attendee or Judge Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-slate-500 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{loading ? 'Issuing Pass...' : 'Issue Verified Pass & Continue'}</span>
              </button>

              <p className="text-[10px] text-center text-slate-500 font-sans">
                Instant guest access. Zero popups required.
              </p>
            </motion.form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
