import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  
  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="max-w-md mx-auto flex items-center justify-between py-3.5 px-5">
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📍</span>
          <span className="font-semibold text-foreground text-sm">
            {user?.city || 'Bangalore'}
          </span>
        </div>
        
        {/* Logo */}
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          any<span className="text-primary">buddy</span>
        </span>
        
        {/* Live */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10">
          <div className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
          <span className="text-2xs font-semibold text-success">Live</span>
        </div>
      </div>
    </header>
  );
}
