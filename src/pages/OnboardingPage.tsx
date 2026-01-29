import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Shield, Heart, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';

const slides = [
  {
    icon: Users,
    title: 'Find Your People',
    description: 'Connect with people nearby who are looking for the same things — right now.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Real-Time Requests',
    description: 'Post what you need in seconds. Watch as people nearby respond instantly.',
    color: 'secondary',
  },
  {
    icon: Shield,
    title: 'Safe by Design',
    description: 'Trust levels, group chats, and no random DMs. Safety built into every interaction.',
    color: 'primary',
  },
  {
    icon: Heart,
    title: 'Credits & Trust',
    description: 'Earn credits by helping others. Build trust through real connections.',
    color: 'accent',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  
  // Initial page animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      iconRef.current,
      { opacity: 0, scale: 0.5, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(
      descRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(
      dotsRef.current?.children || [],
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(2)' },
      '-=0.2'
    )
    .fromTo(
      buttonsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );
    
    // Floating icon animation
    gsap.to(iconRef.current, {
      y: -8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 0.6,
    });
  }, []);
  
  // Slide change animation
  const animateSlideChange = (newSlide: number) => {
    const tl = gsap.timeline({
      onComplete: () => setCurrentSlide(newSlide),
    });
    
    tl.to([iconRef.current, titleRef.current, descRef.current], {
      opacity: 0,
      y: -20,
      scale: 0.95,
      duration: 0.25,
      stagger: 0.03,
      ease: 'power2.in',
    });
  };
  
  useEffect(() => {
    if (currentSlide > 0 || iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' }
      );
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.15, ease: 'power2.out' }
      );
    }
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      animateSlideChange(currentSlide + 1);
    } else {
      // Exit animation
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => navigate('/signup'),
      });
    }
  };
  
  const handleSkip = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => navigate('/signup'),
    });
  };
  
  const handleDotClick = (index: number) => {
    if (index !== currentSlide) {
      animateSlideChange(index);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container min-h-screen flex flex-col bg-background"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">
        {/* Glass icon container */}
        <div 
          ref={iconRef}
          className="glass-card p-10 mb-10"
        >
          <Icon 
            size={56} 
            className={`${
              slide.color === 'primary' ? 'text-primary' : 
              slide.color === 'secondary' ? 'text-secondary' : 
              'text-accent'
            }`}
            strokeWidth={1.5}
          />
        </div>
        
        <h2 
          ref={titleRef}
          className="text-2xl font-semibold text-foreground text-center mb-4 tracking-tight"
        >
          {slide.title}
        </h2>
        
        <p 
          ref={descRef}
          className="text-base text-muted-foreground text-center max-w-xs leading-relaxed"
        >
          {slide.description}
        </p>
      </div>
      
      <div ref={buttonsRef} className="px-8 pb-12 relative">
        {/* Progress dots */}
        <div ref={dotsRef} className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        
        <Button 
          className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios" 
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          <ArrowRight className="ml-2" size={18} strokeWidth={2} />
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <button 
            className="w-full text-muted-foreground mt-4 py-3 text-sm font-medium"
            onClick={handleSkip}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
