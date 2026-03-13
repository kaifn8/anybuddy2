import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  hideChat?: boolean;
  showSettings?: boolean;
}

export function TopBar({ showBack = false, title, hideChat = false, showSettings = false }: TopBarProps) {
  const navigate = useNavigate();
  const requests = useAppStore((s) => s.requests);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);

  const activeCount = requests.filter((r) => r.status === 'active').length;

  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  return (
    <header className="sticky top-0 z-40 lg:pl-64 liquid-glass-nav">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between h-[48px] px-5">
        {/* Left */}
        <div className="w-20 flex items-center">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="tap-scale w-8 h-8 rounded-full liquid-glass flex items-center justify-center" style={{ borderRadius: '50%' }}>
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="relative flex items-center justify-center">
                <span className="w-[4px] h-[4px] rounded-full bg-success" />
                <span className="absolute w-[4px] h-[4px] rounded-full bg-success animate-ping opacity-50" />
              </span>
              <span className="text-[10px] font-bold text-success tracking-wide">{activeCount} live</span>
            </div>
          )}
        </div>

        {/* Center */}
        {title ? (
          <span className="text-[15px] font-bold text-foreground tracking-tight">{title}</span>
        ) : (
          <>
            <span className="text-[20px] lg:hidden" style={{ fontFamily: "'Pacifico', cursive" }}>
              any<span className="text-primary">buddy</span>
            </span>
            <span className="hidden lg:block text-sm font-semibold text-foreground">Home</span>
          </>
        )}

        {/* Right */}
        <div className="w-20 flex items-center justify-end gap-1.5">
          {showSettings ? (
            <button
              onClick={() => navigate('/settings')}
              className="tap-scale w-8 h-8 rounded-full liquid-glass flex items-center justify-center" style={{ borderRadius: '50%' }}
            >
              <Settings size={15} strokeWidth={1.6} className="text-muted-foreground" />
            </button>
          ) : !hideChat ? (
            <button
              onClick={() => navigate('/chats')}
              className="relative tap-scale w-8 h-8 rounded-full liquid-glass flex items-center justify-center" style={{ borderRadius: '50%' }}
            >
              <MessageSquare size={15} strokeWidth={1.6} className="text-muted-foreground" />
              {unreadChats > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[7px] font-bold flex items-center justify-center px-[2px]">
                  {unreadChats > 9 ? '9+' : unreadChats}
                </span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
