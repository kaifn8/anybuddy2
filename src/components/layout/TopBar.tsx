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
    <header
      className="sticky top-0 z-40 h-14"
      style={{
        background: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between h-full px-4 lg:pl-64">
        {/* Left */}
        <div className="w-20 flex items-center">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="tap-scale p-1">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
              <span className="text-[11px] font-semibold text-success">{activeCount} active</span>
            </div>
          )}
        </div>

        {/* Center: Logo or page title */}
        {title ? (
          <span className="text-sm font-semibold text-foreground">{title}</span>
        ) : (
          <>
            <span className="text-[20px] lg:hidden" style={{ fontFamily: "'Pacifico', cursive" }}>
              any<span className="text-primary">buddy</span>
            </span>
            <span className="hidden lg:block text-sm font-semibold text-foreground">Home</span>
          </>
        )}

        {/* Right: Chat or Settings */}
        <div className="w-20 flex items-center justify-end">
          {showSettings ? (
            <button
              onClick={() => navigate('/settings')}
              className="tap-scale text-lg"
            >
              ⚙️
            </button>
          ) : !hideChat ? (
            <button
              onClick={() => navigate('/chats')}
              className="relative tap-scale text-lg"
            >
              💬
              {unreadChats > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
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
