import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Bell, ChevronLeft, Settings, MessageCircle } from 'lucide-react';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  hideChat?: boolean;
  showSettings?: boolean;
  rightSlot?: React.ReactNode;
}

const SUB_PAGES = [
  '/credits', '/invite', '/notifications', '/settings', '/circle',
  '/attendance', '/review', '/leaderboard', '/quests',
  '/host/', '/join/', '/request/', '/create',
];

export function TopBar({
  showBack = false,
  title,
  subtitle,
  hideChat = false,
  showSettings = false,
  rightSlot,
}: TopBarProps) {
  const navigate       = useNavigate();
  const location       = useLocation();
  const requests       = useAppStore((s) => s.requests);
  const chatMessages   = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);
  const notifications  = useAppStore((s) => s.notifications);
  const user           = useAppStore((s) => s.user);

  const activeCount  = requests.filter((r) => r.status === 'active').length;
  const unreadChats  = joinedRequests.reduce((c, id) => c + ((chatMessages[id]?.length ?? 0) > 0 ? 1 : 0), 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const totalBadge   = unreadChats + unreadNotifs;

  const isSubPage = showBack || SUB_PAGES.some((p) => location.pathname.startsWith(p));
  const isHome    = location.pathname === '/' || location.pathname === '/home';
  const isProfile = location.pathname === '/profile';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  // ── Shared pill-button style (uses design system glass) ──
  const pillBtn = 'relative liquid-glass flex items-center justify-center w-8 h-8 tap-scale rounded-full';

  const NotifBadge = ({ count }: { count: number }) => (
    <span className="absolute -top-[3px] -right-[3px] min-w-[15px] h-[15px] rounded-full bg-destructive flex items-center justify-center text-[8px] font-bold text-white px-[2px] shadow">
      {count > 9 ? '9+' : count}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 lg:pl-64 liquid-glass-nav">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 h-[52px] flex items-center gap-3">

        {/* ── LEFT ── */}
        <div className="shrink-0">
          {isSubPage ? (
            <button onClick={() => navigate(-1)} className={pillBtn} aria-label="Back">
              <ChevronLeft size={17} className="text-foreground -ml-px" />
            </button>
          ) : isHome ? (
            <button
              onClick={() => navigate('/profile')}
              className="tap-scale rounded-full ring-[1.5px] ring-primary/25 hover:ring-primary/50 transition-all"
            >
              <GradientAvatar name={user?.firstName ?? 'Me'} size={30} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 pl-0.5">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-success" />
              </span>
              <span className="text-[10px] font-bold text-success tracking-widest uppercase">{activeCount} live</span>
            </div>
          )}
        </div>

        {/* ── CENTER ── */}
        <div className="flex-1 min-w-0">
          {title ? (
            <div className="flex flex-col justify-center">
              <h1 className="text-[15px] font-bold text-foreground tracking-tight leading-tight truncate">{title}</h1>
              {subtitle && <p className="text-[10px] text-muted-foreground leading-none mt-px truncate">{subtitle}</p>}
            </div>
          ) : isHome ? (
            <div className="flex flex-col justify-center gap-px">
              <p className="text-[9px] font-semibold text-muted-foreground tracking-widest uppercase leading-none">
                {greeting} 👋
              </p>
              <span
                className="text-[19px] leading-tight font-bold text-foreground lg:hidden"
                style={{ fontFamily: "'Pacifico', cursive", letterSpacing: '-0.01em' }}
              >
                any<span className="text-primary">buddy</span>
              </span>
              <span className="hidden lg:block text-[15px] font-bold text-foreground tracking-tight">
                {user?.firstName ?? 'Home'}
              </span>
            </div>
          ) : (
            <span
              className="text-[19px] font-bold text-foreground lg:hidden"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              any<span className="text-primary">buddy</span>
            </span>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {rightSlot}

          {/* Bell — home/map only when there are unreads */}
          {!isSubPage && !showSettings && unreadNotifs > 0 && (
            <button onClick={() => navigate('/notifications')} className={pillBtn} aria-label="Notifications">
              <Bell size={14} className="text-foreground" />
              <NotifBadge count={unreadNotifs} />
            </button>
          )}

          {/* Settings on profile, or chat button on home/map */}
          {showSettings || isProfile ? (
            <button onClick={() => navigate('/settings')} className={pillBtn} aria-label="Settings">
              <Settings size={14} className="text-foreground" />
            </button>
          ) : !hideChat && !isSubPage ? (
            <button onClick={() => navigate('/chats')} className={pillBtn} aria-label="Chats">
              <MessageCircle size={14} className="text-foreground" />
              {totalBadge > 0 && <NotifBadge count={totalBadge} />}
            </button>
          ) : null}
        </div>

      </div>
    </header>
  );
}
