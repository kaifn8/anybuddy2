import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';
import { Flame, Snowflake } from 'lucide-react';

interface StreakWidgetProps {
  compact?: boolean;
  className?: string;
}

export function StreakWidget({ compact = false, className }: StreakWidgetProps) {
  const streak = useGamificationStore((s) => s.streak);

  const isActive = (() => {
    if (!streak.lastActiveDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return streak.lastActiveDate === today;
  })();

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Flame
          size={14}
          className={cn(
            'transition-colors',
            isActive ? 'text-[hsl(36_80%_58%)] fill-[hsl(36_80%_58%)]' : 'text-muted-foreground/40'
          )}
        />
        <span className={cn(
          'text-[12px] font-bold tabular-nums',
          isActive ? 'text-[hsl(36_80%_58%)]' : 'text-muted-foreground/50'
        )}>
          {streak.count}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'liquid-glass-heavy px-4 py-3 flex items-center gap-3',
      className
    )}>
      {/* Flame */}
      <div className="relative shrink-0">
        <div className={cn(
          'w-11 h-11 rounded-[0.875rem] flex items-center justify-center transition-all',
          isActive
            ? 'bg-[hsl(36_80%_58%/0.15)] shadow-[0_0_12px_hsl(36_80%_58%/0.3)]'
            : 'bg-muted/40'
        )}>
          <Flame
            size={22}
            className={cn(
              isActive
                ? 'text-[hsl(36_80%_58%)] fill-[hsl(36_80%_58%)]'
                : 'text-muted-foreground/30'
            )}
          />
        </div>
        {isActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-ping" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-bold text-foreground tabular-nums">{streak.count}-day streak</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isActive ? 'Active today ✓' : 'Do something social to keep it alive'}
        </p>
      </div>

      {/* Freeze badge */}
      {streak.freezeCount > 0 && (
        <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/8 text-primary">
          <Snowflake size={11} />
          <span className="text-[10px] font-bold">{streak.freezeCount}</span>
        </div>
      )}
    </div>
  );
}
