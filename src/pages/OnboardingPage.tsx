import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';

const slides = [
  {
    emoji: '👋',
    title: 'Find Your People',
    description: 'Connect with people nearby who want the same things — right now.',
    bg: 'from-primary/8 to-accent/5',
  },
  {
    emoji: '⚡',
    title: 'Real-Time Vibes',
    description: 'Post what you need in seconds. Watch as people nearby respond instantly.',
    bg: 'from-secondary/8 to-primary/5',
  },
  {
    emoji: '🛡️',
    title: 'Safe by Design',
    description: 'Trust levels, group chats, and no random DMs. Your safety comes first.',
    bg: 'from-success/8 to-secondary/5',
  },
  {
    emoji: '✨',
    title: 'Credits & Trust',
    description: 'Earn credits by helping others. Build trust through real connections.',
    bg: 'from-accent/10 to-warning/5',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const slide = slides[currentSlide];
  
  useEffect(() => {
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);
  
  useEffect(() => {
    gsap.fromTo(emojiRef.current,
      { opacity: 0, scale: 0.5, rotation: -10 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' }
    );
    gsap.fromTo(textRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.15, ease: 'power2.out' }
    );
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      gsap.to([emojiRef.current, textRef.current], {
        opacity: 0, y: -10, duration: 0.2,
        onComplete: () => setCurrentSlide(prev => prev + 1),
      });
    } else {
      gsap.to(containerRef.current, {
        opacity: 0, duration: 0.25,
        onComplete: () => navigate('/signup'),
      });
    }
  };
  
  const handleSkip = () => {
    gsap.to(containerRef.current, {
      opacity: 0, duration: 0.2,
      onComplete: () => navigate('/signup'),
    });
  };
  
  return (
    <div ref={containerRef} className="mobile-container min-h-screen flex flex-col bg-background">
      <div className={`absolute inset-0 bg-gradient-to-b ${slide.bg} transition-all duration-500`} />
      
      <div ref={contentRef} className="flex-1 flex flex-col relative">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Big Emoji */}
          <div ref={emojiRef} className="mb-8">
            <div className="uber-card-elevated p-8 inline-flex">
              <span className="text-6xl">{slide.emoji}</span>
            </div>
          </div>
          
          {/* Text */}
          <div ref={textRef} className="text-center">
            <h2 className="text-hero font-extrabold text-foreground mb-3">
              {slide.title}
            </h2>
            <p className="text-muted-foreground text-base max-w-[280px] leading-relaxed">
              {slide.description}
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="px-6 pb-10">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-foreground' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
          
          <Button 
            className="w-full h-13 text-sm font-bold rounded-2xl bg-foreground text-background hover:opacity-90" 
            onClick={handleNext}
          >
            {currentSlide === slides.length - 1 ? 'Let\'s Go! 🚀' : 'Continue →'}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <button 
              className="w-full text-muted-foreground mt-4 py-2 text-sm font-medium tap-scale"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
