import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { MapPin, ShieldCheck, BadgeCheck, Zap, Users, Star, ArrowLeft } from 'lucide-react';

const slides = [
  { id: 'people', title: "Everyone's busy.\nYou're not.", description: "127 people near you are looking for company right now. Don't sit this one out." },
  { id: 'realtime', title: 'While you scroll,\nplans fill up.', description: '3 plans near you filled in the last hour.\nPost in seconds. People join in minutes.' },
  { id: 'safe', title: 'No DMs. No weirdos.\nJust real people.', description: 'Group-only meetups. Verified humans.\nEvery person earns their trust score.' },
  { id: 'credits', title: 'The more you show up,\nthe more doors open.', description: 'Reliable people get priority access,\nlower costs, and exclusive plans others can\'t see.' },
];

const NEARBY_PEOPLE = [
  { name: 'Aarav', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Felix&backgroundColor=b6e3f4', activity: 'Waiting for a coffee buddy ☕', distance: '0.3 km' },
  { name: 'Priya', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Aneka&backgroundColor=ffd5dc', activity: 'Hoping someone joins her walk 🚶', distance: '0.5 km' },
  { name: 'Rohan', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Leo&backgroundColor=c0aede', activity: 'Needs 1 more for badminton 🏸', distance: '0.8 km' },
];

const LIVE_ACTIVITY = [
  { emoji: '☕', text: 'Aarav\'s coffee plan — only 1 spot left', time: 'Just now', color: 'bg-amber-500/20 text-amber-600' },
  { emoji: '✋', text: 'Priya joined before you could!', time: '2 min ago', color: 'bg-emerald-500/20 text-emerald-600' },
  { emoji: '🔥', text: '"Evening Run" full — you missed it', time: '5 min ago', color: 'bg-destructive/20 text-destructive' },
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
            <div className="relative rounded-[28px] bg-gradient-to-b from-primary/12 via-primary/4 to-background border border-border/30 overflow-hidden" style={{ height: 360 }}>

              {/* Ambient glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-primary/25 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-10 -left-10 w-32 h-32 rounded-full bg-success/15 blur-[40px] pointer-events-none" />
              <div className="absolute top-20 -right-8 w-28 h-28 rounded-full bg-accent/15 blur-[35px] pointer-events-none" />

              {/* Radar rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] pointer-events-none">
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute inset-0 rounded-full border border-primary/8" 
                    style={{ 
                      transform: `scale(${0.4 + i * 0.3})`,
                      animation: `pulse 3s ease-in-out ${i * 0.5}s infinite`,
                      opacity: 1 - i * 0.25,
                    }} />
                ))}
                {/* Center pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <MapPin size={16} className="text-primary" />
                </div>
              </div>

              {/* Floating avatar cards */}
              <div className="relative z-10 h-full px-4 pt-6 pb-4 flex flex-col">
                <div className="flex-1 relative">
                  {NEARBY_PEOPLE.map((p, i) => {
                    const positions = [
                      { top: '8%', left: '8%', rotate: '-3deg' },
                      { top: '5%', right: '6%', rotate: '2deg' },
                      { top: '42%', left: '22%', rotate: '-1deg' },
                    ];
                    const pos = positions[i];
                    return (
                      <div key={p.name} className="absolute"
                        style={{ ...pos, animation: `fade-in 0.5s ease-out both`, animationDelay: `${i * 0.15}s` }}>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/40 shadow-lg"
                          style={{ transform: `rotate(${pos.rotate})` }}>
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background shadow-sm">
                              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-foreground leading-tight">{p.name}</p>
                            <p className="text-[9px] text-muted-foreground">{p.activity}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Activity pills row */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-3 relative z-10">
                  {[
                    { emoji: '☕', label: 'Coffee' },
                    { emoji: '🍜', label: 'Food' },
                    { emoji: '🚶', label: 'Walk' },
                    { emoji: '🏸', label: 'Sports' },
                    { emoji: '🎮', label: 'Games' },
                  ].map((a, i) => (
                    <span key={a.label}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 text-[10px] font-semibold text-foreground shadow-sm"
                      style={{ animation: 'scale-in 0.3s ease-out both', animationDelay: `${0.3 + i * 0.06}s` }}>
                      {a.emoji} {a.label}
                    </span>
                  ))}
                </div>

                {/* Bottom live bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/30 shadow-md relative z-10">
                  <div className="flex -space-x-2">
                    {NEARBY_PEOPLE.map((p, i) => (
                      <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm">
                        <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[8px] font-bold text-muted-foreground">+5</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">8 people nearby</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 border border-success/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-success font-bold tracking-wide">LIVE</span>
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
            <div className="relative rounded-[28px] overflow-hidden" style={{ height: 370 }}>
              {/* Rich gradient background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-amber-500/8" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full bg-primary/20 blur-[70px]" />
                <div className="absolute bottom-0 right-0 w-44 h-44 rounded-full bg-amber-400/15 blur-[60px]" />
              </div>

              {/* Subtle grid */}
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              <div className="relative z-10 px-5 pt-5 pb-4 h-full flex flex-col">
                {/* Animated credit counter */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 w-20 h-20 rounded-[1.5rem] bg-primary/25 blur-2xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-background">
                      <Star className="w-7 h-7 text-primary-foreground" fill="currentColor" />
                    </div>
                    {/* Floating +1 badge */}
                    <div className="absolute -top-2 -right-3 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
                      +1.0
                    </div>
                  </div>
                </div>

                {/* Balance display */}
                <div className="text-center mb-4">
                  <p className="text-[28px] font-bold text-foreground tracking-tight">2.5</p>
                  <p className="text-[11px] text-muted-foreground font-medium -mt-0.5">starter credits</p>
                </div>

                {/* Journey visualization - connected steps */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute left-[19px] top-5 bottom-5 w-[2px] bg-gradient-to-b from-primary/30 via-success/40 to-success/30 rounded-full" />
                    
                    <div className="space-y-3">
                      {[
                        { emoji: '📍', text: 'Join a plan', detail: '-0.5', color: 'bg-primary/12 border-primary/20', dotColor: 'bg-primary' },
                        { emoji: '🤝', text: 'Show up on time', detail: '+1.0', color: 'bg-success/12 border-success/20', dotColor: 'bg-success' },
                        { emoji: '⭐', text: 'Earn a great review', detail: '+0.5', color: 'bg-amber-500/12 border-amber-500/20', dotColor: 'bg-amber-500' },
                      ].map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 relative"
                          style={{ animation: 'fade-in 0.4s ease-out forwards', animationDelay: `${i * 0.15}s` }}
                        >
                          {/* Step dot */}
                          <div className={`w-10 h-10 rounded-xl ${step.color} border flex items-center justify-center shrink-0 backdrop-blur-sm relative z-10`}>
                            <span className="text-base">{step.emoji}</span>
                          </div>
                          <p className="text-[12px] font-semibold text-foreground flex-1">{step.text}</p>
                          <span className={`text-[13px] font-bold tabular-nums ${
                            step.detail.startsWith('+') ? 'text-success' : 'text-muted-foreground'
                          }`}>{step.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom tagline */}
                <div className="flex items-center justify-center gap-2 mt-3 px-3 py-2 rounded-xl bg-background/60 backdrop-blur-md border border-border/15">
                  <div className="flex -space-x-1.5">
                    {['🥇', '🥈', '🥉'].map((m, i) => (
                      <span key={i} className="text-sm">{m}</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/80">Top contributors unlock exclusive plans</span>
                </div>
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
