import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, isOnboarded } = useAppStore();
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  
  useEffect(() => {
    setShowLogo(true);
    const taglineTimer = setTimeout(() => setShowTagline(true), 500);
    
    const navigateTimer = setTimeout(() => {
      if (user && isOnboarded) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }, 2500);
    
    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate, user, isOnboarded]);
  
  return (
    <div className="mobile-container flex flex-col items-center justify-center gradient-hero min-h-screen">
      <div className={`transition-all duration-700 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="relative">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-glow">
            <Users size={64} className="text-white" />
          </div>
          <div className="absolute -inset-2 bg-white/10 rounded-3xl blur-xl -z-10" />
        </div>
        
        <h1 className="text-5xl font-display font-extrabold text-white mt-6 text-center">
          AnyBuddy
        </h1>
      </div>
      
      <p className={`text-white/90 text-lg mt-4 text-center max-w-xs transition-all duration-500 ${showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        Need someone? Anybody in?
      </p>
      
      <div className="absolute bottom-12 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
