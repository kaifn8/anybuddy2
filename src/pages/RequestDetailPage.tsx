import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, joinedRequests, chatMessages, sendMessage, leaveRequest, user } = useAppStore();
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const request = requests.find(r => r.id === id);
  const isJoined = joinedRequests.includes(id || '');
  const messages = chatMessages[id || ''] || [];
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }
  
  const handleSend = () => { if (!message.trim() || !id) return; sendMessage(id, message.trim()); setMessage(''); };
  const handleLeave = () => { if (!id) return; leaveRequest(id); navigate('/home'); };
  
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center gap-3 p-4 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="glass-button p-2 rounded-xl tap-scale text-sm">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate text-[15px]">{request.title}</h1>
            <p className="text-xs text-muted-foreground">{request.userName}</p>
          </div>
          {isJoined && (
            <button onClick={handleLeave} className="glass-button px-3 py-1.5 rounded-xl tap-scale text-xs text-warning font-medium">
              Leave
            </button>
          )}
        </div>
      </header>
      
      {/* Info */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{getCategoryEmoji(request.category)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <UrgencyBadge urgency={request.urgency} />
              <TrustBadge level={request.userTrust} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>📍 {request.location.name}</span>
              <span>👥 {seatsLeft} left</span>
              <span>⏱ {timeLeft}</span>
            </div>
          </div>
        </div>
        
        {request.participants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-sm font-medium mb-2">Participants</p>
            <div className="flex -space-x-2">
              {request.participants.map((p) => (
                <img key={p.id} src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                  alt={p.name} className="w-8 h-8 rounded-full border-2 border-background" title={p.name} />
              ))}
              <img src={request.userAvatar} alt={request.userName}
                className="w-8 h-8 rounded-full border-2 border-background" title={`${request.userName} (Host)`} />
            </div>
          </div>
        )}
      </div>
      
      {isJoined ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.senderId === 'system'
                    ? 'liquid-glass-subtle text-muted-foreground text-center w-full text-sm'
                    : msg.senderId === user?.id
                    ? 'glass-button-primary rounded-br-lg'
                    : 'liquid-glass rounded-bl-lg'
                }`}>
                  {msg.senderId !== user?.id && msg.senderId !== 'system' && (
                    <p className="text-xs font-semibold text-primary mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-[15px]">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 liquid-glass-nav">
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-full liquid-glass border-0 h-11"
              />
              <Button size="icon" className="glass-button-primary rounded-full tap-scale shrink-0 h-11 w-11"
                onClick={handleSend} disabled={!message.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <span className="text-4xl block mb-4">🔒</span>
            <p className="text-muted-foreground mb-4 font-medium">Join to unlock the chat</p>
            <Button className="glass-button-primary rounded-2xl px-8 py-3 tap-scale"
              onClick={() => navigate(`/join/${request.id}`)} disabled={seatsLeft === 0}>
              {seatsLeft === 0 ? 'Request is full' : 'Join Now 🤝'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
