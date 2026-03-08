import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

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
  
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markNotificationRead(notification.id);
    if (notification.requestId) navigate(`/request/${notification.requestId}`);
  };
  
  const markAllRead = () => {
    notifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-40 glass-nav">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="tap-scale text-lg">←</button>
            <div>
              <h1 className="text-lg font-extrabold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary font-semibold tap-scale">
              Mark all read ✓
            </button>
          )}
        </div>
      </header>
      
      <div className="p-5">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all tap-scale uber-card',
                  !notification.read && 'ring-1 ring-primary/20 bg-primary/5'
                )}
              >
                <span className="text-xl shrink-0 mt-0.5">
                  {emojiMap[notification.type] || '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', notification.read ? 'font-normal' : 'font-semibold')}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-1.5">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🔔</span>
            <h3 className="font-bold mb-1">All quiet here</h3>
            <p className="text-sm text-muted-foreground">
              We'll ping you when there's action nearby 🎯
            </p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
