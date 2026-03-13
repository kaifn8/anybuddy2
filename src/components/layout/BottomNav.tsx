import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Plus, Bell, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
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
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold tap-scale mt-3 mb-1">
                  <Icon size={18} />
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
                    <Icon size={19} strokeWidth={isActive ? 2.2 : 1.6} />
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
            <Settings size={19} strokeWidth={1.6} />
            <span className="text-[13px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-md mx-auto px-4 pb-2.5">
          <div className="flex items-center justify-around h-[56px] rounded-[22px]" style={{
            background: 'hsla(var(--glass-bg-heavy))',
            backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(210%)',
            WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(210%)',
            border: '0.5px solid hsla(var(--glass-border))',
            boxShadow: '0 -1px 12px hsla(var(--glass-shadow)), 0 4px 24px hsla(var(--glass-shadow-lg)), inset 0 0.5px 0 hsla(var(--glass-highlight))',
          }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              if (item.isMain) {
                return (
                  <button key={item.path} onClick={() => navigate(item.path)} className="relative -mt-5 tap-scale group">
                    <div className="w-[48px] h-[48px] rounded-[16px] flex items-center justify-center text-primary-foreground transition-all group-active:scale-90"
                      style={{
                        background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 42%) 100%)',
                        boxShadow: '0 4px 16px hsl(var(--primary) / 0.3), 0 1px 3px hsl(var(--primary) / 0.2), inset 0 1px 0 hsla(0 0% 100% / 0.15)',
                      }}>
                      <Plus size={21} strokeWidth={2.5} />
                    </div>
                    <span className="block text-center text-[9px] font-bold text-primary mt-1 tracking-tight">Post</span>
                  </button>
                );
              }

              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] py-1 tap-scale relative">
                  <div className="relative">
                    {item.path === '/profile' ? (
                      <GradientAvatar name={user?.firstName || 'guest'} size={21}
                        className={cn('transition-all', isActive ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background' : 'opacity-40 grayscale-[40%]')}
                        showInitials={false} />
                    ) : (
                      <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5}
                        className={cn('transition-all duration-300', isActive ? 'text-primary' : 'text-muted-foreground/40')} />
                    )}
                    {item.path === '/notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[7px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center font-bold px-[2px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={cn('text-[9px] font-medium leading-none transition-all duration-300',
                    isActive ? 'text-primary font-bold' : 'text-muted-foreground/40')}>
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
