import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
    }
  }, []);
  
  useEffect(() => {
    if (isJoined && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
    }
  }, [isJoined]);
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🤷</span>
          <p className="text-muted-foreground mb-4 font-medium">Request not found</p>
          <Button onClick={() => navigate('/home')} className="glass-button-primary rounded-2xl px-6 py-3">Go Home</Button>
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
      setTimeout(() => navigate(`/request/${request.id}`), 1800);
    }, 600);
  };
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center gap-3 p-4 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="glass-button p-2 rounded-xl tap-scale text-sm">←</button>
          <h1 className="text-[17px] font-semibold">Join Request</h1>
        </div>
      </header>
      
      {isJoined ? (
        <div ref={successRef} className="flex-1 flex flex-col items-center justify-center p-8 min-h-[70vh]">
          <span className="text-7xl mb-6">🎉</span>
          <h2 className="text-2xl font-bold mb-2">You're in!</h2>
          <p className="text-muted-foreground text-center">Opening chat with {request.userName}... 💬</p>
        </div>
      ) : (
        <div ref={containerRef} className="p-5 space-y-4">
          <div className="liquid-glass-heavy p-5 specular-highlight" style={{ borderRadius: '1.5rem' }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{getCategoryEmoji(request.category)}</span>
              <div className="flex-1">
                <UrgencyBadge urgency={request.urgency} />
                <h2 className="text-lg font-bold mt-2 mb-3">{request.title}</h2>
                <div className="flex items-center gap-3">
                  <img src={request.userAvatar} alt={request.userName} className="w-9 h-9 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{request.userName}</p>
                    <TrustBadge level={request.userTrust} size="sm" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/30">
              {[
                { emoji: '👥', value: `${seatsLeft}/${request.seatsTotal}`, label: 'spots' },
                { emoji: '📍', value: `${request.location.distance}km`, label: 'away' },
                { emoji: '⏰', value: timeLeft.replace('in ', ''), label: 'expires' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <span className="text-lg">{s.emoji}</span>
                  <p className="text-sm font-bold">{s.value}</p>
                  <p className="text-2xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="liquid-glass p-4" style={{ borderRadius: '1.25rem' }}>
            <label className="flex items-center gap-2 text-sm font-semibold mb-3">💬 Quick note (optional)</label>
            <Input placeholder="e.g., On my way! ETA 10 mins 🏃" value={note} onChange={(e) => setNote(e.target.value.slice(0, 50))}
              className="rounded-xl liquid-glass border-0" />
            <p className="text-2xs text-muted-foreground mt-2 text-right">{note.length}/50</p>
          </div>
          
          <div className="liquid-glass p-4" style={{ borderRadius: '1.25rem' }}>
            <h3 className="font-semibold text-sm mb-3">What happens next 🎯</h3>
            <ul className="space-y-2.5">
              {[
                { emoji: '🔒', text: 'Your spot is locked immediately' },
                { emoji: '💬', text: 'Group chat opens with everyone' },
                { emoji: '📍', text: "You'll see the exact meetup spot" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span>{item.emoji}</span>{item.text}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-2">
            <Button className="w-full h-13 rounded-2xl text-base font-semibold tap-scale glass-button-primary"
              onClick={handleJoin} disabled={isJoining || seatsLeft === 0}>
              {isJoining ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining...
                </span>
              ) : `Join ${request.userName} 🤝`}
            </Button>
            {seatsLeft <= 2 && seatsLeft > 0 && (
              <p className="text-center text-warning text-xs mt-3 font-semibold">⚡ Only {seatsLeft} spot{seatsLeft > 1 ? 's' : ''} left!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
