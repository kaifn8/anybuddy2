import { Home, PlusCircle, Bell, User, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
  { icon: PlusCircle, label: 'Post', path: '/create', isMain: true },
  { icon: Wallet, label: 'Credits', path: '/credits' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          if (item.isMain) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-5 tap-scale"
              >
                <div className="gradient-primary rounded-full p-3.5 shadow-ios-lg">
                  <Icon size={24} className="text-primary-foreground" strokeWidth={2} />
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 tap-scale transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-warning text-warning-foreground text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-semibold px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
