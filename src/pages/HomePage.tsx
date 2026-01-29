import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Filter, MapPin } from 'lucide-react';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Category, Urgency } from '@/types/anybuddy';

const FILTER_CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chai', label: 'Chai' },
  { id: 'explore', label: 'Explore' },
  { id: 'work', label: 'Work' },
  { id: 'help', label: 'Help' },
  { id: 'casual', label: 'Casual' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, refreshFeed, user } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const refreshBtnRef = useRef<HTMLButtonElement>(null);
  
  // Initial animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
    
    if (cardsContainerRef.current?.children) {
      tl.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.06, 
          ease: 'power2.out' 
        },
        '-=0.1'
      );
    }
  }, []);
  
  // Auto-refresh feed every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeed();
    }, 20000);
    
    return () => clearInterval(interval);
  }, [refreshFeed]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    gsap.to(refreshBtnRef.current, {
      rotation: 360,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(refreshBtnRef.current, { rotation: 0 });
      },
    });
    
    if (cardsContainerRef.current?.children) {
      gsap.to(cardsContainerRef.current.children, {
        opacity: 0.5,
        y: -5,
        duration: 0.15,
        stagger: 0.02,
        onComplete: () => {
          refreshFeed();
          gsap.to(cardsContainerRef.current?.children || [], {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power2.out',
          });
          setIsRefreshing(false);
        },
      });
    } else {
      refreshFeed();
      setIsRefreshing(false);
    }
  };
  
  const handleJoin = (requestId: string) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    
    if (joinedRequests.includes(requestId)) {
      navigate(`/request/${requestId}`);
    } else {
      navigate(`/join/${requestId}`);
    }
  };
  
  // Filter and sort requests
  const filteredRequests = [...requests]
    .filter(r => activeFilter === 'all' || r.category === activeFilter)
    .sort((a, b) => {
      const urgencyOrder = { now: 0, today: 1, week: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <TopBar />
      
      <div className="px-5 pt-4 pb-2">
        {/* Header */}
        <div 
          ref={headerRef}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Nearby
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredRequests.length} active requests
            </p>
          </div>
          <button 
            ref={refreshBtnRef}
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors tap-scale"
            disabled={isRefreshing}
          >
            <RefreshCw 
              size={16} 
              className="text-muted-foreground"
              strokeWidth={2}
            />
          </button>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-5 px-5">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all tap-scale',
                activeFilter === cat.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Request Cards */}
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
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin size={20} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              No requests {activeFilter !== 'all' ? `for ${activeFilter}` : 'nearby'}
            </p>
            <button 
              onClick={() => navigate('/create')}
              className="text-primary font-medium text-sm hover:underline"
            >
              Create one →
            </button>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
