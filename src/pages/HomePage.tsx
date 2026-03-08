import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/anybuddy';

const FILTER_CATEGORIES: { id: Category | 'all'; label: string; emoji: string }[] = [
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.35 });
    if (cardsContainerRef.current?.children) {
      tl.fromTo(cardsContainerRef.current.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' },
        '-=0.15'
      );
    }
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => refreshFeed(), 20000);
    return () => clearInterval(interval);
  }, [refreshFeed]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (cardsContainerRef.current?.children) {
      gsap.to(cardsContainerRef.current.children, {
        opacity: 0.4, y: -5, duration: 0.15, stagger: 0.02,
        onComplete: () => {
          refreshFeed();
          gsap.to(cardsContainerRef.current?.children || [], { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
          setIsRefreshing(false);
        },
      });
    } else { refreshFeed(); setIsRefreshing(false); }
  };
  
  const handleJoin = (requestId: string) => {
    if (!user) { navigate('/signup'); return; }
    navigate(joinedRequests.includes(requestId) ? `/request/${requestId}` : `/join/${requestId}`);
  };
  
  const filteredRequests = [...requests]
    .filter(r => activeFilter === 'all' || r.category === activeFilter)
    .sort((a, b) => {
      const urgencyOrder = { now: 0, today: 1, week: 2 };
      return urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]
        ? urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-28">
      <TopBar />
      
      <div className="px-5 pt-4 pb-2">
        <div ref={headerRef} className="mb-5">
          <h2 className="text-hero font-bold text-foreground">
            {user ? `Hey ${user.firstName} 👋` : 'Hey there 👋'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredRequests.length} people nearby need a buddy
          </p>
        </div>
        
        {/* Glass filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn('shrink-0 glass-pill tap-scale',
                activeFilter === cat.id ? 'glass-pill-active' : 'glass-pill-inactive'
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div ref={cardsContainerRef} className="px-5 space-y-3">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isJoined={joinedRequests.includes(request.id)}
            onJoin={() => handleJoin(request.id)}
            onView={() => navigate(`/request/${request.id}`)}
          />
        ))}
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-muted-foreground text-sm mb-3 font-medium">
              No requests {activeFilter !== 'all' ? `for ${activeFilter}` : 'nearby'}
            </p>
            <button onClick={() => navigate('/create')} className="text-primary font-semibold text-sm">
              Be the first to post ✨
            </button>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
