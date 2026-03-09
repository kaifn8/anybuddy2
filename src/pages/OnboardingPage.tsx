import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { MapPin, ShieldCheck, BadgeCheck, Zap, Users, Star, ArrowLeft } from 'lucide-react';

const slides = [
  { id: 'people', title: "Friends busy?", description: "Find people nearby who are up for coffee, food, walks, or games right now." },
  { id: 'realtime', title: 'Plans keep falling through?', description: 'Post in seconds. People nearby can join in minutes.' },
  { id: 'safe', title: 'No DMs. No creeps.', description: 'Group-only hangouts. Verified people.\nJust show up and vibe.' },
  { id: 'credits', title: 'Show up. Level up.', description: 'Every plan you join earns you credits.\nThe more reliable you are, the more you unlock.' },
];

const NEARBY_PEOPLE = [
  { name: 'Aarav', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Felix&backgroundColor=b6e3f4', activity: 'Wants coffee now ☕', distance: '0.3 km' },
  { name: 'Priya', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Aneka&backgroundColor=ffd5dc', activity: 'Looking for walk buddy 🚶', distance: '0.5 km' },
  { name: 'Rohan', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Leo&backgroundColor=c0aede', activity: 'Needs +1 for badminton 🏸', distance: '0.8 km' },
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
          <div className="w-full max-w-[320px]">
            {/* Clean card */}
            <div className="relative rounded-[28px] bg-gradient-to-b from-primary/8 via-background to-background border border-border/30 overflow-hidden px-5 pt-7 pb-5" style={{ height: 340 }}>

              {/* Soft top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full bg-primary/20 blur-[50px] pointer-events-none" />

              {/* Avatars row — centered, clean */}
              <div className="flex justify-center gap-3 mb-5 relative z-10">
                {NEARBY_PEOPLE.map((p, i) => (
                  <div key={p.name} className="flex flex-col items-center gap-1.5"
                    style={{ animation: 'fade-in 0.4s ease-out both', animationDelay: `${i * 0.12}s` }}>
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-background shadow-md">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-background" />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Activity pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-5 relative z-10">
                {[
                  { emoji: '☕', label: 'Coffee' },
                  { emoji: '🍜', label: 'Food' },
                  { emoji: '🚶', label: 'Walk' },
                  { emoji: '🏸', label: 'Badminton' },
                  { emoji: '🎮', label: 'Games' },
                ].map((a, i) => (
                  <span key={a.label}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-border/40 text-[12px] font-medium text-foreground shadow-sm"
                    style={{ animation: 'scale-in 0.3s ease-out both', animationDelay: `${0.2 + i * 0.07}s` }}>
                    {a.emoji} {a.label}
                  </span>
                ))}
              </div>

              {/* Live strip */}
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background/80 border border-border/30 relative z-10 mt-auto">
                <div className="flex -space-x-2">
                  {NEARBY_PEOPLE.map((p, i) => (
                    <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-background">
                      <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[12px] font-semibold text-foreground">3 people nearby</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 border border-success/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-success font-bold">LIVE</span>
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
          <div className="relative w-full max-w-[320px]">
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 360 }}>
              {/* Rich gradient background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-success/15 via-background to-primary/10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-success/20 blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-primary/15 blur-[60px]" />
              </div>
              
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />
              
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
              
              {/* Central shield with animated rings */}
              <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {/* Protective rings */}
                <div className="absolute w-40 h-40 -top-20 -left-20 rounded-full border-2 border-success/20 animate-pulse" />
                <div className="absolute w-28 h-28 -top-14 -left-14 rounded-full border-2 border-success/30" style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '0.5s' }} />
                
                {/* Main shield */}
                <div className="relative">
                  <div className="absolute inset-0 w-24 h-24 -m-2 rounded-[2rem] bg-success/30 blur-2xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-success via-success/90 to-success/70 flex items-center justify-center shadow-2xl shadow-success/40 border-4 border-background">
                    <ShieldCheck className="w-10 h-10 text-success-foreground" strokeWidth={2} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background flex items-center justify-center shadow-lg border-2 border-success">
                    <BadgeCheck size={14} className="text-success" />
                  </div>
                </div>
              </div>
              
              {/* Blocked message floating left */}
              <div className="absolute top-[15%] left-[5%] z-20" style={{ animation: 'float 5s ease-in-out infinite' }}>
                <div className="relative px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-destructive text-sm">🚫</span>
                    <span className="text-[10px] text-destructive/80 font-medium line-through">Random DM</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                    <span className="text-[8px] text-destructive-foreground font-bold">✕</span>
                  </div>
                </div>
              </div>
              
              {/* Blocked message floating right */}
              <div className="absolute top-[8%] right-[8%] z-20" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}>
                <div className="relative px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 backdrop-blur-xl shadow-lg transform rotate-3">
                  <div className="flex items-center gap-2">
                    <span className="text-destructive text-sm">👻</span>
                    <span className="text-[10px] text-destructive/80 font-medium line-through">Stalker</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                    <span className="text-[8px] text-destructive-foreground font-bold">✕</span>
                  </div>
                </div>
              </div>
              
              {/* Trust features list */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-4 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
                <div className="space-y-2">
                  {TRUST_FEATURES.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/70 backdrop-blur-md border border-border/20 shadow-sm"
                      style={{ animation: 'fade-in 0.4s ease-out forwards', animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center shrink-0 border border-success/15">
                        <feature.icon size={16} className="text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground">{feature.label}</p>
                        <p className="text-[9px] text-muted-foreground">{feature.desc}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                        <span className="text-success text-[10px]">✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'credits':
        return (
          <div className="w-full max-w-[320px]">
            <div className="relative rounded-[28px] bg-gradient-to-b from-primary/8 via-background to-background border border-border/30 overflow-hidden px-5 pt-6 pb-5" style={{ height: 340 }}>
              
              {/* Soft glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full bg-primary/15 blur-[50px] pointer-events-none" />

              {/* Credit card */}
              <div className="relative z-10 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/15 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Star className="w-5 h-5 text-primary-foreground" fill="currentColor" />
                </div>
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-foreground">2.5 credits</p>
                  <p className="text-[10px] text-muted-foreground">Your starter balance</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-success/15 border border-success/25">
                  <span className="text-[10px] text-success font-bold">FREE</span>
                </div>
              </div>

              {/* How it works steps */}
              <p className="text-[10px] text-muted-foreground font-semibold mb-3 uppercase tracking-wider text-center relative z-10">How it works</p>
              <div className="space-y-2 relative z-10">
                {[
                  { emoji: '📍', text: 'Join a plan nearby', detail: '-0.5 credits', detailColor: 'text-destructive' },
                  { emoji: '✅', text: 'Show up on time', detail: '+1.0 credits', detailColor: 'text-success' },
                  { emoji: '⭐', text: 'Get a good review', detail: '+0.5 bonus', detailColor: 'text-success' },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-background/70 backdrop-blur-md border border-border/20 shadow-sm"
                    style={{ animation: 'fade-in 0.4s ease-out forwards', animationDelay: `${i * 0.12}s` }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      <span className="text-base">{step.emoji}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground flex-1">{step.text}</p>
                    <span className={`text-[11px] font-bold ${step.detailColor}`}>{step.detail}</span>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-semibold text-success">Reliable people unlock premium plans</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  
  const handleBack = () => {
    if (currentSlide > 0) {
      gsap.to([visualRef.current, textRef.current], {
        opacity: 0, y: 12, duration: 0.15,
        onComplete: () => setCurrentSlide(prev => prev - 1),
      });
    }
  };
  
  return (
    <div ref={containerRef} className="mobile-container min-h-screen flex flex-col bg-ambient">
      {/* Top bar with back button */}
      {currentSlide > 0 && (
        <div className="px-4 pt-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-muted-foreground tap-scale py-2 pr-3"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4">
        <div ref={visualRef} className="mb-6 w-full flex justify-center">
          {renderVisual()}
        </div>
        
        <div ref={textRef} className="text-center max-w-[280px]">
          <h2 className="text-[22px] font-bold text-foreground mb-2">{slide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{slide.description}</p>
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
        
        <Button 
          className="w-full h-11 text-[15px] font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          onClick={handleNext}
        >
          {isLastSlide ? "Let's go 🚀" : 'Continue →'}
        </Button>
        
        {currentSlide < slides.length - 1 && (
          <button 
            className="w-full mt-3 py-2.5 text-sm font-semibold text-muted-foreground/60 hover:text-muted-foreground tap-scale transition-colors rounded-xl"
            onClick={handleSkip}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
