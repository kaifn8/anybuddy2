import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';

const slides = [
  { emoji: '👋', title: 'Find Your People', description: 'Connect with people nearby who want the same things — right now.', tint: 'from-primary/6 to-transparent' },
  { emoji: '⚡', title: 'Real-Time Vibes', description: 'Post what you need in seconds. Watch as people nearby respond instantly.', tint: 'from-secondary/6 to-transparent' },
  { emoji: '🛡️', title: 'Safe by Design', description: 'Trust levels, group chats, and no random DMs. Your safety comes first.', tint: 'from-success/6 to-transparent' },
  { emoji: '✨', title: 'Credits & Trust', description: 'Earn credits by helping others. Build trust through real connections.', tint: 'from-accent/8 to-transparent' },
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
    gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }, []);
  
  useEffect(() => {
    gsap.fromTo(emojiRef.current, { opacity: 0, scale: 0.6, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' });
    gsap.fromTo(textRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.15, ease: 'power2.out' });
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      gsap.to([emojiRef.current, textRef.current], { opacity: 0, y: -10, duration: 0.2, onComplete: () => setCurrentSlide(prev => prev + 1) });
    } else {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.25, onComplete: () => navigate('/signup') });
    }
  };
  
  const handleSkip = () => {
    gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
  };
  
  return (
    <div ref={containerRef} className="mobile-container min-h-screen flex flex-col bg-ambient">
      <div className={`absolute inset-0 bg-gradient-to-b ${slide.tint} transition-all duration-700`} />
      
      <div ref={contentRef} className="flex-1 flex flex-col relative">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div ref={emojiRef} className="mb-8">
            <div className="liquid-glass-heavy p-8 inline-flex specular-highlight" style={{ borderRadius: '2rem' }}>
              <span className="text-6xl">{slide.emoji}</span>
            </div>
          </div>
          
          <div ref={textRef} className="text-center">
            <h2 className="text-hero font-bold text-foreground mb-3">{slide.title}</h2>
            <p className="text-muted-foreground text-[15px] max-w-[280px] leading-relaxed">{slide.description}</p>
          </div>
        </div>
        
        <div className="px-6 pb-10">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
          
          <Button 
            className="w-full h-12 text-sm font-semibold rounded-2xl glass-button-primary" 
            onClick={handleNext}
          >
            {currentSlide === slides.length - 1 ? 'Get Started 🚀' : 'Continue →'}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <button className="w-full text-muted-foreground mt-4 py-2 text-sm font-medium tap-scale" onClick={handleSkip}>
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
