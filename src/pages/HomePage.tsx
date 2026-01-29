import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, joinRequest, refreshFeed, user } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const refreshBtnRef = useRef<HTMLButtonElement>(null);
  
  // Initial animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
    
    if (cardsContainerRef.current?.children) {
      tl.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: 40, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power3.out' 
        },
        '-=0.2'
      );
    }
  }, []);
  
  // Animate new cards when requests change
  useEffect(() => {
    if (cardsContainerRef.current?.children && !isRefreshing) {
      gsap.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [requests.length]);
  
  // Auto-refresh feed every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeed();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [refreshFeed]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Spin animation for refresh button
    gsap.to(refreshBtnRef.current, {
      rotation: 360,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(refreshBtnRef.current, { rotation: 0 });
      },
    });
    
    // Fade out cards
    if (cardsContainerRef.current?.children) {
      gsap.to(cardsContainerRef.current.children, {
        opacity: 0.3,
        y: -10,
        duration: 0.2,
        stagger: 0.02,
        onComplete: () => {
          refreshFeed();
          // Fade in new cards
          gsap.to(cardsContainerRef.current?.children || [], {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
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
  
  // Sort requests: now > today > week, and by creation date
  const sortedRequests = [...requests].sort((a, b) => {
    const urgencyOrder = { now: 0, today: 1, week: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <TopBar />
      
      <div className="px-4 py-4">
        <div 
          ref={headerRef}
          className="flex items-center justify-between mb-5"
        >
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Nearby Requests
          </h2>
          <button 
            ref={refreshBtnRef}
            onClick={handleRefresh}
            className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw 
              size={18} 
              className="text-muted-foreground"
              strokeWidth={2}
            />
          </button>
        </div>
        
        <div ref={cardsContainerRef} className="space-y-3">
          {sortedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isJoined={joinedRequests.includes(request.id)}
              onJoin={() => handleJoin(request.id)}
              onView={() => navigate(`/request/${request.id}`)}
            />
          ))}
          
          {sortedRequests.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4 text-sm">No requests nearby right now</p>
              <button 
                onClick={() => navigate('/create')}
                className="text-primary font-medium text-sm"
              >
                Be the first to post!
              </button>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
