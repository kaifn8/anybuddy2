import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Shield, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    icon: Users,
    title: 'Find Your People',
    description: 'Connect with people nearby who are looking for the same things - right now.',
    gradient: 'gradient-primary',
  },
  {
    icon: Zap,
    title: 'Real-Time Requests',
    description: 'Post what you need in seconds. Watch as people nearby respond instantly.',
    gradient: 'gradient-secondary',
  },
  {
    icon: Shield,
    title: 'Safe by Design',
    description: 'Trust levels, group chats, and no random DMs. Safety built into every interaction.',
    gradient: 'gradient-hero',
  },
  {
    icon: Heart,
    title: 'Credits & Trust',
    description: 'Earn credits by helping others. Build trust through real connections.',
    gradient: 'gradient-primary',
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className={`${slide.gradient} rounded-3xl p-8 mb-8 bounce-in`} key={currentSlide}>
          <Icon size={80} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-display font-bold text-foreground text-center mb-4 slide-up">
          {slide.title}
        </h2>
        
        <p className="text-lg text-muted-foreground text-center max-w-sm fade-in">
          {slide.description}
        </p>
      </div>
      
      <div className="px-6 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
        
        <Button 
          className="w-full gradient-primary text-lg py-6 tap-scale" 
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ArrowRight className="ml-2" size={20} />
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <button 
            className="w-full text-muted-foreground mt-4 py-2"
            onClick={() => navigate('/signup')}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
