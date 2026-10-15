import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import {
  LandingNavbar,
  LandingHero,
  LandingFeatures,
  LandingFooter,
} from '@/components/landing';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleEnterWorkspace = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Sticky Navbar */}
      <LandingNavbar
        isAuthenticated={isAuthenticated}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onGoToWorkspace={() => navigate('/dashboard')}
      />

      {/* 2. Main Hero & Features */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center">
        {/* Hero Section with TechText */}
        <LandingHero
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onEnterWorkspace={handleEnterWorkspace}
        />

        {/* Feature Highlights Bento Grid */}
        <LandingFeatures onEnterWorkspace={handleEnterWorkspace} />

        {/* Bottom CTA Banner & Footer */}
        <LandingFooter onOpenLogin={() => setIsLoginModalOpen(true)} />
      </main>

      {/* 3. Auth Modal with CodeSlots Animation */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
}
