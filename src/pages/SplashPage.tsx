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
      { opacity: 0, scale: 0.5, rotation: -15 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 20 },
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
        opacity: 0,
        scale: 0.98,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (user && isOnboarded) {
            navigate('/home');
          } else {
            navigate('/onboarding');
          }
        },
      });
    }, 2200);
    
    return () => clearTimeout(navigateTimer);
  }, [navigate, user, isOnboarded]);
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-warm-hero"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div 
          ref={emojiRef}
          className="text-7xl mb-6"
        >
          🤙
        </div>
        
        <h1 
          ref={titleRef}
          className="text-4xl font-extrabold text-white tracking-tight"
        >
          anybuddy
        </h1>
        
        <p 
          ref={taglineRef}
          className="text-white/70 text-sm mt-3 font-medium"
        >
          Need someone? Anybody in? 🙌
        </p>
      </div>
      
      <div className="absolute bottom-16 flex gap-2">
        {['🟠', '🟡', '🟠'].map((dot, i) => (
          <div
            key={i}
            className="text-xs animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {dot}
          </div>
        ))}
      </div>
    </div>
  );
}
