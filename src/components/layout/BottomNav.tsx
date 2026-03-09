import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import React from 'react';

const navItems = [
  { emoji: '🏠', label: 'Feed', path: '/home' },
  { emoji: '🗺️', label: 'Map', path: '/map' },
  { emoji: '🪄', label: 'Post', path: '/create', isMain: true },
  { emoji: '🔔', label: 'Alerts', path: '/notifications' },
  { emoji: '👤', label: 'Me', path: '/profile' },
];

export const BottomNav = React.forwardRef<HTMLElement, object>(function BottomNav(_props, ref) {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const user = useAppStore((s) => s.user);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Desktop sidebar — lg and up */}
      <nav ref={ref} className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col border-r border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="px-5 h-14 flex items-center">
          <span className="text-[20px]" style={{ fontFamily: "'Pacifico', cursive" }}>
            any<span className="text-primary">buddy</span>
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-3 pt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold tap-scale mt-2 mb-1"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale transition-colors text-left',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                <div className="relative">
                  {item.path === '/profile' ? (
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'guest'}`}
                      alt="Profile"
                      className={cn('w-6 h-6 rounded-full border-2', isActive ? 'border-primary' : 'border-transparent')}
                    />
                  ) : (
                    <span className="text-lg">{item.emoji}</span>
                  )}
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-destructive text-destructive-foreground text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-4">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale text-muted-foreground hover:bg-muted/50 w-full text-left"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav — below lg */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div
            className="flex items-center justify-around h-14 px-1 rounded-2xl border border-border/40 dark:border-white/10 bg-white/80 dark:bg-[rgb(18,18,24)]/85"
            style={{
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              if (item.isMain) {
                return (
                  <button key={item.path} onClick={() => navigate(item.path)} className="relative -mt-5 tap-scale">
                    <Button className="rounded-2xl w-12 h-12 p-0">
                      <span className="text-lg">{item.emoji}</span>
                    </Button>
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
                    {item.path === '/profile' ? (
                      <div className="relative">
                        <img
                          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'guest'}`}
                          alt="Profile"
                          className={cn(
                            'w-6 h-6 rounded-full border-2 transition-opacity',
                            isActive ? 'border-primary' : 'border-transparent opacity-40'
                          )}
                        />
                        {user && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border border-background" />}
                      </div>
                    ) : (
                      <span className={cn('text-base', isActive ? '' : 'opacity-40')}>{item.emoji}</span>
                    )}
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
    </>
  );
});
BottomNav.displayName = 'BottomNav';
