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
    <header className="sticky top-0 z-40 px-4 pt-2.5 pb-1 lg:pl-64">
      <div
        className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between h-[46px] px-4"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: '14px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        {/* Left */}
        <div className="w-20 flex items-center">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="tap-scale p-1.5 -ml-1.5 rounded-xl hover:bg-foreground/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="relative flex items-center justify-center">
                <span className="w-[6px] h-[6px] rounded-full bg-success" />
                <span className="absolute w-[6px] h-[6px] rounded-full bg-success animate-ping opacity-60" />
              </span>
              <span className="text-[11px] font-semibold text-success">{activeCount} live</span>
            </div>
          )}
        </div>

        {/* Center: Logo or page title */}
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

        {/* Right: Chat or Settings */}
        <div className="w-20 flex items-center justify-end">
          {showSettings ? (
            <button
              onClick={() => navigate('/settings')}
              className="tap-scale p-1.5 rounded-xl hover:bg-foreground/5 transition-colors"
            >
              <span className="text-lg">⚙️</span>
            </button>
          ) : !hideChat ? (
            <button
              onClick={() => navigate('/chats')}
              className="relative tap-scale p-1.5 rounded-xl hover:bg-foreground/5 transition-colors"
            >
              <span className="text-lg">💬</span>
              {unreadChats > 0 && (
                <span className="absolute top-0.5 right-0 min-w-[16px] h-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-[3px]">
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
