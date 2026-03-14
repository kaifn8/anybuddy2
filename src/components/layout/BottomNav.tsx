import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import React from 'react';

// Core 5-tab nav: Home | Map | Post | Chats | Me
const navItems = [
  { emoji: '🏠', label: 'Home',  path: '/home'    },
  { emoji: '🗺️', label: 'Map',   path: '/map'     },
  { emoji: '+',  label: 'Post',  path: '/create',  isMain: true },
  { emoji: '💬', label: 'Chats', path: '/chats'   },
  { emoji: '👤', label: 'Me',    path: '/profile'  },
];

// Desktop sidebar includes all secondary pages too
const desktopItems = [
  { emoji: '🏠', label: 'Home',          path: '/home'          },
  { emoji: '🗺️', label: 'Map',           path: '/map'           },
  { emoji: '💬', label: 'Chats',         path: '/chats'         },
  { emoji: '🔔', label: 'Notifications', path: '/notifications' },
  { emoji: '⚡', label: 'Quests',        path: '/quests'        },
  { emoji: '👥', label: 'My Circle',     path: '/circle'        },
  { emoji: '🏆', label: 'Leaderboard',   path: '/leaderboard'   },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const user = useAppStore((s) => s.user);
  const streak = useGamificationStore((s) => s.streak);
  const unlockedAchievements = useGamificationStore((s) => s.unlockedAchievements);

  const unreadCount = notifications.filter(n => !n.read).length;
  const questsBadge = unlockedAchievements.filter(a => !a.seen).length;

  // Joined chats with unread — simulated for now
  const { joinedRequests, chatMessages } = useAppStore();
  const chatUnread = joinedRequests.reduce((acc, id) => {
    const msgs = chatMessages[id] || [];
    return acc + (msgs.length > 0 ? 1 : 0);
  }, 0);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col" style={{
        background: 'hsla(var(--glass-bg) / 0.4)',
        backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(210%)',
        WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(210%)',
        borderRight: '0.5px solid hsla(var(--glass-border) / 0.4)',
      }}>
        {/* Logo */}
        <div className="px-5 h-14 flex items-center">
          <span className="text-[20px]" style={{ fontFamily: "'Pacifico', cursive" }}>
            any<span className="text-primary">buddy</span>
          </span>
        </div>

        {/* Create button */}
        <div className="px-3 pt-1 pb-2">
          <button onClick={() => navigate('/create')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold tap-scale">
            <span className="text-base">➕</span>
            <span className="text-sm">Post a plan</span>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col gap-0.5 px-3">
          {desktopItems.map((item) => {
            const isActive = location.pathname === item.path;
            const badge = item.path === '/notifications' ? unreadCount
              : item.path === '/chats' ? chatUnread
              : item.path === '/quests' ? questsBadge
              : 0;

            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale transition-all text-left relative',
                  isActive ? 'bg-primary/8 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}>
                <div className="relative">
                  <span className={cn('text-[17px]', !isActive && 'opacity-60 grayscale-[30%]')}>{item.emoji}</span>
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[8px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center font-bold px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer: streak + profile + settings */}
        <div className="px-3 pb-4 space-y-1">
          <div className="px-3 py-2">
            <StreakWidget compact className="justify-start" />
          </div>
          <button onClick={() => navigate('/profile')}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale transition-all w-full text-left',
              location.pathname === '/profile' ? 'bg-primary/8 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground')}>
            <GradientAvatar name={user?.firstName || 'Me'} size={22}
              className={cn(location.pathname === '/profile' ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background' : 'opacity-60')} showInitials={false} />
            <span className="text-[13px]">{user?.firstName || 'Profile'}</span>
          </button>
          <button onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl tap-scale text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all w-full text-left">
            <span className="text-[17px] opacity-60">⚙️</span>
            <span className="text-[13px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom nav dock ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
                const badge = item.path === '/chats' ? chatUnread + unreadCount
                  : 0;

                /* ── Center Post pill ── */
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

                /* ── Regular tab ── */
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
                      {/* Combined badge: chats + notifications both on Chats tab */}
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-bold px-[2px]"
                          style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', boxShadow: '0 2px 6px hsl(var(--destructive) / 0.4)' }}>
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                      {/* Quests badge on Me tab */}
                      {item.path === '/profile' && questsBadge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[7px] font-bold px-[2px]"
                          style={{ background: 'hsl(var(--accent))', color: '#fff', boxShadow: '0 2px 6px hsl(var(--accent) / 0.5)' }}>
                          {questsBadge}
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
};
