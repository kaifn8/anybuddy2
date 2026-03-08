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
  
  useEffect(() => {
    const tl = gsap.timeline();
    gsap.set([emojiRef.current, titleRef.current], { opacity: 0 });
    
    tl.fromTo(emojiRef.current, 
      { opacity: 0, scale: 0.5, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
      '-=0.25'
    );
    
    const timer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => navigate(user && isOnboarded ? '/home' : '/onboarding'),
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, user, isOnboarded]);
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container flex flex-col items-center justify-center min-h-screen"
      style={{
        background: 'linear-gradient(160deg, hsl(211 100% 50%) 0%, hsl(240 80% 55%) 50%, hsl(260 50% 56%) 100%)',
      }}
    >
      <div className="flex flex-col items-center">
        <div ref={emojiRef} className="text-6xl mb-5">🤙</div>
        <h1 ref={titleRef} className="text-hero font-bold text-white">anybuddy</h1>
      </div>
    </div>
  );
}
