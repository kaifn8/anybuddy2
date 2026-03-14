import { useGamificationStore } from '@/store/useGamificationStore';
import { getLevelForXP, getNextLevel, getXPProgress } from '@/types/gamification';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  className?: string;
  compact?: boolean;
}

export function XPProgressBar({ className, compact = false }: XPProgressBarProps) {
  const xp = useGamificationStore((s) => s.xp);
  const currentLevel = getLevelForXP(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getXPProgress(xp);
  const xpToNext = nextLevel ? nextLevel.xpRequired - xp : 0;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm">{currentLevel.emoji}</span>
        <div className="flex-1">
          <div className="h-[3px] rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, hsl(${currentLevel.color}), hsl(${currentLevel.color} / 0.6))`,
              }}
            />
          </div>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className={cn('liquid-glass-heavy px-4 py-3.5', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentLevel.emoji}</span>
          <div>
            <p className="text-[13px] font-bold text-foreground">{currentLevel.title}</p>
            <p className="text-[10px] text-muted-foreground">Level {currentLevel.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-bold tabular-nums" style={{ color: `hsl(${currentLevel.color})` }}>
            {xp} XP
          </p>
          {nextLevel && (
            <p className="text-[10px] text-muted-foreground">{xpToNext} to {nextLevel.title}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, hsl(${currentLevel.color}), hsl(${currentLevel.color} / 0.55))`,
            boxShadow: `0 0 8px hsl(${currentLevel.color} / 0.4)`,
          }}
        />
      </div>

      {!nextLevel && (
        <p className="text-[11px] text-primary font-semibold text-center mt-2">Max level reached 🔥</p>
      )}
    </div>
  );
}
