import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isAfter, subHours, subDays } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCheck, Flame } from 'lucide-react';
import type { Notification } from '@/types/anybuddy';

const NOTIF_CONFIG: Record<string, { emoji: string; color: string; bg: string; label: string }> = {
  nearby:     { emoji: '📍', color: 'text-primary',    bg: 'bg-primary/8',     label: 'Nearby'    },
  urgent:     { emoji: '⚡', color: 'text-warning',    bg: 'bg-warning/8',     label: 'Now'       },
  join:       { emoji: '🎉', color: 'text-success',    bg: 'bg-success/8',     label: 'Join'      },
  message:    { emoji: '💬', color: 'text-secondary',  bg: 'bg-secondary/8',   label: 'Message'   },
  credit:     { emoji: '💰', color: 'text-accent',     bg: 'bg-accent/8',      label: 'Credits'   },
  trust:      { emoji: '🛡️', color: 'text-primary',    bg: 'bg-primary/8',     label: 'Trust'     },
  reminder:   { emoji: '⏰', color: 'text-muted-foreground', bg: 'bg-muted/20', label: 'Reminder' },
  completion: { emoji: '✅', color: 'text-success',    bg: 'bg-success/8',     label: 'Complete'  },
  streak:     { emoji: '🔥', color: 'text-[hsl(36_80%_58%)]', bg: 'bg-[hsl(36_80%_58%/0.08)]', label: 'Streak' },
  badge:      { emoji: '🏅', color: 'text-secondary',  bg: 'bg-secondary/8',   label: 'Badge'     },
};

const FILTER_TABS = [
  { id: 'all',      label: 'All'     },
  { id: 'nearby',   label: 'Nearby'  },
  { id: 'join',     label: 'Joins'   },
  { id: 'message',  label: 'Chats'   },
];

function NotifItem({ n, onClick }: { n: Notification; onClick: () => void }) {
  const cfg = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.nearby;
  const timeAgo = formatDistanceToNow(new Date(n.timestamp), { addSuffix: true });
  const isRecent = isAfter(new Date(n.timestamp), subHours(new Date(), 2));

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3.5 py-3.5 px-4 text-left transition-all rounded-[1rem] mb-1.5',
        n.read
          ? 'liquid-glass'
          : 'liquid-glass-heavy ring-1 ring-primary/10'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-[0.75rem] flex items-center justify-center shrink-0 mt-0.5',
        cfg.bg
      )}>
        <span className="text-[17px]">{cfg.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-[13px] leading-snug tracking-tight flex-1',
            n.read ? 'font-medium text-muted-foreground' : 'font-bold text-foreground'
          )}>
            {n.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
            {isRecent && (
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide', cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 font-medium">{timeAgo}</p>
      </div>
    </button>
  );
}

// Simulated streak/badge nudge notifications
const HABIT_NOTIFICATIONS: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  { type: 'streak' as any, title: '🔥 Streak at risk!', message: "You haven't been active today. Do something social to keep your streak alive.", requestId: undefined },
  { type: 'badge' as any, title: '🏅 Badge unlocked: Night Owl', message: 'You attended an activity after 9 PM. Keep it up!', requestId: undefined },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, addNotification } = useAppStore();
  const streak = useGamificationStore((s) => s.streak);
  const [filter, setFilter] = useState('all');

  const handleClick = (n: Notification) => {
    markNotificationRead(n.id);
    if (n.requestId) navigate(`/request/${n.requestId}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => notifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const now = new Date();
  const today = filtered.filter(n => isAfter(new Date(n.timestamp), subHours(now, 24)));
  const older = filtered.filter(n => !isAfter(new Date(n.timestamp), subHours(now, 24)));

  // Show streak warning if streak active but not today
  const showStreakWarning = streak.count > 0 && streak.lastActiveDate !== new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="Notifications" hideChat />

        {/* Streak warning banner */}
        {showStreakWarning && (
          <div
            className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-[1rem]"
            style={{ background: 'hsl(36 80% 58% / 0.10)', border: '1px solid hsl(36 80% 58% / 0.25)' }}
          >
            <Flame size={18} style={{ color: 'hsl(36 80% 58%)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold" style={{ color: 'hsl(36 80% 58%)' }}>
                {streak.count}-day streak at risk!
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Do something social today to keep it</p>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'hsl(36 80% 58%)', color: '#fff' }}
            >
              Go →
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-5 pt-4 pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tap-scale transition-all',
                filter === tab.id ? 'glass-pill-active' : 'glass-pill-inactive'
              )}
            >
              {tab.label}
            </button>
          ))}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="shrink-0 ml-auto flex items-center gap-1 px-3 py-1.5 text-[11px] text-primary font-bold tap-scale"
            >
              <CheckCheck size={12} />
              All read
            </button>
          )}
        </div>

        <div className="px-5 pt-1">
          {notifications.length > 0 ? (
            <>
              {today.length > 0 && (
                <>
                  <p className="section-label pt-3 pb-2">Today</p>
                  {today.map(n => <NotifItem key={n.id} n={n} onClick={() => handleClick(n)} />)}
                </>
              )}
              {older.length > 0 && (
                <>
                  <p className="section-label pt-4 pb-2">Earlier</p>
                  {older.map(n => <NotifItem key={n.id} n={n} onClick={() => handleClick(n)} />)}
                </>
              )}
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <BellOff size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-[14px] text-muted-foreground">No {filter} notifications</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-5">
                <Bell size={26} className="text-muted-foreground/40" />
              </div>
              <p className="text-base font-bold text-foreground mb-2 tracking-tight">No updates yet</p>
              <div className="text-[13px] text-muted-foreground space-y-1 mb-8 leading-relaxed">
                <p>You'll be notified when:</p>
                <p>Someone joins your plan · Streak is at risk</p>
                <p>Nearby plans appear · Badges unlocked</p>
              </div>
              <Button onClick={() => navigate('/home')} size="sm">Browse Plans</Button>
            </div>
          )}

          {/* Invite */}
          <div className="mt-6 mb-4 p-4 liquid-glass-heavy flex items-center gap-3">
            <div className="w-10 h-10 rounded-[0.875rem] liquid-glass flex items-center justify-center shrink-0 text-xl">
              📤
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground tracking-tight">Invite friends</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">More friends = more plans</p>
            </div>
            <Button onClick={() => navigate('/invite')} size="sm" variant="secondary">Invite</Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
