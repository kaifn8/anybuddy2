import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { RequestCard } from '@/components/cards/RequestCard';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, joinRequest, refreshFeed, user } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Auto-refresh feed every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeed();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [refreshFeed]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshFeed();
    setTimeout(() => setIsRefreshing(false), 500);
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-foreground">
            Nearby Requests
          </h2>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-muted transition-colors tap-scale"
          >
            <RefreshCw 
              size={20} 
              className={cn(
                'text-muted-foreground transition-transform',
                isRefreshing && 'animate-spin'
              )} 
            />
          </button>
        </div>
        
        <div className="space-y-3">
          {sortedRequests.map((request, index) => (
            <div key={request.id} style={{ animationDelay: `${index * 50}ms` }}>
              <RequestCard
                request={request}
                isJoined={joinedRequests.includes(request.id)}
                onJoin={() => handleJoin(request.id)}
                onView={() => navigate(`/request/${request.id}`)}
              />
            </div>
          ))}
          
          {sortedRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No requests nearby right now</p>
              <button 
                onClick={() => navigate('/create')}
                className="text-primary font-semibold"
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
