import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const slides = [
  { emoji: '👋', title: 'Find Your People', description: 'Connect with people nearby who want the same things — right now.' },
  { emoji: '⚡', title: 'Real-Time Vibes', description: 'Post what you need in seconds. Watch as people nearby respond instantly.' },
  { emoji: '🛡️', title: 'Safe by Design', description: 'Trust levels, group chats, and no random DMs. Your safety comes first.' },
  { emoji: '✨', title: 'Credits & Trust', description: 'Earn credits by helping others. Build trust through real connections.' },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const slide = slides[currentSlide];
  
  useEffect(() => {
    gsap.fromTo(emojiRef.current, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
    gsap.fromTo(textRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.1, ease: 'power2.out' });
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      gsap.to([emojiRef.current, textRef.current], {
        opacity: 0, y: -8, duration: 0.15,
        onComplete: () => setCurrentSlide(prev => prev + 1),
      });
    } else {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
    }
  };
  
  const handleSkip = () => {
    gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
  };
  
  return (
    <div ref={containerRef} className="mobile-container min-h-screen flex flex-col bg-ambient">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div ref={emojiRef} className="mb-6">
          <div className="liquid-glass-heavy w-24 h-24 flex items-center justify-center specular-highlight" style={{ borderRadius: '1.75rem' }}>
            <span className="text-5xl">{slide.emoji}</span>
          </div>
        </div>
        
        <div ref={textRef} className="text-center max-w-[280px]">
          <h2 className="text-heading font-bold text-foreground mb-2">{slide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{slide.description}</p>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="px-6 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
        
        <button className="w-full h-12 tahoe-btn-primary tap-scale" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </button>
        
        {currentSlide < slides.length - 1 && (
          <button className="w-full text-muted-foreground mt-3 py-2 text-sm font-medium tap-scale" onClick={handleSkip}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
