import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ShareSheet } from '@/components/ShareSheet';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, joinedRequests, chatMessages, sendMessage, leaveRequest, user } = useAppStore();
  
  const [message, setMessage] = useState('');
  const [showShare, setShowShare] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const request = requests.find(r => r.id === id);
  const isJoined = joinedRequests.includes(id || '');
  const messages = chatMessages[id || ''] || [];
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Request not found</p>
      </div>
    );
  }
  
  const handleSend = () => { if (!message.trim() || !id) return; sendMessage(id, message.trim()); setMessage(''); };
  const handleLeave = () => { if (!id) return; leaveRequest(id); navigate('/home'); };
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center gap-2.5 h-12 px-5 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="tahoe-btn-ghost w-8 h-8 rounded-lg tap-scale text-sm">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">{request.title}</h1>
            <button onClick={() => navigate(`/host/${request.userId}`)} className="text-2xs text-muted-foreground underline decoration-dotted tap-scale">
              {request.userName}
            </button>
          </div>
          <button onClick={() => setShowShare(true)} className="tahoe-btn-ghost w-8 h-8 rounded-lg tap-scale text-sm">📤</button>
          {isJoined && (
            <button onClick={handleLeave} className="tahoe-btn-ghost text-2xs text-warning font-semibold px-2 py-1 rounded-lg tap-scale">
              Leave
            </button>
          )}
        </div>
      </header>
      
      {/* Info bar */}
      <div className="px-5 py-3 border-b border-border/15">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{getCategoryEmoji(request.category)}</span>
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <UrgencyBadge urgency={request.urgency} />
            <TrustBadge level={request.userTrust} />
          </div>
          <div className="text-2xs text-muted-foreground">
            📍 {request.location.name} · 👥 {seatsLeft} left
          </div>
        </div>

        {/* Action row: map shortcut + safety */}
        <div className="flex items-center gap-3 mt-2.5">
          <button onClick={() => navigate('/map')} className="flex items-center gap-1 text-2xs text-primary font-semibold tap-scale">
            📍 View on map
          </button>
          <span className="text-2xs text-muted-foreground/70">🛡️ Public meetup</span>
          {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
            <span className="text-2xs text-muted-foreground/70">✅ Verified host</span>
          )}
        </div>
        
        {request.participants.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-border/15">
            <div className="flex -space-x-1.5">
              {request.participants.map((p) => (
                <img key={p.id} src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                  alt={p.name} className="w-6 h-6 rounded-full border-2 border-background" />
              ))}
              <img src={request.userAvatar} alt={request.userName}
                className="w-6 h-6 rounded-full border-2 border-background" />
            </div>
            <span className="text-2xs text-muted-foreground">{request.participants.length + 1} people</span>
          </div>
        )}
      </div>
      
      {isJoined ? (
        <>
          {/* Chat */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  msg.senderId === 'system'
                    ? 'liquid-glass-subtle text-muted-foreground text-center w-full text-xs'
                    : msg.senderId === user?.id
                    ? 'tahoe-btn-primary rounded-br-md'
                    : 'liquid-glass rounded-bl-md'
                }`}>
                  {msg.senderId !== user?.id && msg.senderId !== 'system' && (
                    <p className="text-2xs font-semibold text-primary mb-0.5">{msg.senderName}</p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-3 liquid-glass-nav">
            <div className="flex gap-2 max-w-md mx-auto">
              <input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-full liquid-glass h-10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="tahoe-btn-primary rounded-full w-10 h-10 flex items-center justify-center tap-scale shrink-0"
                onClick={handleSend} disabled={!message.trim()}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <span className="text-3xl block mb-3">🔒</span>
            <p className="text-sm text-muted-foreground mb-4">Join to unlock the chat</p>
            <button className="tahoe-btn-primary h-10 px-6 tap-scale"
              onClick={() => navigate(`/join/${request.id}`)} disabled={seatsLeft === 0}>
              {seatsLeft === 0 ? 'Request is full' : 'Join Now'}
            </button>
          </div>
        </div>
      )}

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title} />
    </div>
  );
}
