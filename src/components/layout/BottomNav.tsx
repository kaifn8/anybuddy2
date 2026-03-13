import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import React from 'react';

const navItems = [
  { emoji: '🏠', label: 'Home', path: '/home' },
  { emoji: '🗺️', label: 'Map', path: '/map' },
  { emoji: '+', label: 'Post', path: '/create', isMain: true },
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
      {/* Desktop sidebar */}
      <nav ref={ref} className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col" style={{
        background: 'hsla(var(--glass-bg) / 0.4)',
        backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(210%)',
        WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(210%)',
        borderRight: '0.5px solid hsla(var(--glass-border) / 0.4)',
      }}>
        <div className="px-5 h-14 flex items-center">
          <span className="text-[20px]" style={{ fontFamily: "'Pacifico', cursive" }}>
            any<span className="text-primary">buddy</span>
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-0.5 px-3 pt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isMain) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold tap-scale mt-3 mb-1">
                  <span className="text-base">➕</span>
                  <span className="text-sm">Create Plan</span>
                </button>
              );
            }

            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale transition-all text-left',
                  isActive ? 'bg-primary/8 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}>
                <div className="relative">
                  {item.path === '/profile' ? (
                    <GradientAvatar name={user?.firstName || 'guest'} size={24}
                      className={cn(isActive ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background' : 'opacity-60')} showInitials={false} />
                  ) : (
                    <span className={cn('text-[17px]', !isActive && 'opacity-60 grayscale-[30%]')}>{item.emoji}</span>
                  )}
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-destructive text-destructive-foreground text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-4">
          <button onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all w-full text-left">
            <span className="text-[17px] opacity-60">⚙️</span>
            <span className="text-[13px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav — minimal dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-md mx-auto px-6 pb-2">
          {/* Ultra-thin glass bar */}
          <div className="relative rounded-full px-1.5 py-1.5" style={{
            background: 'hsla(var(--glass-bg) / 0.35)',
            backdropFilter: 'blur(64px) saturate(260%)',
            WebkitBackdropFilter: 'blur(64px) saturate(260%)',
            border: '0.5px solid hsla(var(--glass-border) / 0.45)',
            boxShadow: `
              0 8px 32px hsla(var(--glass-shadow-lg)),
              0 1px 4px hsla(var(--glass-shadow)),
              inset 0 0.5px 0 hsla(var(--glass-highlight))
            `,
          }}>
            <div className="flex items-center justify-between">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                /* ── Center "Post" — pill button ── */
                if (item.isMain) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="tap-scale group"
                    >
                      <div className="h-[40px] px-5 rounded-full flex items-center justify-center gap-1.5 transition-transform group-active:scale-90" style={{
                        background: `linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 40%) 100%)`,
                        boxShadow: `
                          0 4px 16px hsl(var(--primary) / 0.3),
                          inset 0 1px 0 hsla(0 0% 100% / 0.2)
                        `,
                      }}>
                        <span className="text-[16px]">➕</span>
                        <span className="text-[11px] font-bold text-primary-foreground tracking-wide">Post</span>
                      </div>
                    </button>
                  );
                }

                /* ── Regular items — emoji with active pill bg ── */
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'relative flex items-center justify-center w-[44px] h-[40px] rounded-full tap-scale transition-all duration-300',
                      isActive && 'bg-primary/10'
                    )}
                  >
                    <div className="relative">
                      {item.path === '/profile' ? (
                        <GradientAvatar
                          name={user?.firstName || 'guest'}
                          size={isActive ? 24 : 22}
                          className={cn(
                            'transition-all duration-300',
                            isActive
                              ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-transparent'
                              : 'opacity-40'
                          )}
                          showInitials={false}
                        />
                      ) : (
                        <span className={cn(
                          'text-[20px] block transition-all duration-300',
                          isActive ? 'scale-110' : 'opacity-35 grayscale-[50%]'
                        )}>
                          {item.emoji}
                        </span>
                      )}
                      {item.path === '/notifications' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-bold px-[2px]"
                          style={{
                            background: 'hsl(var(--destructive))',
                            color: 'hsl(var(--destructive-foreground))',
                            boxShadow: '0 2px 6px hsl(var(--destructive) / 0.4)',
                          }}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
});
BottomNav.displayName = 'BottomNav';
