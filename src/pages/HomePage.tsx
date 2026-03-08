import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/anybuddy';

const FILTERS: { id: Category | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'chai', label: 'Chai', emoji: '☕' },
  { id: 'explore', label: 'Explore', emoji: '🧭' },
  { id: 'work', label: 'Work', emoji: '💻' },
  { id: 'help', label: 'Help', emoji: '🤝' },
  { id: 'casual', label: 'Chill', emoji: '✨' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, refreshFeed, user } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  
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
  
  const handleJoin = (requestId: string) => {
    if (!user) { navigate('/signup'); return; }
    navigate(joinedRequests.includes(requestId) ? `/request/${requestId}` : `/join/${requestId}`);
  };
  
  const filtered = [...requests]
    .filter(r => activeFilter === 'all' || r.category === activeFilter)
    .sort((a, b) => {
      const order = { now: 0, today: 1, week: 2 };
      return order[a.urgency] !== order[b.urgency]
        ? order[a.urgency] - order[b.urgency]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar />
      
      <div className="px-5 pt-5 pb-1">
        <div ref={headerRef} className="mb-5">
          <h2 className="text-heading font-bold text-foreground">
            {user ? `Hey ${user.firstName} 👋` : 'Hey there 👋'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} people nearby need a buddy
          </p>
        </div>
        
        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
          {FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn('shrink-0 glass-pill tap-scale',
                activeFilter === cat.id ? 'glass-pill-active' : 'glass-pill-inactive'
              )}
            >
              <span className="text-xs">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Feed */}
      <div ref={cardsRef} className="px-5 space-y-3">
        {filtered.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isJoined={joinedRequests.includes(request.id)}
            onJoin={() => handleJoin(request.id)}
            onView={() => navigate(`/request/${request.id}`)}
          />
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              No requests {activeFilter !== 'all' ? `for ${activeFilter}` : 'nearby'}
            </p>
            <button onClick={() => navigate('/create')} className="text-primary font-semibold text-sm tap-scale">
              Be the first to post
            </button>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
