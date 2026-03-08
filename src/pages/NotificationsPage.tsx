import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { Share2 } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const emojiMap: Record<string, string> = {
  nearby: '📍', urgent: '⚡', join: '🎉', message: '💬', credit: '💰', trust: '🛡️',
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

  const NotifItem = ({ n }: { n: typeof notifications[0] }) => (
    <button onClick={() => handleClick(n)}
      className={cn(
        'w-full flex items-start gap-3 py-3 px-1 text-left transition-all tap-scale border-b border-border/30 last:border-b-0',
        !n.read && 'bg-primary/[0.03]'
      )}>
      <span className="text-base shrink-0 mt-0.5">{emojiMap[n.type] || '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', n.read ? 'font-normal text-muted-foreground' : 'font-semibold text-foreground')}>{n.title}</p>
        <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-2xs text-muted-foreground/50 mt-1">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <p className="text-2xs font-semibold text-muted-foreground/70 uppercase tracking-wider pt-4 pb-1.5">{label}</p>
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
        <div className="flex justify-end px-5 pt-1">
          <button onClick={markAllRead} className="text-2xs text-primary font-semibold tap-scale">Mark all read</button>
        </div>
      )}

      {allRead && (
        <div className="text-center px-5 pt-4 pb-2">
          <span className="text-2xl block mb-1">✨</span>
          <p className="text-sm font-semibold text-foreground">You're all caught up!</p>
          <p className="text-2xs text-muted-foreground mt-0.5">No new notifications right now</p>
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
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">🔔</span>
            <p className="text-sm font-medium text-foreground mb-2">No updates yet</p>
            <div className="text-xs text-muted-foreground space-y-1.5 mb-6">
              <p>You'll get notified when:</p>
              <p>• Someone joins your plan</p>
              <p>• A plan starts soon nearby</p>
              <p>• New plans appear in your area</p>
            </div>
            <button onClick={() => navigate('/home')} className="tahoe-btn-primary h-9 px-5 tap-scale text-xs font-semibold">
              Browse Plans
            </button>
          </div>
        )}

        {/* Invite Friends */}
        <div className="mt-6 mb-4 p-4 rounded-2xl liquid-glass text-center">
          <span className="text-2xl block mb-2">👋</span>
          <p className="text-sm font-semibold text-foreground">Invite friends to AnyBuddy</p>
          <p className="text-2xs text-muted-foreground mt-1 mb-3">More friends = more plans nearby. Share the love!</p>
          <button onClick={handleShare} className="tahoe-btn-primary h-9 px-6 tap-scale text-xs font-semibold flex items-center gap-1.5 mx-auto">
            <Share2 size={14} /> Share Invite Link
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
