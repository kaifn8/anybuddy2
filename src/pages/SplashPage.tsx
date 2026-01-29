import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import gsap from 'gsap';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, isOnboarded } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Initial state
    gsap.set([logoRef.current, titleRef.current, taglineRef.current], {
      opacity: 0,
    });
    
    // Main animation sequence
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo(
      titleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(
      taglineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );
    
    // Navigate after animations
    const navigateTimer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
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
      className="mobile-container flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, hsl(245 58% 51%) 0%, hsl(200 85% 45%) 100%)',
      }}
    >
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div 
          ref={logoRef}
          className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-xl flex items-center justify-center mb-8 shadow-lg border border-white/20"
        >
          <Users size={40} className="text-white" strokeWidth={1.5} />
        </div>
        
        <h1 
          ref={titleRef}
          className="text-3xl font-bold text-white tracking-tight"
        >
          AnyBuddy
        </h1>
        
        <p 
          ref={taglineRef}
          className="text-white/70 text-sm mt-3 font-medium"
        >
          Need someone? Anybody in?
        </p>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-16 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
