import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
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

const SUGGESTIONS: { emoji: string; title: string; category: Category }[] = [
  { emoji: '☕', title: 'Coffee nearby', category: 'chai' },
  { emoji: '🚶', title: 'Evening walk', category: 'walk' },
  { emoji: '🏸', title: 'Badminton match', category: 'sports' },
  { emoji: '🍜', title: 'Street food crawl', category: 'food' },
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

  // Apply quick filter sorting
  if (quickFilter) {
    const qf = QUICK_FILTERS.find(f => f.id === quickFilter);
    if (qf) filtered = [...filtered].sort(qf.sort);
  }

  const activeCount = requests.filter(r => r.status === 'active').length;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar />
      
      <div className="px-5 pt-5 pb-1">
        <div ref={headerRef} className="mb-5">
          <h2 className="text-heading font-bold text-foreground">
            {user ? `Hey ${user.firstName} 👋` : 'Hey there 👋'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
              <span className="text-success font-semibold">{activeCount} live plans nearby</span>
            </span>
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {FILTERS.map((cat) => (
            <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
              className={cn('shrink-0 glass-pill tap-scale',
                activeFilter === cat.id ? 'glass-pill-active' : 'glass-pill-inactive'
              )}>
              <span className="text-xs">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide mt-2">
          {QUICK_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
              className={cn('shrink-0 px-3 py-1.5 rounded-lg text-2xs font-semibold tap-scale transition-all',
                quickFilter === f.id ? 'tahoe-btn-primary' : 'liquid-glass text-muted-foreground'
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <div ref={cardsRef} className="px-5 space-y-3">
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
                {SUGGESTIONS.map((s, i) => (
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
