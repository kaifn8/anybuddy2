import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageTransition } from '@/components/layout/PageTransition';
import { RequestCard } from '@/components/cards/RequestCard';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { MapPin, Zap, TrendingUp, Sparkles, Coffee, Footprints, UtensilsCrossed, Dumbbell, type LucideIcon } from 'lucide-react';
import type { Category, Request } from '@/types/anybuddy';

const FILTERS: { id: Category | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '' },
  { id: 'chai', label: 'Coffee', emoji: '' },
  { id: 'sports', label: 'Sports', emoji: '' },
  { id: 'food', label: 'Food', emoji: '' },
  { id: 'explore', label: 'Explore', emoji: '' },
  { id: 'work', label: 'Cowork', emoji: '' },
  { id: 'walk', label: 'Walk', emoji: '' },
  { id: 'help', label: 'Help', emoji: '' },
  { id: 'casual', label: 'Chill', emoji: '' },
];

const filterIcons: Record<string, LucideIcon> = {
  all: TrendingUp,
  chai: Coffee,
  sports: Dumbbell,
  food: UtensilsCrossed,
  explore: MapPin,
  work: Sparkles,
  walk: Footprints,
  help: Sparkles,
  casual: Sparkles,
};

const QUICK_FILTERS = [
  { id: 'near', label: 'Closest first', icon: MapPin, sort: (a: Request, b: Request) => a.location.distance - b.location.distance },
  { id: 'soon', label: 'Starting now', icon: Zap, sort: (a: Request, b: Request) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime() },
  { id: 'popular', label: 'Filling fast', icon: TrendingUp, sort: (a: Request, b: Request) => b.seatsTaken - a.seatsTaken },
];

