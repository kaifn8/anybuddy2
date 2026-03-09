import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { MapPin, ShieldCheck, BadgeCheck, Zap, Users, Star } from 'lucide-react';

const slides = [
  { id: 'people', title: "Someone's waiting", description: "Right now, people near you want the same thing. Don't miss them." },
  { id: 'realtime', title: 'Gone in minutes', description: 'Post in 10 seconds. Get replies before your coffee cools.' },
  { id: 'safe', title: 'No creeps. Ever.', description: 'No random DMs. No strangers stalking. Just group hangs with real people.' },
  { id: 'credits', title: 'Give to get', description: 'Help others, earn credits. The more you give, the more you unlock.' },
];

const NEARBY_PEOPLE = [
  { name: 'Aarav', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav', activity: 'Wants coffee now ☕', distance: '0.3 km' },
  { name: 'Priya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', activity: 'Looking for walk buddy 🚶', distance: '0.5 km' },
  { name: 'Rohan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', activity: 'Needs +1 for badminton 🏸', distance: '0.8 km' },
];

const LIVE_ACTIVITY = [
  { emoji: '☕', text: 'Aarav needs coffee buddy — 2 spots left', time: 'Just now', color: 'bg-amber-500/20 text-amber-600' },
  { emoji: '✋', text: 'Priya joined your plan!', time: '2 min ago', color: 'bg-emerald-500/20 text-emerald-600' },
  { emoji: '🔥', text: '"Evening Run" filling up fast', time: '5 min ago', color: 'bg-blue-500/20 text-blue-600' },
];

const TRUST_FEATURES = [
  { icon: ShieldCheck, label: 'Verified humans', desc: 'No bots, no fakes' },
  { icon: Users, label: 'Group-only', desc: 'Zero creepy DMs' },
  { icon: BadgeCheck, label: 'Earn trust', desc: 'Show up, level up' },
];

const EXAMPLE_PLANS = [
  { emoji: '☕', title: 'Coffee in 20 min', time: '⏱ 20 min', joined: 3 },
  { emoji: '🏸', title: 'Badminton — need 1 more', time: '🔥 Filling up', joined: 5 },
  { emoji: '🚶', title: 'Marine Drive walk', time: '⚡ Starting soon', joined: 2 },
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
          <div className="relative w-full max-w-[320px]">
            {/* Premium glass card */}
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 340 }}>
              {/* Gradient mesh background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/15" />
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-secondary/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
              </div>
              
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
              
              {/* Animated radar rings */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute w-64 h-64 -top-32 -left-32 rounded-full border border-primary/10" style={{ animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                <div className="absolute w-44 h-44 -top-[88px] -left-[88px] rounded-full border border-primary/15" style={{ animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '1s' }} />
                <div className="absolute w-28 h-28 -top-14 -left-14 rounded-full border-2 border-primary/20" style={{ animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '2s' }} />
              </div>

              {/* Center — You indicator */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/40 border-4 border-background">
                    <MapPin size={26} className="text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-[3px] border-background flex items-center justify-center">
                    <span className="text-[8px] text-success-foreground font-bold">✓</span>
                  </div>
                </div>
                <div className="mt-2 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-bold shadow-lg">
                  You're here
                </div>
              </div>

              {/* Floating person cards */}
              {NEARBY_PEOPLE.map((person, i) => {
                const configs = [
                  { top: '12%', left: '8%', rotate: '-6deg', delay: '0s' },
                  { top: '15%', right: '5%', rotate: '4deg', delay: '0.5s' },
                  { bottom: '18%', left: '12%', rotate: '-3deg', delay: '1s' },
                ];
                const cfg = configs[i];
                return (
                  <div
                    key={person.name}
                    className="absolute z-10"
                    style={{
                      ...cfg,
                      transform: `rotate(${cfg.rotate})`,
                      animation: `float 4s ease-in-out infinite`,
                      animationDelay: cfg.delay,
                    }}
                  >
                    <div className="flex items-center gap-2 px-2.5 py-2 rounded-2xl bg-background/90 backdrop-blur-md shadow-xl border border-border/30">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-background shadow-md">
                          <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background animate-pulse" />
                      </div>
                      <div className="pr-1">
                        <p className="text-[11px] font-bold text-foreground leading-tight">{person.name}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{person.activity}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom glass bar */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3.5 bg-background/80 backdrop-blur-md border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {NEARBY_PEOPLE.map((p, i) => (
                        <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-background">
                          <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">{NEARBY_PEOPLE.length} waiting nearby</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 border border-success/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[9px] text-success font-bold">LIVE</span>
                  </div>
                </div>
              </div>
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
            {/* Safety visual — layered card */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-success/[0.08] via-background to-primary/[0.05] border border-success/15 p-5">
              {/* Large shield */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[1.75rem] bg-success/10 blur-xl scale-125" />
                  <div className="relative w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center border border-success/25 shadow-lg shadow-success/10">
                    <ShieldCheck className="w-10 h-10 text-success" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-success flex items-center justify-center shadow-md shadow-success/30 border-2 border-background">
                    <BadgeCheck size={14} className="text-success-foreground" />
                  </div>
                </div>
              </div>

              {/* Trust checklist */}
              <div className="space-y-2">
                {TRUST_FEATURES.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                      <feature.icon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold">{feature.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center border border-success/20">
                      <span className="text-success text-[11px] font-bold">✓</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom trust meter */}
              <div className="mt-4 px-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Your safety score</span>
                  <span className="text-[11px] font-bold text-success">Protected</span>
                </div>
                <div className="w-full h-2 rounded-full bg-foreground/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-success/60 to-success" style={{ width: '100%' }} />
                </div>
              </div>
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
