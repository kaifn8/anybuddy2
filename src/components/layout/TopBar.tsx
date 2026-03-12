import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <header className="sticky top-0 z-40 lg:pl-64">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between h-[50px] px-5">
        {/* Left */}
        <div className="w-20 flex items-center">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="tap-scale w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors">
              <ArrowLeft className="w-[18px] h-[18px] text-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="relative flex items-center justify-center">
                <span className="w-[5px] h-[5px] rounded-full bg-success" />
                <span className="absolute w-[5px] h-[5px] rounded-full bg-success animate-ping opacity-60" />
              </span>
              <span className="text-[10px] font-semibold text-success tracking-wide">{activeCount} live</span>
            </div>
          )}
        </div>

        {/* Center */}
        {title ? (
          <span className="text-[15px] font-semibold text-foreground tracking-tight">{title}</span>
        ) : (
          <>
            <span className="text-[20px] lg:hidden" style={{ fontFamily: "'Pacifico', cursive" }}>
              any<span className="text-primary">buddy</span>
            </span>
            <span className="hidden lg:block text-sm font-semibold text-foreground">Home</span>
          </>
        )}

        {/* Right */}
        <div className="w-20 flex items-center justify-end gap-1">
          {showSettings ? (
            <button
              onClick={() => navigate('/settings')}
              className="tap-scale w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
            >
              <span className="text-[15px]">⚙️</span>
            </button>
          ) : !hideChat ? (
            <button
              onClick={() => navigate('/chats')}
              className="relative tap-scale w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
            >
              <span className="text-[15px]">💬</span>
              {unreadChats > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center px-[3px]">
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
