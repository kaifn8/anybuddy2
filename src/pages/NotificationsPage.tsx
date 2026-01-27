import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MapPin, Zap, MessageSquare, Coins, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';

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
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold">Notifications</h1>
        </div>
      </header>
      
      <div className="p-4">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = iconMap[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all tap-scale ${
                    notification.read ? 'bg-card' : 'bg-primary/5'
                  } card-shadow`}
                >
                  <div className={`rounded-lg p-2 shrink-0 ${colorMap[notification.type]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${notification.read ? '' : 'text-foreground'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
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
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-6 w-fit mx-auto mb-4">
              <Bell size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No notifications yet</h3>
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