const QUICK_CREATE: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; category: Category }[] = [
  { icon: Coffee, title: 'Grab coffee', category: 'chai' },
  { icon: Footprints, title: 'Go for walk', category: 'walk' },
  { icon: UtensilsCrossed, title: 'Get food', category: 'food' },
  { icon: Dumbbell, title: 'Play sports', category: 'sports' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, joinRequest, updateCredits, refreshFeed, user } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);
  const hasAnimatedCards = useRef(false);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    if (children.length === 0) return;
    gsap.fromTo(
      children,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out', stagger: 0.07, clearProps: 'transform' }
    );
  }, [activeFilter, quickFilter]);
  
  useEffect(() => {
    const container = trendingRef.current;
    if (!container) return;

    let resumeTimeout: ReturnType<typeof setTimeout>;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (userInteractedRef.current) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        const nextScroll = container.scrollLeft + 120;
        container.scrollTo({
          left: nextScroll >= maxScroll ? 0 : nextScroll,
          behavior: 'smooth',
        });
      }, 9000);
    };

    const handleInteraction = () => {
      userInteractedRef.current = true;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        userInteractedRef.current = false;
      }, 15000);
    };

    container.addEventListener('touchstart', handleInteraction, { passive: true });
    container.addEventListener('mousedown', handleInteraction);
    container.addEventListener('scroll', handleInteraction, { passive: true });

    startAutoScroll();

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      clearTimeout(resumeTimeout);
      container.removeEventListener('touchstart', handleInteraction);
      container.removeEventListener('mousedown', handleInteraction);
      container.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => refreshFeed(), 20000);
    return () => clearInterval(interval);
  }, [refreshFeed]);
  
  const handleJoin = (request: Request) => {
    if (!user) { navigate('/signup'); return; }
    if (joinedRequests.includes(request.id)) {
      navigate(`/request/${request.id}`);
      return;
    }
    setConfirmRequest(request);
  };

  const handleConfirmJoin = () => {
    if (!confirmRequest) return;
    joinRequest(confirmRequest.id);
    updateCredits(0.5, 'Joined a request');
    setConfirmRequest(null);
    navigate(`/request/${confirmRequest.id}`);
  };
  
  let filtered = [...requests]
    .filter(r => r.status === 'active' && (activeFilter === 'all' || r.category === activeFilter))
    .sort((a, b) => {
      const order = { now: 0, today: 1, week: 2 };
      return order[a.urgency] !== order[b.urgency]
        ? order[a.urgency] - order[b.urgency]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (quickFilter) {
    const qf = QUICK_FILTERS.find(f => f.id === quickFilter);
    if (qf) filtered = [...filtered].sort(qf.sort);
  }

  const activeCount = requests.filter(r => r.status === 'active').length;

  const trending = [...requests]
    .filter(r => r.status === 'active')
    .sort((a, b) => b.seatsTaken - a.seatsTaken)
    .slice(0, 3);

  
  return (
    <>
    <PageTransition className="mobile-container min-h-screen bg-ambient pb-24 lg:pb-8">
      <div className="lg:hidden">
        <TopBar />
      </div>
      
      {/* Desktop welcome header */}
      <div className="hidden lg:flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {user ? `Hey ${user.firstName}` : 'Discover plans nearby'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find people to hang out with right now</p>
        </div>
        <button onClick={() => navigate('/create')} className="hidden lg:flex items-center gap-2 tahoe-btn-primary px-4 py-2.5 text-sm tap-scale">
          <Sparkles size={16} /> Create a plan
        </button>
      </div>
      
      {/* Social proof banner — glass */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center gap-2 px-3.5 py-2 liquid-glass" style={{ borderRadius: '1rem' }}>
          <div className="flex -space-x-1.5 shrink-0">
            {['Felix', 'Aneka', 'Leo'].map((seed, i) => (
              <img key={i} src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`} alt="" className="w-5 h-5 rounded-full border-2 border-background" />
            ))}
          </div>
          <p className="text-[11px] text-foreground/70 font-medium">
            <span className="font-bold text-foreground">{Math.floor(Math.random() * 30) + 40} people</span> joined plans near you today
          </p>
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0 ml-auto" />
        </div>
      </div>


      {/* Trending section — glass cards */}
      {trending.length > 0 && (
        <div className="pt-3.5 mb-3">
          <h3 className="text-[15px] font-bold text-foreground mb-3.5 flex items-center gap-1.5 px-5">
            <TrendingUp size={16} className="text-primary" /> Filling up fast
          </h3>
          <div ref={trendingRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-3 lg:flex-wrap">
            {trending.map((req, i) => {
              const seatsLeft = req.seatsTotal - req.seatsTaken;
              return (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="shrink-0 liquid-glass-trending tap-scale min-w-[210px] max-w-[230px] lg:min-w-[260px] lg:max-w-[300px] text-left relative overflow-hidden">
                  {/* Glass color tint at top */}
                  <div className="absolute top-0 left-0 right-0 h-16 opacity-20" style={{
                    background: `radial-gradient(ellipse at 30% 0%, hsl(var(--primary) / 0.4), transparent 70%)`,
                  }} />

                  <div className="p-4 relative z-10">
                    {/* Category + Live */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{getCategoryEmoji(req.category)}</span>
                      <div className="flex items-center gap-1 px-2 py-[3px] rounded-full liquid-glass" style={{ borderRadius: '999px' }}>
                        <span className="w-[5px] h-[5px] rounded-full bg-success shadow-[0_0_6px_hsl(var(--success)/0.6)]" />
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Live</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-[14px] font-bold text-foreground leading-tight truncate mb-1">{req.title}</h4>
                    <p className="text-[11px] text-muted-foreground mb-4 truncate flex items-center gap-1">
                      <MapPin size={10} /> {req.location.name}
                    </p>

                    {/* Avatars + spots */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, j) => (
                            <img key={j} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt=""
                              className="w-6 h-6 rounded-full border-2 border-background" />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{req.seatsTaken}/{req.seatsTotal}</span>
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full',
                        seatsLeft <= 1
                          ? 'text-destructive bg-destructive/10'
                          : 'text-muted-foreground liquid-glass'
                      )} style={{ borderRadius: '999px' }}>
                        {seatsLeft === 0 ? 'Full' : seatsLeft === 1 ? '1 left' : `${seatsLeft} left`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}



      {/* Category filters — glass pills with icons */}
      <div className="px-5 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-5 px-5 scrollbar-hide lg:mx-0 lg:px-0 lg:flex-wrap">
          {FILTERS.map((cat) => {
            const Icon = filterIcons[cat.id] || Sparkles;
            return (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
                className={cn('shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium tap-scale transition-all flex items-center gap-1',
                  activeFilter === cat.id
                    ? 'glass-pill-active'
                    : 'glass-pill-inactive'
                )}>
                <Icon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick filters — glass pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide mt-1.5 lg:mx-0 lg:px-0 lg:flex-wrap">
          {QUICK_FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
                className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all flex items-center gap-1',
                  quickFilter === f.id ? 'glass-pill-active' : 'glass-pill-inactive'
                )}>
                <Icon size={11} /> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-1 pb-2">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">All plans</h3>
      </div>
      
      <div ref={cardsRef} className="px-5 space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3 stagger-container">
        {filtered.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isJoined={joinedRequests.includes(request.id)}
            onJoin={() => handleJoin(request)}
            onView={() => navigate(`/request/${request.id}`)}
          />
        ))}
        
        {filtered.length === 0 && (
          <div className="pt-8">
             <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl liquid-glass flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Nothing here yet</p>
              <p className="text-xs text-muted-foreground">Be the first to post — someone's probably free.</p>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1">START SOMETHING</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_CREATE.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button key={i} onClick={() => navigate('/create')}
                      className="liquid-glass-interactive p-3 text-left flex items-center gap-2">
                      <Icon size={20} className="text-primary" />
                      <span className="text-xs font-semibold">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick create bar */}
      {filtered.length > 0 && (
        <div className="px-5 mt-5 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Start something</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {QUICK_CREATE.map((s, i) => {
              const Icon = s.icon;
              return (
                <button key={i} onClick={() => navigate('/create')}
                  className="shrink-0 liquid-glass-interactive px-3.5 py-2 flex items-center gap-1.5" style={{ borderRadius: '0.75rem' }}>
                  <Icon size={14} className="text-primary" />
                  <span className="text-2xs font-semibold">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {confirmRequest && (
        <JoinConfirmDialog
          open={!!confirmRequest}
          onClose={() => setConfirmRequest(null)}
          onConfirm={handleConfirmJoin}
          request={confirmRequest}
        />
      )}
      
    </PageTransition>
    <BottomNav />
    </>
  );
}
