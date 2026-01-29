import { MapPin } from 'lucide-react';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  
  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="max-w-md mx-auto flex items-center justify-between py-4 px-5">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary" strokeWidth={2} />
          <span className="font-medium text-foreground text-sm">
            {user?.city || 'Bangalore'}
          </span>
        </div>
        
        <span className="text-xl font-semibold text-gradient-primary tracking-tight">
          AnyBuddy
        </span>
        
        <LiveIndicator />
      </div>
    </header>
  );
}
