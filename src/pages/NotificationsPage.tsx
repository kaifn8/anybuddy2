import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MapPin, Zap, MessageSquare, Coins, Shield, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const iconMap = {
  nearby: MapPin,
  urgent: Zap,
  join: Bell,
  message: MessageSquare,
  credit: Coins,
  trust: Shield,
};

const colorMap = {
  nearby: 'text-secondary bg-secondary/10',
  urgent: 'text-warning bg-warning/10',
  join: 'text-success bg-success/10',
  message: 'text-primary bg-primary/10',
  credit: 'text-accent-foreground bg-accent/20',
  trust: 'text-primary bg-primary/10',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useAppStore();
  
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markNotificationRead(notification.id);
    if (notification.requestId) {
      navigate(`/request/${notification.requestId}`);
    }
  };
  
  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 tap-scale">
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary font-medium tap-scale"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>
      
      <div className="p-5">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = iconMap[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all tap-scale neo-card',
                    !notification.read && 'ring-1 ring-primary/20 bg-primary/5'
                  )}
                >
                  <div className={cn(
                    'rounded-xl p-2.5 shrink-0',
                    colorMap[notification.type]
                  )}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      notification.read ? 'font-normal' : 'font-medium'
                    )}>
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
              We'll notify you when there's activity nearby
            </p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
