import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Plus, Bell, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import React from 'react';

const navItems = [
  { icon: Home, label: 'Feed', path: '/home' },
  { icon: Map, label: 'Map', path: '/map' },
  { icon: Plus, label: 'Post', path: '/create', isMain: true },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
  { icon: User, label: 'Me', path: '/profile' },
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
      <nav ref={ref} className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col liquid-glass-nav" style={{ borderRight: '0.5px solid hsla(var(--glass-border))', borderBottom: 'none' }}>
        <div className="px-5 h-14 flex items-center">
          <span className="text-[20px]" style={{ fontFamily: "'Pacifico', cursive" }}>
            any<span className="text-primary">buddy</span>
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-3 pt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold tap-scale mt-2 mb-1"
                >
                  <Icon size={18} />
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
                    <Icon size={20} />
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
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav — below lg */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-md mx-auto px-3 pb-2">
          <div
            className="flex items-center justify-around h-[60px] rounded-[20px]"
            style={{
              background: 'hsla(var(--glass-bg-heavy))',
              backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(200%)',
              WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(200%)',
              border: '0.5px solid hsla(var(--glass-border))',
              boxShadow: '0 -2px 24px hsla(var(--glass-shadow)), inset 0 1px 0 hsla(var(--glass-highlight))',
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              // Central "Post" button — floating pill
              if (item.isMain) {
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="relative -mt-6 tap-scale group"
                  >
                    <div
                      className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                        boxShadow: '0 4px 16px hsl(var(--primary) / 0.35), inset 0 1px 0 hsla(var(--glass-highlight))',
                      }}
                    >
                      <Plus size={22} strokeWidth={2.5} />
                    </div>
                    <span className="block text-center text-[9px] font-semibold text-primary mt-0.5">Post</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center gap-[2px] min-w-[48px] py-1 tap-scale relative"
                >
                  <div className="relative">
                    {item.path === '/profile' ? (
                      <div className="relative">
                        <img
                          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'guest'}`}
                          alt="Profile"
                          className={cn(
                            'w-[22px] h-[22px] rounded-full transition-all',
                            isActive
                              ? 'ring-[2px] ring-primary ring-offset-1 ring-offset-background'
                              : 'opacity-50 grayscale-[30%]'
                          )}
                        />
                        {user && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-success border-[1.5px] border-card" />
                        )}
                      </div>
                    ) : (
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={cn(
                          'transition-all',
                          isActive ? 'text-primary scale-110' : 'text-muted-foreground/50'
                        )}
                      />
                    )}
                    {item.path === '/notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[8px] rounded-full min-w-[15px] h-[15px] flex items-center justify-center font-bold px-[3px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium leading-none transition-colors',
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground/60'
                  )}>
                    {item.label}
                  </span>
                  {/* Active dot indicator */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                  )}
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
