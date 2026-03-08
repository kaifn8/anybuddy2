import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

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
  const markAllRead = () => notifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Notifications" />
      {unreadCount > 0 && (
        <div className="flex justify-end px-5 pt-1">
          <button onClick={markAllRead} className="text-2xs text-primary font-semibold tap-scale">Mark all read</button>
        </div>
      )}
      
      <div className="px-5 pt-3">
        {notifications.length > 0 ? (
          <div className="space-y-1.5">
            {notifications.map((n) => (
              <button key={n.id} onClick={() => handleClick(n)}
                className={cn(
                  'w-full flex items-start gap-2.5 p-3 text-left transition-all tap-scale liquid-glass',
                  !n.read && 'ring-1 ring-primary/15'
                )} style={{ borderRadius: '0.75rem' }}>
                <span className="text-base shrink-0 mt-0.5">{emojiMap[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', n.read ? 'font-normal' : 'font-semibold')}>{n.title}</p>
                  <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-2xs text-muted-foreground/60 mt-1">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                </div>
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />}
              </button>
            ))}
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
      </div>
      
      <BottomNav />
    </div>
  );
}
