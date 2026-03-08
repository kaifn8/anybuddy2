import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { emoji: '🏠', label: 'Feed', path: '/home' },
  { emoji: '🗺️', label: 'Map', path: '/map' },
  { emoji: '✨', label: 'Post', path: '/create', isMain: true },
  { emoji: '🔔', label: 'Alerts', path: '/notifications' },
  { emoji: '👤', label: 'Me', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-2">
        <div className="liquid-glass-heavy flex items-center justify-around h-14 px-1" style={{ borderRadius: '1rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.isMain) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)} className="relative -mt-5 tap-scale">
                  <div className="tahoe-btn-primary rounded-2xl w-12 h-12 flex items-center justify-center">
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                </button>
              );
            }
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 tap-scale"
              >
                <div className="relative">
                  <span className={cn('text-base', isActive ? '' : 'opacity-40')}>{item.emoji}</span>
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-destructive text-destructive-foreground text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
