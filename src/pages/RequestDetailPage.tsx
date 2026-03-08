import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Share2 } from 'lucide-react';
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
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const request = requests.find(r => r.id === id);
  const isJoined = joinedRequests.includes(id || '');
  const msgs = chatMessages[id || ''] || [];
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  
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
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      {/* Header */}
      <TopBar showBack title={request.title} />
            </button>
          )}
        </div>
      </header>
      
      {/* Meetup summary card */}
      <div className="px-5 py-3 border-b border-border/15">
        <div className="liquid-glass p-3.5 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getCategoryEmoji(request.category)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <UrgencyBadge urgency={request.urgency} />
                <TrustBadge level={request.userTrust} />
              </div>
              <h2 className="text-sm font-bold mt-1.5">{request.title}</h2>
              <div className="space-y-1 mt-2 text-2xs text-muted-foreground">
                <p>📍 {request.location.name} · {request.location.distance}km</p>
                <p>⏱ Starts in {timeLeft}</p>
                <p>👥 {request.seatsTaken}/{request.seatsTotal} people · {seatsLeft} spots left</p>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border/15">
            <button onClick={() => navigate('/map')} className="flex items-center gap-1 text-2xs text-primary font-semibold tap-scale">
              📍 View on map
            </button>
            <span className="text-[10px] text-muted-foreground/60">🛡️ Public meetup</span>
            {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
              <span className="text-[10px] text-muted-foreground/60">✅ Verified host</span>
            )}
          </div>
        </div>

        {/* Participants list */}
        <button onClick={() => setShowParticipants(!showParticipants)} className="w-full tap-scale">
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-1.5">
              <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                alt={request.userName} className="w-6 h-6 rounded-full border-2 border-background" />
              {request.participants.map((p) => (
                <img key={p.id} src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                  alt={p.name} className="w-6 h-6 rounded-full border-2 border-background" />
              ))}
            </div>
            <span className="text-2xs text-muted-foreground">{request.participants.length + 1} people · tap to see</span>
          </div>
        </button>

        {showParticipants && (
          <div className="mt-2 liquid-glass-subtle p-3 rounded-lg space-y-2">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">Participants</h4>
            <div className="flex items-center gap-2">
              <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                alt={request.userName} className="w-6 h-6 rounded-full" />
              <span className="text-xs font-medium">{request.userName}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Host</span>
            </div>
            {request.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                  alt={p.name} className="w-6 h-6 rounded-full" />
                <span className="text-xs font-medium">{p.name}</span>
                {p.note && <span className="text-[10px] text-muted-foreground">"{p.note}"</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isJoined ? (
        <>
          {/* Chat */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {msgs.map((msg) => (
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

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title}
        text={`${request.title}\n📍 ${request.location.name}\nStarts in ${timeLeft}\nJoin here 👇`} />
    </div>
  );
}
