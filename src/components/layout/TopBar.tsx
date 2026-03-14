import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Bell, ChevronLeft, Settings, MessageCircle, Search } from 'lucide-react';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  hideChat?: boolean;
  showSettings?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightSlot?: React.ReactNode;
  transparent?: boolean;
}

const SUB_PAGES = [
  '/credits', '/invite', '/notifications', '/settings', '/circle',
  '/attendance', '/review', '/leaderboard', '/quests', '/chats',
  '/host/', '/join/', '/request/', '/create',
];

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/credits':      { title: 'Credits',        subtitle: 'Your social currency' },
  '/invite':       { title: 'Invite Friends',  subtitle: 'Grow your circle' },
  '/notifications':{ title: 'Activity',        subtitle: 'What\'s happening' },
  '/settings':     { title: 'Settings' },
  '/circle':       { title: 'My Circle' },
  '/attendance':   { title: 'After the Meetup' },
  '/review':       { title: 'Rate Meetup' },
  '/leaderboard':  { title: 'Leaderboard',     subtitle: 'Top connectors' },
  '/quests':       { title: 'Progress',         subtitle: 'Quests & streaks' },
  '/chats':        { title: 'Chats' },
  '/create':       { title: 'New Plan' },
};

function getPageMeta(pathname: string): { title?: string; subtitle?: string } {
  for (const [key, meta] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key)) return meta;
  }
  return {};
}

export function TopBar({
  showBack = false,
  title,
  subtitle,
  hideChat = false,
  showSettings = false,
  showSearch = false,
  onSearchClick,
  rightSlot,
  transparent = false,
}: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const requests     = useAppStore((s) => s.requests);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);
  const notifications  = useAppStore((s) => s.notifications);
  const user           = useAppStore((s) => s.user);

  const activeCount = requests.filter((r) => r.status === 'active').length;

  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const totalBadge   = unreadChats + unreadNotifs;

  const isSubPage = showBack || SUB_PAGES.some((p) => location.pathname.startsWith(p));
  const isHome    = location.pathname === '/' || location.pathname === '/home';
  const isMap     = location.pathname === '/map';
  const isProfile = location.pathname === '/profile';

  // Resolve title/subtitle
  const autoMeta    = getPageMeta(location.pathname);
  const displayTitle    = title    ?? autoMeta.title;
  const displaySubtitle = subtitle ?? autoMeta.subtitle;

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Glass button style ──────────────────────────────────────
  const glassBtn = cn(
    'relative flex items-center justify-center rounded-full transition-all duration-200',
    'w-9 h-9 tap-scale',
    'bg-white/60 dark:bg-white/[0.07] backdrop-blur-xl',
    'border border-white/70 dark:border-white/10',
    'shadow-[0_1px_4px_hsl(var(--foreground)/0.06),inset_0_0.5px_0_hsl(0_0%_100%/0.8)]',
    'dark:shadow-[0_1px_4px_hsl(0_0%_0%/0.25),inset_0_0.5px_0_hsl(0_0%_100%/0.05)]',
    'hover:bg-white/80 dark:hover:bg-white/[0.12] active:scale-95',
  );

  const Badge = ({ count }: { count: number }) => (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-destructive flex items-center justify-center text-[8px] font-bold text-white px-[3px] shadow-sm">
      {count > 9 ? '9+' : count}
    </span>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 lg:pl-64',
        transparent
          ? 'bg-transparent'
          : 'border-b border-border/30',
      )}
      style={transparent ? undefined : {
        background: 'hsla(var(--glass-bg) / 0.55)',
        backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(180%)',
        WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(180%)',
      }}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 h-[52px] flex items-center gap-3">

        {/* ── LEFT ─────────────────────────────────────── */}
        <div className="flex items-center shrink-0">
          {isSubPage ? (
            <button onClick={() => navigate(-1)} className={glassBtn} aria-label="Go back">
              <ChevronLeft size={18} className="text-foreground -ml-0.5" />
            </button>
          ) : isHome ? (
            /* Home: avatar links to profile */
            <button
              onClick={() => navigate('/profile')}
              className="tap-scale rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all duration-200"
            >
              <GradientAvatar name={user?.name ?? 'Me'} size={32} />
            </button>
          ) : (
            /* Map / Profile: live pill */
            <div className="flex items-center gap-1.5">
              <span className="relative flex items-center justify-center">
                <span className="w-[5px] h-[5px] rounded-full bg-success" />
                <span className="absolute w-[5px] h-[5px] rounded-full bg-success animate-ping opacity-60" />
              </span>
              <span className="text-[10px] font-bold text-success tracking-wide uppercase">{activeCount} live</span>
            </div>
          )}
        </div>

        {/* ── CENTER ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {displayTitle ? (
            <div>
              <h1 className="text-[15px] font-bold text-foreground tracking-tight leading-tight truncate">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate">{displaySubtitle}</p>
              )}
            </div>
          ) : isHome ? (
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">{greeting},</p>
              <span
                className="text-[18px] font-bold text-foreground tracking-tight leading-tight lg:hidden"
                style={{ fontFamily: "'Pacifico', cursive" }}
              >
                any<span className="text-primary">buddy</span>
              </span>
              <span className="hidden lg:block text-[15px] font-bold text-foreground">{firstName} 👋</span>
            </div>
          ) : (
            <span
              className="text-[18px] font-bold text-foreground lg:hidden"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              any<span className="text-primary">buddy</span>
            </span>
          )}
        </div>

        {/* ── RIGHT ────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Custom right slot */}
          {rightSlot}

          {/* Search */}
          {showSearch && (
            <button onClick={onSearchClick} className={glassBtn} aria-label="Search">
              <Search size={15} className="text-foreground" />
            </button>
          )}

          {/* Notification bell — show on home/map when there are unread */}
          {!showSettings && !isSubPage && unreadNotifs > 0 && (
            <button onClick={() => navigate('/notifications')} className={glassBtn} aria-label="Notifications">
              <Bell size={15} className="text-foreground" />
              <Badge count={unreadNotifs} />
            </button>
          )}

          {/* Sub-page bell — always visible on notifications accessible pages */}
          {isSubPage && unreadNotifs > 0 && !displayTitle?.includes('Activity') && (
            <button onClick={() => navigate('/notifications')} className={glassBtn} aria-label="Notifications">
              <Bell size={15} className="text-foreground" />
              <Badge count={unreadNotifs} />
            </button>
          )}

          {/* Settings gear */}
          {showSettings || isProfile ? (
            <button onClick={() => navigate('/settings')} className={glassBtn} aria-label="Settings">
              <Settings size={15} className="text-foreground" />
            </button>
          ) : !hideChat && !isSubPage ? (
            /* Chat button — home & map */
            <button onClick={() => navigate('/chats')} className={glassBtn} aria-label="Chats">
              <MessageCircle size={15} className="text-foreground" />
              {totalBadge > 0 && <Badge count={totalBadge} />}
            </button>
          ) : null}
        </div>

      </div>
    </header>
  );
}
