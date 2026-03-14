import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { Flame, Snowflake } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StreakWidgetProps {
  compact?: boolean;
  className?: string;
}

export function StreakWidget({ compact = false, className }: StreakWidgetProps) {
  const { streak, useStreakFreeze } = useGamificationStore();

  const isActive = (() => {
    if (!streak.lastActiveDate) return false;
    return streak.lastActiveDate === new Date().toISOString().split('T')[0];
  })();

  const handleFreeze = () => {
    const success = useStreakFreeze();
    if (success) {
      toast({ title: '🧊 Streak frozen!', description: 'Your streak is safe for today.' });
    } else {
      toast({ title: 'No freeze tokens', description: 'Complete plans to earn more.' });
    }
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Flame size={14} className={cn('transition-colors', isActive ? 'text-accent fill-accent' : 'text-muted-foreground/40')} />
        <span className={cn('text-[12px] font-bold tabular-nums', isActive ? 'text-accent' : 'text-muted-foreground/50')}>
          {streak.count}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('liquid-glass-heavy px-4 py-3 flex items-center gap-3', className)}>
      <div className={cn(
        'w-10 h-10 rounded-[0.875rem] flex items-center justify-center transition-all shrink-0',
        isActive ? 'bg-accent/15' : 'bg-muted/40'
      )}>
        <Flame size={20} className={cn(isActive ? 'text-accent fill-accent' : 'text-muted-foreground/30')} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-bold text-foreground tabular-nums">{streak.count}-day streak</span>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isActive ? 'Active today ✓' : 'Do something social to keep it'}
        </p>
      </div>

      {/* Freeze token button — show if streak is at risk */}
      {!isActive && streak.count > 0 && (
        <button
          onClick={handleFreeze}
          className={cn(
            'shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full tap-scale transition-all',
            streak.freezeCount > 0
              ? 'bg-primary/10 text-primary'
              : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
          )}>
          <Snowflake size={12} />
          <span className="text-[10px] font-bold">{streak.freezeCount}</span>
        </button>
      )}

      {/* Show freeze count when active too */}
      {isActive && streak.freezeCount > 0 && (
        <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/8 text-primary">
          <Snowflake size={11} />
          <span className="text-[10px] font-bold">{streak.freezeCount}</span>
        </div>
      )}
    </div>
  );
}
