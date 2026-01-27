import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Send, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
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
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }
  
  const handleSend = () => {
    if (!message.trim() || !id) return;
    sendMessage(id, message.trim());
    setMessage('');
  };
  
  const handleLeave = () => {
    if (!id) return;
    leaveRequest(id);
    navigate('/home');
  };
  
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  
  return (
    <div className="mobile-container min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold truncate">{request.title}</h1>
            <p className="text-sm text-muted-foreground">{request.userName}</p>
          </div>
          {isJoined && (
            <button 
              onClick={handleLeave}
              className="text-warning tap-scale p-2"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>
      
      {/* Request Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <CategoryIcon category={request.category} />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <UrgencyBadge urgency={request.urgency} />
              <TrustBadge level={request.userTrust} />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{request.location.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{seatsLeft} left</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{timeLeft}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Participants */}
        {request.participants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2">Participants</p>
            <div className="flex -space-x-2">
              {request.participants.map((p) => (
                <img
                  key={p.id}
                  src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                  alt={p.name}
                  className="w-8 h-8 rounded-full border-2 border-background"
                  title={p.name}
                />
              ))}
              <img
                src={request.userAvatar}
                alt={request.userName}
                className="w-8 h-8 rounded-full border-2 border-background"
                title={`${request.userName} (Host)`}
              />
            </div>
          </div>
        )}
      </div>
      
      {isJoined ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.senderId === 'system'
                      ? 'bg-muted text-muted-foreground text-center w-full text-sm'
                      : msg.senderId === user?.id
                      ? 'gradient-primary text-white rounded-br-sm'
                      : 'bg-card card-shadow rounded-bl-sm'
                  }`}
                >
                  {msg.senderId !== user?.id && msg.senderId !== 'system' && (
                    <p className="text-xs font-medium text-primary mb-1">{msg.senderName}</p>
                  )}
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="p-4 glass-effect border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-full"
              />
              <Button
                size="icon"
                className="gradient-primary rounded-full tap-scale shrink-0"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Join this request to unlock the chat</p>
            <Button
              className="gradient-primary tap-scale"
              onClick={() => navigate(`/join/${request.id}`)}
              disabled={seatsLeft === 0}
            >
              {seatsLeft === 0 ? 'Request is full' : 'Join Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
