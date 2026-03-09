import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import type { Category, Request } from '@/types/anybuddy';

const FILTERS: { id: Category | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'chai', label: 'Coffee', emoji: '☕' },
  { id: 'sports', label: 'Sports', emoji: '🏸' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'explore', label: 'Explore', emoji: '🧭' },
  { id: 'work', label: 'Cowork', emoji: '💻' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'help', label: 'Help', emoji: '🤝' },
  { id: 'casual', label: 'Chill', emoji: '✨' },
];

const QUICK_FILTERS = [
  { id: 'near', label: '📍 Closest first', sort: (a: Request, b: Request) => a.location.distance - b.location.distance },
  { id: 'soon', label: '⚡ Starting now', sort: (a: Request, b: Request) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime() },
  { id: 'popular', label: '🔥 Filling fast', sort: (a: Request, b: Request) => b.seatsTaken - a.seatsTaken },
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
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);
  
  // Removed startup animation per user request
  
  // Auto-scroll trending section
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

  // Trending: most joined plans
  const trending = [...requests]
    .filter(r => r.status === 'active')
    .sort((a, b) => b.seatsTaken - a.seatsTaken)
    .slice(0, 3);

  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24 lg:pb-8">
      <TopBar />
      
      {/* Desktop welcome header */}
      <div className="hidden lg:flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {user ? `Hey ${user.firstName} 👋` : 'Discover plans nearby'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find people to hang out with right now</p>
        </div>
        <button onClick={() => navigate('/create')} className="hidden lg:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm tap-scale shadow-lg shadow-primary/20">
          🪄 Create a plan
        </button>
      </div>
      
      {/* Greeting - compact */}



      {/* Trending section */}
      {trending.length > 0 && (
        <div className="px-5 pt-3.5 mb-5">
          <h3 className="text-[15px] font-bold text-foreground mb-3.5 flex items-center gap-1.5">
            <span>🔥</span> Filling up fast
          </h3>
          <div ref={trendingRef} className="flex gap-3.5 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1 lg:mx-0 lg:px-0 lg:flex-wrap">
            {trending.map((req, i) => {
              const seatsLeft = req.seatsTotal - req.seatsTaken;
              const fillPercent = Math.round((req.seatsTaken / req.seatsTotal) * 100);
              const tints = [
                'linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(25 95% 60% / 0.18) 50%, hsl(350 80% 55% / 0.1) 100%)',
                'linear-gradient(135deg, hsl(220 80% 55% / 0.12) 0%, hsl(260 70% 60% / 0.18) 50%, hsl(280 60% 55% / 0.1) 100%)',
                'linear-gradient(135deg, hsl(160 60% 45% / 0.12) 0%, hsl(180 70% 45% / 0.18) 50%, hsl(200 65% 50% / 0.1) 100%)',
              ];
              return (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="shrink-0 tap-scale min-w-[210px] max-w-[230px] lg:min-w-[260px] lg:max-w-[300px] rounded-2xl overflow-hidden text-left"
                  style={{
                    background: tints[i % tints.length],
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getCategoryEmoji(req.category)}</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {req.seatsTaken}/{req.seatsTotal} joined
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-foreground truncate mb-1">{req.title}</p>
                    <p className="text-[12px] text-muted-foreground mb-2.5">📍 {req.location.name}</p>
                    <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${fillPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {seatsLeft === 0 ? '🔴 Full' : seatsLeft === 1 ? '🟡 1 spot left' : `${seatsLeft} spots left`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}



      {/* Category filters */}
      <div className="px-5 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-5 px-5 scrollbar-hide lg:mx-0 lg:px-0 lg:flex-wrap">
          {FILTERS.map((cat) => (
            <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium tap-scale transition-all flex items-center gap-1',
                activeFilter === cat.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-foreground/5 text-muted-foreground'
              )}>
              <span className="text-[11px]">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide mt-1.5">
          {QUICK_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all',
                quickFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {f.label}
            </button>
          ))}
            <button key={f.id} onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all',
                quickFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-1 pb-2">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">All plans</h3>
      </div>
      
      <div ref={cardsRef} className="px-5 space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3">
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
              <span className="text-4xl block mb-3">😔</span>
              <p className="text-sm font-medium text-foreground mb-1">Nothing happening... yet</p>
              <p className="text-xs text-muted-foreground">Be the first. Someone's probably waiting.</p>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1">START SOMETHING</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_CREATE.map((s, i) => (
                  <button key={i} onClick={() => navigate('/create')}
                    className="liquid-glass p-3 text-left tap-scale flex items-center gap-2" style={{ borderRadius: '0.875rem' }}>
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-xs font-semibold">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick create bar at bottom of feed */}
      {filtered.length > 0 && (
        <div className="px-5 mt-5 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Need company?</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {QUICK_CREATE.map((s, i) => (
              <button key={i} onClick={() => navigate('/create')}
                className="shrink-0 liquid-glass px-3.5 py-2 tap-scale flex items-center gap-1.5" style={{ borderRadius: '0.75rem' }}>
                <span className="text-sm">{s.emoji}</span>
                <span className="text-2xs font-semibold">{s.title}</span>
              </button>
            ))}
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
      
      <BottomNav />
    </div>
  );
}
