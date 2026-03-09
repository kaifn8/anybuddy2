import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { MapPin, ShieldCheck, BadgeCheck, Zap, Users, Star } from 'lucide-react';

const slides = [
  { id: 'people', title: 'Find Your People', description: 'Connect with people nearby who want the same things — right now.' },
  { id: 'realtime', title: 'Real-Time Vibes', description: 'Post what you need in seconds. Watch as people nearby respond instantly.' },
  { id: 'safe', title: 'Safe by Design', description: 'Trust levels, group chats, and no random DMs. Your safety comes first.' },
  { id: 'credits', title: 'Credits & Trust', description: 'Earn credits by helping others. Build trust through real connections.' },
];

const NEARBY_PEOPLE = [
  { name: 'Aarav', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav', activity: 'Looking for coffee ☕', distance: '0.3 km' },
  { name: 'Priya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', activity: 'Up for a walk 🚶', distance: '0.5 km' },
  { name: 'Rohan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', activity: 'Playing badminton 🏸', distance: '0.8 km' },
];

const LIVE_ACTIVITY = [
  { emoji: '☕', text: 'Aarav posted "Coffee at Blue Tokai"', time: 'Just now', color: 'bg-amber-500/20 text-amber-600' },
  { emoji: '✋', text: 'Priya joined your walk plan', time: '2 min ago', color: 'bg-emerald-500/20 text-emerald-600' },
  { emoji: '💬', text: '3 new messages in "Evening Run"', time: '5 min ago', color: 'bg-blue-500/20 text-blue-600' },
];

const TRUST_FEATURES = [
  { icon: ShieldCheck, label: 'Verified profiles', desc: 'Real people only' },
  { icon: Users, label: 'Group chats', desc: 'No random DMs' },
  { icon: BadgeCheck, label: 'Trust levels', desc: 'Build reputation' },
];

const EXAMPLE_PLANS = [
  { emoji: '☕', title: 'Coffee in 20 min', time: '20 min', joined: 3 },
  { emoji: '🏸', title: 'Badminton tonight', time: 'Today 7 PM', joined: 5 },
  { emoji: '🚶', title: 'Walk at Marine Drive', time: '30 min', joined: 2 },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  
  useEffect(() => {
    gsap.fromTo(visualRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    gsap.fromTo(textRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.15, ease: 'power2.out' });
  }, [currentSlide]);
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      gsap.to([visualRef.current, textRef.current], {
        opacity: 0, y: -12, duration: 0.2,
        onComplete: () => setCurrentSlide(prev => prev + 1),
      });
    } else {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
    }
  };
  
  const handleSkip = () => {
    gsap.to(containerRef.current, { opacity: 0, duration: 0.2, onComplete: () => navigate('/signup') });
  };

  const renderVisual = () => {
    switch (slide.id) {
      case 'people':
        return (
          <div className="relative w-full max-w-[300px]">
            {/* Central "you" node */}
            <div className="relative flex items-center justify-center py-6">
              <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-primary/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-56 h-56 rounded-full border border-dashed border-primary/10 animate-[spin_30s_linear_infinite_reverse]" />
              
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-2xl">👤</span>
              </div>
              
              {/* Orbiting avatars */}
              {NEARBY_PEOPLE.map((person, i) => {
                const angle = (i * 120 - 90) * (Math.PI / 180);
                const radius = 85;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <div
                    key={person.name}
                    className="absolute z-10 flex flex-col items-center"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <div className="w-12 h-12 rounded-full border-3 border-background shadow-lg overflow-hidden bg-muted">
                      <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-1 text-[9px] font-semibold text-muted-foreground">{person.distance}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Activity cards below */}
            <div className="space-y-2 mt-2">
              {NEARBY_PEOPLE.slice(0, 2).map((person, i) => (
                <div key={i} className="liquid-glass flex items-center gap-2.5 px-3 py-2" style={{ borderRadius: '0.75rem' }}>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                    <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{person.activity}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-primary font-medium">
                    <MapPin size={10} />
                    {person.distance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'realtime':
        return (
          <div className="w-full max-w-[300px] space-y-2.5">
            {/* Phone mockup with notifications */}
            <div className="relative rounded-3xl bg-gradient-to-b from-muted/50 to-muted/30 p-4 border border-border/30">
              <div className="absolute -top-2 -right-2">
                <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center animate-bounce">
                  <span className="text-[10px] text-white font-bold">3</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {LIVE_ACTIVITY.map((item, i) => (
                  <div
                    key={i}
                    className="liquid-glass flex items-start gap-2.5 px-3 py-2.5"
                    style={{ 
                      borderRadius: '0.75rem',
                      animationDelay: `${i * 0.1}s`
                    }}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <span className="text-base">{item.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium leading-tight">{item.text}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Zap size={8} className="text-primary" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold text-success">Live updates every second</span>
            </div>
          </div>
        );

      case 'safe':
        return (
          <div className="w-full max-w-[300px]">
            {/* Shield visual */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <BadgeCheck size={14} className="text-white" />
                </div>
              </div>
            </div>
            
            {/* Trust features */}
            <div className="space-y-2">
              {TRUST_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="liquid-glass flex items-center gap-3 px-4 py-3"
                  style={{ borderRadius: '0.875rem' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold">{feature.label}</p>
                    <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-[10px]">✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'credits':
        return (
          <div className="w-full max-w-[300px]">
            {/* Credits visual */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 border border-amber-500/20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Star className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <p className="text-[18px] font-bold text-amber-600">2.5 credits</p>
                  <p className="text-[10px] text-muted-foreground">Starter balance</p>
                </div>
              </div>
            </div>
            
            {/* Live plans */}
            <p className="text-[10px] text-muted-foreground font-semibold mb-2.5 uppercase tracking-wide text-center">People nearby are doing</p>
            <div className="space-y-2">
              {EXAMPLE_PLANS.map((plan, i) => (
                <div key={i} className="liquid-glass flex items-center gap-2.5 px-3 py-2.5 text-left" style={{ borderRadius: '0.75rem' }}>
                  <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">
                    <span className="text-lg">{plan.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold">{plan.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{plan.time}</span>
                      <span className="text-[9px] text-primary font-medium">{plan.joined} joined</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] text-success font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  
  return (
    <div ref={containerRef} className="mobile-container min-h-screen flex flex-col bg-ambient">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8">
        <div ref={visualRef} className="mb-6 w-full flex justify-center">
          {renderVisual()}
        </div>
        
        <div ref={textRef} className="text-center max-w-[280px]">
          <h2 className="text-[22px] font-bold text-foreground mb-2">{slide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{slide.description}</p>
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="px-6 pb-10">
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
        
        <Button className="w-full h-12 text-[15px] font-semibold" onClick={handleNext}>
          {isLastSlide ? 'Get Started' : 'Continue'}
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <button className="w-full text-muted-foreground mt-3 py-2 text-sm font-medium tap-scale" onClick={handleSkip}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
