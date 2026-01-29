import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Shield, Heart, ArrowRight } from 'lucide-react';
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
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/signup');
    }
  };
  
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">
        {/* Glass icon container */}
        <div 
          className="glass-card p-10 mb-10 bounce-in" 
          key={currentSlide}
        >
          <Icon 
            size={64} 
            className={`${
              slide.color === 'primary' ? 'text-primary' : 
              slide.color === 'secondary' ? 'text-secondary' : 
              'text-accent'
            }`}
            strokeWidth={1.5}
          />
        </div>
        
        <h2 className="text-3xl font-semibold text-foreground text-center mb-4 slide-up tracking-tight">
          {slide.title}
        </h2>
        
        <p className="text-lg text-muted-foreground text-center max-w-xs fade-in leading-relaxed">
          {slide.description}
        </p>
      </div>
      
      <div className="px-8 pb-12 relative">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        
        <Button 
          className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios tap-scale" 
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          <ArrowRight className="ml-2" size={18} strokeWidth={2} />
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <button 
            className="w-full text-muted-foreground mt-4 py-3 text-sm font-medium tap-scale"
            onClick={() => navigate('/signup')}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
