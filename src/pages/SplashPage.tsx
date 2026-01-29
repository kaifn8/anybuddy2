import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import gsap from 'gsap';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, isOnboarded } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Initial state
    gsap.set([iconRef.current, titleRef.current, taglineRef.current, dotsRef.current], {
      opacity: 0,
    });
    
    // Glow pulse animation
    gsap.to(glowRef.current, {
      scale: 1.2,
      opacity: 0.3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
    
    // Main animation sequence
    tl.fromTo(
      iconRef.current,
      { opacity: 0, scale: 0.5, rotateY: -90 },
      { opacity: 1, scale: 1, rotateY: 0, duration: 0.8, ease: 'back.out(1.7)' }
    )
    .fromTo(
      titleRef.current,
      { opacity: 0, y: 30, letterSpacing: '0.3em' },
      { opacity: 1, y: 0, letterSpacing: '0em', duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
    .fromTo(
      taglineRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(
      dotsRef.current?.children || [],
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1, ease: 'back.out(2)' },
      '-=0.1'
    );
    
    // Floating animation for icon
    gsap.to(iconRef.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 1,
    });
    
    // Navigate after animations
    const navigateTimer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.1,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          if (user && isOnboarded) {
            navigate('/home');
          } else {
            navigate('/onboarding');
          }
        },
      });
    }, 2500);
    
    return () => clearTimeout(navigateTimer);
  }, [navigate, user, isOnboarded]);
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container flex flex-col items-center justify-center gradient-hero min-h-screen relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div 
        ref={glowRef}
        className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
      />
      
      <div ref={logoContainerRef} className="relative z-10">
        <div 
          ref={iconRef}
          className="relative"
          style={{ perspective: '1000px' }}
        >
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-ios-lg border border-white/30">
            <Users size={56} className="text-white" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 
          ref={titleRef}
          className="text-4xl font-semibold text-white mt-8 text-center tracking-tight"
        >
          AnyBuddy
        </h1>
      </div>
      
      <p 
        ref={taglineRef}
        className="text-white/80 text-base mt-4 text-center max-w-xs font-light"
      >
        Need someone? Anybody in?
      </p>
      
      <div ref={dotsRef} className="absolute bottom-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/50"
          />
        ))}
      </div>
    </div>
  );
}
