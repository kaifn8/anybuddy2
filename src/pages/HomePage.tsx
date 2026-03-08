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
  { id: 'chai', label: 'Chai', emoji: '☕' },
  { id: 'sports', label: 'Sports', emoji: '🏸' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'explore', label: 'Explore', emoji: '🧭' },
  { id: 'work', label: 'Work', emoji: '💻' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'help', label: 'Help', emoji: '🤝' },
  { id: 'casual', label: 'Chill', emoji: '✨' },
];

const QUICK_FILTERS = [
  { id: 'near', label: '📍 Near me', sort: (a: Request, b: Request) => a.location.distance - b.location.distance },
  { id: 'soon', label: '⚡ Starting soon', sort: (a: Request, b: Request) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime() },
  { id: 'popular', label: '🔥 Popular', sort: (a: Request, b: Request) => b.seatsTaken - a.seatsTaken },
];

const QUICK_CREATE: { emoji: string; title: string; category: Category }[] = [
  { emoji: '☕', title: 'Coffee nearby', category: 'chai' },
  { emoji: '🚶', title: 'Walk', category: 'walk' },
  { emoji: '🍜', title: 'Dinner', category: 'food' },
  { emoji: '🏸', title: 'Badminton', category: 'sports' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, joinRequest, updateCredits, refreshFeed, user } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3 });
    if (cardsRef.current?.children) {
      tl.fromTo(cardsRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' },
        '-=0.1'
      );
    }
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
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar />
      
      {/* Greeting - compact */}



      {/* Trending section */}
      {trending.length > 0 && (
        <div className="px-5 pt-3 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <span>🔥</span> Popular nearby
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
            {trending.map((req, i) => {
              const seatsLeft = req.seatsTotal - req.seatsTaken;
              const fillPercent = Math.round((req.seatsTaken / req.seatsTotal) * 100);
              const tints = [
                'linear-gradient(135deg, rgba(255,120,30,0.18) 0%, rgba(255,70,70,0.12) 100%)',
                'linear-gradient(135deg, rgba(50,130,255,0.18) 0%, rgba(110,70,255,0.12) 100%)',
                'linear-gradient(135deg, rgba(30,190,120,0.18) 0%, rgba(20,160,200,0.12) 100%)',
              ];
              return (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="shrink-0 tap-scale min-w-[180px] max-w-[200px] rounded-2xl overflow-hidden text-left"
                  style={{
                    background: tints[i % tints.length],
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}>
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{getCategoryEmoji(req.category)}</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {req.seatsTaken}/{req.seatsTotal} joined
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-foreground truncate mb-0.5">{req.title}</p>
                    <p className="text-[11px] text-muted-foreground mb-2">📍 {req.location.name}</p>
                    <div className="w-full h-1 rounded-full bg-foreground/5 overflow-hidden">
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
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-5 px-5 scrollbar-hide">
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
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-1 pb-2">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">All plans</h3>
      </div>
      
      <div ref={cardsRef} className="px-5 space-y-2.5">
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
              <span className="text-4xl block mb-3">🌊</span>
              <p className="text-sm font-medium text-foreground mb-1">No plans nearby</p>
              <p className="text-xs text-muted-foreground">Start one in 10 seconds 👇</p>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1">START A PLAN</h3>
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
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Start a plan</h3>
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
