import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

const emojiMap: Record<string, string> = {
  nearby: '📍',
  urgent: '⚡',
  join: '🎉',
  message: '💬',
  credit: '💰',
  trust: '🛡️',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useAppStore();
  
  const handleClick = (n: typeof notifications[0]) => {
    markNotificationRead(n.id);
    if (n.requestId) navigate(`/request/${n.requestId}`);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const allRead = notifications.length > 0 && unreadCount === 0;
  const markAllRead = () => notifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });

  const now = new Date();
  const grouped = useMemo(() => {
    const last7 = notifications.filter(n => isAfter(new Date(n.timestamp), subDays(now, 7)));
    const last30 = notifications.filter(n => 
      !isAfter(new Date(n.timestamp), subDays(now, 7)) && isAfter(new Date(n.timestamp), subDays(now, 30))
    );
    const older = notifications.filter(n => !isAfter(new Date(n.timestamp), subDays(now, 30)));
    return { last7, last30, older };
  }, [notifications]);

  const NotifItem = ({ n }: { n: typeof notifications[0] }) => {
    const emoji = emojiMap[n.type] || '🔔';
    return (
      <button onClick={() => handleClick(n)}
        className={cn(
          'w-full liquid-glass-interactive flex items-start gap-3.5 py-3.5 px-3.5 text-left mb-2',
          !n.read && 'ring-1 ring-primary/8'
        )}>
        <div className="w-9 h-9 rounded-[0.625rem] liquid-glass flex items-center justify-center shrink-0 mt-0.5" style={{ borderRadius: '0.625rem' }}>
          <span className="text-[15px]">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-[13px] leading-snug tracking-tight', n.read ? 'font-medium text-muted-foreground' : 'font-bold text-foreground')}>{n.title}</p>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
          <p className="text-[10px] text-muted-foreground/40 mt-1.5 font-medium">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
        </div>
        {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2.5" />}
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <p className="section-label pt-5 pb-2">{label}</p>
  );

  const handleShare = async () => {
    const shareData = {
      title: 'Join me on AnyBuddy!',
      text: 'Find people to hang out with nearby. Download AnyBuddy!',
      url: window.location.origin,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Notifications" />
      
      {unreadCount > 0 && (
        <div className="flex justify-end px-5 pt-2">
          <button onClick={markAllRead} className="text-[11px] text-primary font-bold tap-scale flex items-center gap-1">
            ✅ Mark all read
          </button>
        </div>
      )}

      {allRead && (
        <div className="text-center px-5 pt-6 pb-3">
          <div className="w-14 h-14 rounded-[1.125rem] liquid-glass flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">✨</span>
          </div>
          <p className="text-base font-bold text-foreground tracking-tight">All caught up</p>
          <p className="text-sm text-muted-foreground mt-1">No new notifications right now</p>
        </div>
      )}
      
      <div className="px-5 pt-2">
        {notifications.length > 0 ? (
          <div>
            {grouped.last7.length > 0 && (
              <>
                <SectionHeader label="Last 7 days" />
                <div>{grouped.last7.map(n => <NotifItem key={n.id} n={n} />)}</div>
              </>
            )}
            {grouped.last30.length > 0 && (
              <>
                <SectionHeader label="Last 30 days" />
                <div>{grouped.last30.map(n => <NotifItem key={n.id} n={n} />)}</div>
              </>
            )}
            {grouped.older.length > 0 && (
              <>
                <SectionHeader label="Older" />
                <div>{grouped.older.map(n => <NotifItem key={n.id} n={n} />)}</div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-base font-bold text-foreground mb-2 tracking-tight">No updates yet</p>
            <div className="text-sm text-muted-foreground space-y-1.5 mb-8 leading-relaxed">
              <p>You'll get notified when:</p>
              <p>Someone joins your plan</p>
              <p>A plan starts soon nearby</p>
              <p>New plans appear in your area</p>
            </div>
            <Button onClick={() => navigate('/home')} size="sm">
              Browse Plans
            </Button>
          </div>
        )}

        {/* Invite */}
        <div className="mt-8 mb-4 p-5 liquid-glass-heavy text-center">
          <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center mx-auto mb-3" style={{ borderRadius: '0.75rem' }}>
            <span className="text-[17px]">📤</span>
          </div>
          <p className="text-[15px] font-bold text-foreground tracking-tight">Invite friends to AnyBuddy</p>
          <p className="text-sm text-muted-foreground mt-1.5 mb-4">More friends = more plans nearby</p>
          <Button onClick={handleShare} size="sm" className="mx-auto gap-1.5">
            📤 Share Invite Link
          </Button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
