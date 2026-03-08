import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const navigate = useNavigate();
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);

  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        height: 56,
        background: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-full px-4">
        <div className="w-8" />

        {/* Center: Logo */}
        <span className="text-[20px]" style={{ fontFamily: "'Pacifico', cursive" }}>
          any<span className="text-primary">buddy</span>
        </span>

        {/* Right: Chat emoji with badge */}
        <button
          onClick={() => navigate('/chats')}
          className="relative tap-scale text-lg w-8 flex items-center justify-center"
        >
          💬
          {unreadChats > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadChats > 9 ? '9+' : unreadChats}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
