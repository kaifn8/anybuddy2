import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { AppIcon } from '@/components/icons/AppIcon';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  hideChat?: boolean;
  showSettings?: boolean;
}

export function TopBar({ showBack = false, title, hideChat = false, showSettings = false }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const requests = useAppStore((s) => s.requests);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);
  const notifications = useAppStore((s) => s.notifications);

  const activeCount = requests.filter((r) => r.status === 'active').length;

  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const totalBadge = unreadChats + unreadNotifs;

  const shouldShowBack = showBack || [
    '/credits', '/invite', '/notifications', '/settings', '/circle',
    '/attendance', '/review',
  ].some(p => location.pathname.startsWith(p));

  const glassBtn = {
    background: 'hsla(var(--glass-bg) / 0.5)',
    backdropFilter: 'blur(16px)',
    border: '0.5px solid hsla(var(--glass-border) / 0.4)',
    borderRadius: '50%',
  };

  return (
    <header
      className="sticky top-0 z-40 lg:pl-64"
      style={{
        background: 'hsla(var(--glass-bg) / 0.35)',
        backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
        WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
        borderBottom: '0.5px solid hsla(var(--glass-border) / 0.4)',
      }}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between h-[48px] px-4">
        {/* Left */}
        <div className="w-16 flex items-center">
          {shouldShowBack ? (
            <button onClick={() => navigate(-1)} className="tap-scale w-8 h-8 flex items-center justify-center" style={glassBtn}>
              <span className="text-sm font-medium">←</span>
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
          <span className="text-[16px] font-bold text-foreground tracking-tight">{title}</span>
        ) : (
          <>
            <span className="text-[20px] lg:hidden" style={{ fontFamily: "'Pacifico', cursive" }}>
              any<span className="text-primary">buddy</span>
            </span>
            <span className="hidden lg:block text-[16px] font-bold text-foreground tracking-tight">Home</span>
          </>
        )}

        {/* Right */}
        <div className="w-16 flex items-center justify-end gap-1.5">
          {/* Notification bell */}
          {!showSettings && !hideChat && unreadNotifs > 0 && (
            <button onClick={() => navigate('/notifications')}
              className="relative tap-scale w-8 h-8 flex items-center justify-center" style={glassBtn}>
              <AppIcon name="se:bell" size={18} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-destructive flex items-center justify-center text-[7px] font-bold text-white px-[2px]">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            </button>
          )}
          {showSettings ? (
            <button onClick={() => navigate('/settings')} className="tap-scale w-8 h-8 flex items-center justify-center" style={glassBtn}>
              <AppIcon name="fc:settings" size={18} />
            </button>
          ) : !hideChat ? (
            <button onClick={() => navigate('/chats')} className="relative tap-scale w-8 h-8 flex items-center justify-center" style={glassBtn}>
              <AppIcon name="fc:comments" size={18} />
              {totalBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-white text-[7px] font-bold flex items-center justify-center px-[2px]">
                  {totalBadge > 9 ? '9+' : totalBadge}
                </span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
