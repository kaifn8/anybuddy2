import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  
  return (
    <header className="sticky top-0 z-40 liquid-glass-nav">
      <div className="max-w-md mx-auto flex items-center justify-between h-12 px-5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">📍</span>
          <span className="text-sm font-semibold text-foreground">{user?.city || 'Bangalore'}</span>
        </div>
        
        <span className="text-body font-bold tracking-tight text-foreground">
          any<span className="text-primary">buddy</span>
        </span>
        
        <div className="liquid-glass-subtle flex items-center gap-1.5 px-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
          <span className="text-2xs font-semibold text-success">Live</span>
        </div>
      </div>
    </header>
  );
}
