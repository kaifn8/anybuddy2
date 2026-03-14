import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';

const navItems = [
  { emoji: '🏠', label: 'Home',          path: '/home'          },
  { emoji: '🗺️', label: 'Map',           path: '/map'           },
  { emoji: '+',  label: 'Post',          path: '/create',        isMain: true },
  { emoji: '🔔', label: 'Notifications', path: '/notifications' },
  { emoji: '👤', label: 'Me',            path: '/profile'       },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const user = useAppStore((s) => s.user);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-md mx-auto px-6 pb-2">
        <div className="relative rounded-full px-1.5 py-1.5" style={{
          background: 'hsla(var(--glass-bg) / 0.35)',
          backdropFilter: 'blur(64px) saturate(260%)',
          WebkitBackdropFilter: 'blur(64px) saturate(260%)',
          border: '0.5px solid hsla(var(--glass-border))',
          boxShadow: `0 8px 32px hsla(var(--glass-shadow-lg)), 0 1px 4px hsla(var(--glass-shadow)), inset 0 0.5px 0 hsla(var(--glass-highlight))`,
        }}>
          <div className="flex items-center justify-between">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const badge = item.path === '/notifications' ? unreadNotifs : 0;

              if (item.isMain) {
                return (
                  <button key={item.path} onClick={() => navigate(item.path)} className="tap-scale group">
                    <div className="h-[40px] px-5 rounded-full flex items-center justify-center gap-1.5 transition-transform group-active:scale-90" style={{
                      background: `linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(211 100% 40%) 100%)`,
                      boxShadow: `0 4px 16px hsl(var(--primary) / 0.3), inset 0 1px 0 hsla(0 0% 100% / 0.2)`,
                    }}>
                      <span className="text-[16px]">➕</span>
                      <span className="text-[11px] font-bold text-primary-foreground tracking-wide">Post</span>
                    </div>
                  </button>
                );
              }

              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className={cn(
                    'relative flex items-center justify-center w-[44px] h-[40px] rounded-full tap-scale transition-all duration-300',
                    isActive && 'bg-primary/10'
                  )}>
                  <div className="relative">
                    {item.path === '/profile' ? (
                      <GradientAvatar name={user?.firstName || 'Me'} size={isActive ? 24 : 22}
                        className={cn('transition-all duration-300', isActive
                          ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-transparent'
                          : 'opacity-40')} showInitials={false} />
                    ) : (
                      <span className={cn('text-[20px] block transition-all duration-300',
                        isActive ? 'scale-110' : 'opacity-35 grayscale-[50%]')}>
                        {item.emoji}
                      </span>
                    )}
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-bold px-[2px]"
                        style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', boxShadow: '0 2px 6px hsl(var(--destructive) / 0.4)' }}>
                        {badge > 9 ? '9+' : badge}
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
  );
}
