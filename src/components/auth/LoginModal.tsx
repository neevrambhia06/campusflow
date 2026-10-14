import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CodeSlots } from '@/components/ui/CodeSlots';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/store/useToast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const { addToast } = useToast();
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [verificationCode, setVerificationCode] = useState('CAMPUS');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmittingGoogle(true);
    try {
      await signInWithGoogle();
      addToast('Redirecting to Google Sign-in…');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      addToast('Google Sign-in failed: ' + (err.message || 'Check Supabase OAuth'));
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    addToast('Welcome to CampusFlow!');
    onClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-indigo-50/50 to-white pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">
            Sign In to CampusFlow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your academic experiment workflows and sync across devices.
          </p>
        </div>

        {/* React Bits CodeSlots Micro-Interaction */}
        <div className="px-6 sm:px-8 py-3 flex justify-center bg-slate-50/70 border-y border-slate-100">
          <CodeSlots
            initialCode={verificationCode}
            onCodeChange={(code) => setVerificationCode(code)}
          />
        </div>

        {/* Login Action Buttons */}
        <div className="p-6 sm:p-8 space-y-3.5">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmittingGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all hover:shadow-sm"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isSubmittingGoogle ? 'Connecting…' : 'Sign In with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              or continue directly
            </span>
          </div>

          {/* Quick Demo / Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Continue as Student (Neev)</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted cloud sync via Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
