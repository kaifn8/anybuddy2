import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';

const navItems = [
  { emoji: '🏠', label: 'Feed', path: '/home' },
  { emoji: '🗺️', label: 'Map', path: '/map' },
  { emoji: '🪄', label: 'Post', path: '/create', isMain: true },
  { emoji: '🔔', label: 'Alerts', path: '/notifications' },
  { emoji: '👤', label: 'Me', path: '/profile' },
];

import React from 'react';

export const BottomNav = React.forwardRef<HTMLElement, object>(function BottomNav(_props, ref) {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const user = useAppStore((s) => s.user);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-2">
        <div 
          className="flex items-center justify-around h-14 px-1 rounded-2xl border border-border/40 dark:border-white/10 bg-white/80 dark:bg-[rgb(18,18,24)]/85"
          style={{ 
            backdropFilter: 'blur(24px) saturate(180%)', 
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
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
  );
});
BottomNav.displayName = 'BottomNav';
