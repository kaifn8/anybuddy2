import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageTransition } from '@/components/layout/PageTransition';
import { RequestCard } from '@/components/cards/RequestCard';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import { DailyQuestCard } from '@/components/gamification/DailyQuestCard';
import type { Category, Request } from '@/types/anybuddy';

const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chai', label: 'Coffee' },
  { id: 'sports', label: 'Sports' },
  { id: 'food', label: 'Food' },
  { id: 'explore', label: 'Explore' },
  { id: 'work', label: 'Cowork' },
  { id: 'walk', label: 'Walk' },
  { id: 'help', label: 'Help' },
  { id: 'casual', label: 'Chill' },
];

const filterEmojis: Record<string, string> = {
  all: '🔥',
  chai: '☕',
  sports: '🏸',
  food: '🍜',
  explore: '🧭',
  work: '💻',
  walk: '🚶',
  help: '🤝',
  casual: '🤙',
};

const QUICK_FILTERS = [
  { id: 'near', label: 'Closest first', emoji: '📍', sort: (a: Request, b: Request) => a.location.distance - b.location.distance },
  { id: 'soon', label: 'Starting now', emoji: '⚡', sort: (a: Request, b: Request) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime() },
  { id: 'popular', label: 'Filling fast', emoji: '🔥', sort: (a: Request, b: Request) => b.seatsTaken - a.seatsTaken },
];

