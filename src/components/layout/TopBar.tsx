import { MapPin } from 'lucide-react';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  
  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="max-w-md mx-auto flex items-center justify-between py-3.5 px-5">
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-primary" strokeWidth={2.5} />
          <span className="font-medium text-foreground text-sm">
            {user?.city || 'Bangalore'}
          </span>
        </div>
        
        {/* Logo */}
        <span className="text-lg font-bold text-gradient-primary tracking-tight">
          AnyBuddy
        </span>
        
        {/* Live Indicator */}
        <LiveIndicator />
      </div>
    </header>
  );
}
