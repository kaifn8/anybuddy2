import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { emoji: '🏠', label: 'Home', path: '/home' },
  { emoji: '🔔', label: 'Alerts', path: '/notifications' },
  { emoji: '✨', label: 'Post', path: '/create', isMain: true },
  { emoji: '💰', label: 'Credits', path: '/credits' },
  { emoji: '👤', label: 'Me', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around py-2.5 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isMain) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-6 tap-scale"
              >
                <div className="bg-foreground rounded-2xl p-3.5 shadow-uber-lg">
                  <span className="text-xl">{item.emoji}</span>
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1.5 px-3 tap-scale transition-all',
                isActive ? 'opacity-100' : 'opacity-50'
              )}
            >
              <div className="relative">
                <span className="text-lg">{item.emoji}</span>
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-semibold',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
