import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { Plus } from 'lucide-react';
import React from 'react';

const navItems = [
  { emoji: '🏠', label: 'Feed', path: '/home' },
  { emoji: '🗺️', label: 'Map', path: '/map' },
  { emoji: '🎉', label: 'Post', path: '/create', isMain: true },
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
                  <Plus size={18} strokeWidth={2.5} />
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

      {/* Mobile bottom nav — premium island style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-md mx-auto px-5 pb-3">
          <div className="relative flex items-end justify-around" style={{ height: 68 }}>
            {/* Glass backdrop bar */}
            <div className="absolute inset-x-0 bottom-0 h-[58px] rounded-[28px]" style={{
              background: 'hsla(var(--glass-bg) / 0.45)',
              backdropFilter: 'blur(60px) saturate(240%)',
              WebkitBackdropFilter: 'blur(60px) saturate(240%)',
              border: '0.5px solid hsla(var(--glass-border) / 0.5)',
              boxShadow: `
                0 8px 40px hsla(var(--glass-shadow-lg)),
                0 1.5px 6px hsla(var(--glass-shadow)),
                inset 0 1px 0 hsla(var(--glass-highlight)),
                inset 0 -0.5px 0 hsla(0 0% 0% / 0.04)
              `,
            }} />

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              /* ── Center "Post" button — elevated orb ── */
              if (item.isMain) {
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="relative z-10 flex flex-col items-center tap-scale group"
                    style={{ marginBottom: 10 }}
                  >
                    {/* Outer glow ring */}
                    <div className="absolute -inset-1.5 rounded-full opacity-60 group-active:opacity-80 transition-opacity" style={{
                      background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
                    }} />
                    {/* Main orb */}
                    <div className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center transition-transform group-active:scale-90" style={{
                      background: `linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(211 100% 38%) 100%)`,
                      boxShadow: `
                        0 6px 24px hsl(var(--primary) / 0.35),
                        0 2px 8px hsl(var(--primary) / 0.2),
                        inset 0 1.5px 0 hsla(0 0% 100% / 0.25),
                        inset 0 -1px 0 hsla(0 0% 0% / 0.1)
                      `,
                    }}>
                      <Plus size={24} strokeWidth={2.5} className="text-primary-foreground drop-shadow-sm" />
                    </div>
                  </button>
                );
              }

              /* ── Regular nav items ── */
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative z-10 flex flex-col items-center justify-center gap-[3px] min-w-[48px] tap-scale"
                  style={{ height: 58 }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute top-1.5 w-1 h-1 rounded-full bg-primary" style={{
                      boxShadow: '0 0 6px hsl(var(--primary) / 0.5)',
                    }} />
                  )}

                  <div className="relative mt-1">
                    {item.path === '/profile' ? (
                      <GradientAvatar
                        name={user?.firstName || 'guest'}
                        size={22}
                        className={cn(
                          'transition-all duration-300',
                          isActive
                            ? 'ring-[1.5px] ring-primary ring-offset-[1.5px] ring-offset-background scale-110'
                            : 'opacity-35 grayscale-[50%]'
                        )}
                        showInitials={false}
                      />
                    ) : (
                      <span className={cn(
                        'text-[19px] block transition-all duration-300',
                        isActive ? 'scale-110' : 'opacity-35 grayscale-[50%]'
                      )}>
                        {item.emoji}
                      </span>
                    )}
                    {item.path === '/notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-[15px] h-[15px] rounded-full flex items-center justify-center text-[7px] font-bold px-[3px]"
                        style={{
                          background: 'hsl(var(--destructive))',
                          color: 'hsl(var(--destructive-foreground))',
                          boxShadow: '0 2px 8px hsl(var(--destructive) / 0.4)',
                        }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'text-[9px] font-semibold leading-none tracking-wide transition-all duration-300',
                    isActive ? 'text-primary' : 'text-muted-foreground/30'
                  )}>
                    {item.label}
                  </span>
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