const QUICK_CREATE: { emoji: string; title: string; category: Category }[] = [
  { emoji: '☕', title: 'Grab coffee', category: 'chai' },
  { emoji: '🚶', title: 'Go for walk', category: 'walk' },
  { emoji: '🍜', title: 'Get food', category: 'food' },
  { emoji: '🏸', title: 'Play sports', category: 'sports' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, joinRequest, updateCredits, refreshFeed, user } = useAppStore();
  const { addXP, recordActivity, progressQuest } = useGamificationStore();
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  const [showQuestCard, setShowQuestCard] = useState(false);
  
  const cardsRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    if (children.length === 0) return;
    gsap.fromTo(children, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' });
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
        const nextScroll = container.scrollLeft + 140;
        container.scrollTo({ left: nextScroll >= maxScroll ? 0 : nextScroll, behavior: 'smooth' });
      }, 9000);
    };
    const handleInteraction = () => {
      userInteractedRef.current = true;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => { userInteractedRef.current = false; }, 15000);
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
    if (joinedRequests.includes(request.id)) { navigate(`/request/${request.id}`); return; }
    setConfirmRequest(request);
  };

  const handleConfirmJoin = () => {
    if (!confirmRequest) return;
    joinRequest(confirmRequest.id);
    updateCredits(0.5, 'Joined a request');
    addXP('join_hangout', 'Joined a hangout');
    recordActivity();
    progressQuest('join_1_activity');
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

  const trending = [...requests]
    .filter(r => r.status === 'active')
    .sort((a, b) => b.seatsTaken - a.seatsTaken)
    .slice(0, 3);

  return (
    <>
    <PageTransition className="mobile-container min-h-screen bg-background pb-24 lg:pb-8">
      <div className="lg:hidden">
        <TopBar />
      </div>
      
      <div className="hidden lg:flex items-center justify-between px-6 pt-5 pb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {user ? `Hey ${user.firstName}` : 'Discover plans nearby'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find people to hang out with right now</p>
        </div>
        <button onClick={() => navigate('/create')} className="hidden lg:flex items-center gap-2 tahoe-btn-primary px-5 py-2.5 text-sm tap-scale">
          ✨ Create a plan
        </button>
      </div>
      
      {/* Social proof */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center gap-2.5 px-4 py-2.5 liquid-glass" style={{ borderRadius: '1rem' }}>
          <div className="flex -space-x-1.5 shrink-0">
            {['Felix', 'Aneka', 'Leo'].map((seed, i) => (
              <GradientAvatar key={i} name={seed} size={20} className="border-[1.5px] border-background" showInitials={false} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground font-medium flex-1">
            <span className="font-bold text-foreground">{Math.floor(Math.random() * 30) + 40} people</span> joined plans near you today
          </p>
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
        </div>
      </div>

      {/* Streak + Quest nudge row */}
      <div className="px-5 pt-2 pb-1 flex gap-2">
        <button
          onClick={() => navigate('/quests')}
          className="flex-1 liquid-glass-interactive flex items-center gap-2.5 px-3 py-2.5"
          style={{ borderRadius: '0.875rem' }}
        >
          <StreakWidget compact />
          <span className="text-muted-foreground/25 text-[10px]">•</span>
          <span className="text-[11px] font-semibold text-muted-foreground flex-1 truncate">Daily quests</span>
          <span className="text-[10px] text-primary font-bold">→</span>
        </button>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="pt-5 mb-1">
          <div className="flex items-center px-5 mb-4">
            <h3 className="text-[15px] font-bold text-foreground flex items-center gap-2 tracking-tight">
              🚀 Filling up fast
            </h3>
          </div>
          <div ref={trendingRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-4 lg:flex-wrap snap-x snap-mandatory">
            {trending.map((req) => {
              const seatsLeft = req.seatsTotal - req.seatsTaken;
              return (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="shrink-0 liquid-glass-trending tap-scale min-w-[220px] max-w-[240px] lg:min-w-[280px] lg:max-w-[320px] text-left relative overflow-hidden snap-start">
                  <div className="absolute inset-0 opacity-[0.06]" style={{
                    background: `radial-gradient(ellipse at 20% 10%, hsl(var(--primary)), transparent 70%)`,
                  }} />
                  <div className="relative z-10" style={{ padding: '1.125rem' }}>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center text-xl" style={{ borderRadius: '0.75rem' }}>
                        {getCategoryEmoji(req.category)}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full liquid-glass" style={{ borderRadius: '999px' }}>
                        <span className="w-[5px] h-[5px] rounded-full bg-success shadow-[0_0_6px_hsl(var(--success)/0.5)]" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.08em]">Live</span>
                      </div>
                    </div>
                    <h4 className="text-[15px] font-bold text-foreground leading-snug truncate mb-1 tracking-tight">{req.title}</h4>
                    <p className="text-[11px] text-muted-foreground mb-5 truncate flex items-center gap-1">
                      📍 {req.location.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex -space-x-2">
                          {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, j) => (
                            <GradientAvatar key={j} name={name} size={24} className="border-[1.5px] border-background" showInitials={false} />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{req.seatsTaken}/{req.seatsTotal}</span>
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full',
                        seatsLeft <= 1 ? 'text-destructive bg-destructive/10' : 'text-muted-foreground liquid-glass'
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

      {/* Category filters */}
      <div className="px-5 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide lg:mx-0 lg:px-0 lg:flex-wrap">
          {FILTERS.map((cat) => {
            const emoji = filterEmojis[cat.id] || '✨';
            return (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
                className={cn('shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all flex items-center gap-1.5',
                  activeFilter === cat.id ? 'glass-pill-active' : 'glass-pill-inactive'
                )}>
                <span className="text-[11px]">{emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2.5 -mx-5 px-5 scrollbar-hide mt-1 lg:mx-0 lg:px-0 lg:flex-wrap">
          {QUICK_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all flex items-center gap-1',
                quickFilter === f.id ? 'glass-pill-active' : 'glass-pill-inactive'
              )}>
              <span className="text-[10px]">{f.emoji}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-1 pb-3">
        <h3 className="section-label">{activeFilter === 'all' ? 'All plans' : `${FILTERS.find(f => f.id === activeFilter)?.label} plans`}</h3>
      </div>
      
      <div ref={cardsRef} className="px-5 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3 stagger-container">
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
          <div className="pt-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Nothing here yet</p>
              <p className="text-sm text-muted-foreground">Be the first to post — someone's probably free.</p>
            </div>
            <div>
              <h3 className="section-label mb-3 px-1">Start something</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_CREATE.map((s, i) => (
                  <button key={i} onClick={() => navigate('/create')}
                    className="liquid-glass-interactive p-4 text-left flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0" style={{ borderRadius: '0.75rem' }}>
                      <span className="text-lg">{s.emoji}</span>
                    </div>
                    <span className="text-[13px] font-semibold tracking-tight">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="px-5 mt-6 mb-3">
          <h3 className="section-label mb-2.5">Start something</h3>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {QUICK_CREATE.map((s, i) => (
              <button key={i} onClick={() => navigate('/create')}
                className="shrink-0 liquid-glass-interactive px-4 py-2.5 flex items-center gap-2" style={{ borderRadius: '0.875rem' }}>
                <span className="text-sm">{s.emoji}</span>
                <span className="text-xs font-semibold tracking-tight">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {confirmRequest && (
        <JoinConfirmDialog open={!!confirmRequest} onClose={() => setConfirmRequest(null)} onConfirm={handleConfirmJoin} request={confirmRequest} />
      )}
    </PageTransition>
    <BottomNav />
    </>
  );
}
