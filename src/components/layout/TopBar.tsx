import { MapPin } from 'lucide-react';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border">
      <div className="max-w-md mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          <span className="font-semibold text-foreground">
            {user?.city || 'Bangalore'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-gradient-primary">
            AnyBuddy
          </span>
        </div>
        
        <LiveIndicator />
      </div>
    </header>
  );
}
