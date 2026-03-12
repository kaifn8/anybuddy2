import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageTransition } from '@/components/layout/PageTransition';
import { RequestCard } from '@/components/cards/RequestCard';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
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
  const hasAnimatedCards = useRef(false);

  // Staggered card reveal
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
    <>
    <PageTransition className="mobile-container min-h-screen bg-ambient pb-24 lg:pb-8">
      <div className="lg:hidden">
        <TopBar />
      </div>
      
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
      
      {/* Social proof banner */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-success/[0.06] border border-success/15">
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


      {/* Trending section */}
      {trending.length > 0 && (
        <div className="px-5 pt-3.5 mb-5">
          <h3 className="text-[15px] font-bold text-foreground mb-3.5 flex items-center gap-1.5">
            <span>🔥</span> Filling up fast
          </h3>
          <div ref={trendingRef} className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2 lg:mx-0 lg:px-0 lg:flex-wrap">
            {trending.map((req, i) => {
              const seatsLeft = req.seatsTotal - req.seatsTaken;
              const fillPercent = Math.round((req.seatsTaken / req.seatsTotal) * 100);
              const gradients = [
                'linear-gradient(160deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #533483 100%)',
                'linear-gradient(160deg, #0d1b2a 0%, #1b2838 35%, #1a4a5e 65%, #2d6a4f 100%)',
                'linear-gradient(160deg, #1a1423 0%, #2d1b3d 35%, #4a1942 65%, #801336 100%)',
              ];
              return (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="shrink-0 tap-scale min-w-[210px] max-w-[230px] lg:min-w-[260px] lg:max-w-[300px] overflow-hidden text-left relative"
                  style={{
                    background: gradients[i % 3],
                    borderRadius: '20px',
                    boxShadow: '0 12px 40px -8px rgba(0,0,0,0.3)',
                  }}>
                  {/* Noise texture overlay */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
                  }} />
                  {/* Soft light reflection */}
                  <div className="absolute top-0 left-0 right-0 h-[60%] opacity-[0.06]" style={{
                    background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.8) 0%, transparent 60%)',
                  }} />

                  <div className="p-4 relative z-10">
                    {/* Category + Live */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl drop-shadow-lg">{getCategoryEmoji(req.category)}</span>
                      <div className="flex items-center gap-1 px-2 py-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                        <span className="text-[9px] font-semibold text-white/70 uppercase tracking-wider">Live</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-[14px] font-bold text-white leading-tight truncate mb-1">{req.title}</h4>
                    <p className="text-[11px] text-white/40 mb-4 truncate">{req.location.name}</p>

                    {/* Avatars + spots */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[req.userName, ...req.participants.map(p => p.name)].slice(0, 3).map((name, j) => (
                            <img key={j} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt=""
                              className="w-6 h-6 rounded-full"
                              style={{ border: '2px solid rgba(255,255,255,0.15)' }} />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-white/50">{req.seatsTaken}/{req.seatsTotal}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/80 px-2.5 py-1 rounded-full" style={{
                        background: seatsLeft <= 1
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.15))'
                          : 'rgba(255,255,255,0.08)',
                      }}>
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
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide mt-1.5 lg:mx-0 lg:px-0 lg:flex-wrap">
          {QUICK_FILTERS.map((f) => (
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
              <span className="text-4xl block mb-3">🫤</span>
              <p className="text-sm font-medium text-foreground mb-1">Nothing here yet</p>
              <p className="text-xs text-muted-foreground">Be the first to post — someone's probably free.</p>
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
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Start something</h3>
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
      
    </PageTransition>
    <BottomNav />
    </>
  );
}
