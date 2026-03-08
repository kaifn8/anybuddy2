import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { formatDistanceToNow } from 'date-fns';

export default function JoinRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, joinRequest, updateCredits, user } = useAppStore();
  
  const [note, setNote] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const request = requests.find(r => r.id === id);
  
  useEffect(() => {
    if (containerRef.current?.children) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
    }
  }, []);
  
  useEffect(() => {
    if (isJoined && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [isJoined]);
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">🤷</span>
          <p className="text-sm text-muted-foreground mb-4">Request not found</p>
          <button onClick={() => navigate('/home')} className="tahoe-btn-primary h-10 px-6 tap-scale">Go Home</button>
        </div>
      </div>
    );
  }
  
  const handleJoin = () => {
    if (!user) return;
    setIsJoining(true);
    setTimeout(() => {
      joinRequest(request.id, note.trim() || undefined);
      updateCredits(0.5, 'Joined a request');
      setIsJoined(true);
      setTimeout(() => navigate(`/request/${request.id}`), 1500);
    }, 500);
  };
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <TopBar showBack title="Join Request" />
      
      {isJoined ? (
        <div ref={successRef} className="flex flex-col items-center justify-center min-h-[70vh] px-8">
          <span className="text-6xl mb-4">🎉</span>
          <h2 className="text-title font-bold mb-1">You're in!</h2>
          <p className="text-sm text-muted-foreground">Opening chat with {request.userName}...</p>
        </div>
      ) : (
        <div ref={containerRef} className="px-5 pt-3 space-y-4">
          {/* Request info */}
          <div className="liquid-glass-heavy p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getCategoryEmoji(request.category)}</span>
              <div className="flex-1">
                <UrgencyBadge urgency={request.urgency} />
                <h2 className="text-body font-bold mt-1.5 mb-2.5">{request.title}</h2>
                <div className="flex items-center gap-2.5">
                  <img src={request.userAvatar} alt={request.userName} className="w-7 h-7 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold">{request.userName}</p>
                    <TrustBadge level={request.userTrust} size="sm" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/20">
              {[
                { emoji: '👥', value: `${seatsLeft}/${request.seatsTotal}`, label: 'spots' },
                { emoji: '📍', value: `${request.location.distance}km`, label: 'away' },
                { emoji: '⏰', value: timeLeft.replace('in ', ''), label: 'expires' },
              ].map((s, i) => (
                <div key={i} className="text-center py-1">
                  <span className="text-sm">{s.emoji}</span>
                  <p className="text-xs font-bold mt-0.5">{s.value}</p>
                  <p className="text-2xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Note */}
          <div className="liquid-glass p-3.5" style={{ borderRadius: '1rem' }}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quick note (optional)</label>
            <input placeholder="e.g., On my way! ETA 10 mins" value={note} onChange={(e) => setNote(e.target.value.slice(0, 50))}
              className="w-full h-10 px-3 rounded-lg liquid-glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-2xs text-muted-foreground mt-1 text-right">{note.length}/50</p>
          </div>
          
          {/* What happens next */}
          <div className="liquid-glass p-3.5" style={{ borderRadius: '1rem' }}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">WHAT HAPPENS NEXT</h3>
            <ul className="space-y-2">
              {[
                { emoji: '🔒', text: 'Your spot is locked' },
                { emoji: '💬', text: 'Group chat opens' },
                { emoji: '📍', text: "You'll see the meetup spot" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.emoji}</span><span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Join CTA */}
          <button className="w-full h-12 tahoe-btn-primary tap-scale"
            onClick={handleJoin} disabled={isJoining || seatsLeft === 0}>
            {isJoining ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining...
              </span>
            ) : `Join ${request.userName}`}
          </button>
          {seatsLeft <= 2 && seatsLeft > 0 && (
            <p className="text-center text-warning text-2xs font-semibold">Only {seatsLeft} spot{seatsLeft > 1 ? 's' : ''} left</p>
          )}
        </div>
      )}
    </div>
  );
}
