import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import gsap from 'gsap';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, isOnboarded } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    gsap.set([emojiRef.current, titleRef.current, taglineRef.current], { opacity: 0 });
    
    tl.fromTo(emojiRef.current, 
      { opacity: 0, scale: 0.5, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.3'
    )
    .fromTo(taglineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );
    
    const navigateTimer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0, scale: 0.98, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
          navigate(user && isOnboarded ? '/home' : '/onboarding');
        },
      });
    }, 2200);
    
    return () => clearTimeout(navigateTimer);
  }, [navigate, user, isOnboarded]);
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, hsl(211 100% 50%) 0%, hsl(240 80% 55%) 50%, hsl(280 65% 55%) 100%)',
      }}
    >
      {/* Ambient light effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-white/8 blur-3xl" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div ref={emojiRef} className="text-7xl mb-6 float-animation">
          🤙
        </div>
        
        <h1 ref={titleRef} className="text-4xl font-bold text-white tracking-tight">
          anybuddy
        </h1>
        
        <p ref={taglineRef} className="text-white/60 text-sm mt-3 font-medium">
          Need someone? Anybody in? 🙌
        </p>
      </div>
      
      <div className="absolute bottom-16">
        <div className="liquid-glass-subtle px-6 py-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
