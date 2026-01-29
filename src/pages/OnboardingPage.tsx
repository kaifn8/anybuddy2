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
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: Zap,
    title: 'Real-Time Requests',
    description: 'Post what you need in seconds. Watch as people nearby respond instantly.',
    gradient: 'from-secondary/20 to-secondary/5',
  },
  {
    icon: Shield,
    title: 'Safe by Design',
    description: 'Trust levels, group chats, and no random DMs. Safety built into every interaction.',
    gradient: 'from-primary/15 to-secondary/10',
  },
  {
    icon: Heart,
    title: 'Credits & Trust',
    description: 'Earn credits by helping others. Build trust through real connections.',
    gradient: 'from-accent/25 to-accent/5',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  
  // Initial animation
  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);
  
  // Slide change animation
  useEffect(() => {
    gsap.fromTo(
      iconRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' }
    );
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      gsap.to([iconRef.current, textRef.current], {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setCurrentSlide(prev => prev + 1),
      });
    } else {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.25,
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
  
  return (
    <div 
      ref={containerRef}
      className="mobile-container min-h-screen flex flex-col bg-background"
    >
      {/* Dynamic gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${slide.gradient} transition-all duration-500`} />
      
      <div ref={contentRef} className="flex-1 flex flex-col relative">
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Icon */}
          <div 
            ref={iconRef}
            className="neo-card-elevated p-8 mb-10"
          >
            <Icon 
              size={48} 
              className="text-primary"
              strokeWidth={1.5}
            />
          </div>
          
          {/* Text */}
          <div ref={textRef} className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
              {slide.title}
            </h2>
            <p className="text-muted-foreground text-base max-w-[280px] leading-relaxed">
              {slide.description}
            </p>
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="px-6 pb-10">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-6 bg-primary' 
                    : 'w-1.5 bg-border hover:bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          {/* Continue button */}
          <Button 
            className="w-full h-12 text-sm font-semibold rounded-xl gradient-primary shadow-soft text-white" 
            onClick={handleNext}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
            <ArrowRight className="ml-2" size={16} strokeWidth={2.5} />
          </Button>
          
          {/* Skip */}
          {currentSlide < slides.length - 1 && (
            <button 
              className="w-full text-muted-foreground mt-4 py-2 text-sm font-medium tap-scale"
              onClick={handleSkip}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
