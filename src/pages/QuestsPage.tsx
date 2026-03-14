import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { DailyQuestCard } from '@/components/gamification/DailyQuestCard';
import { useGamificationStore } from '@/store/useGamificationStore';
import { ACHIEVEMENTS, AchievementId } from '@/types/gamification';
import { cn } from '@/lib/utils';
import { Trophy, Star, Flame, ArrowRight } from 'lucide-react';

const RARITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  common:    { bg: 'bg-primary/6',    text: 'text-primary',    border: 'border-primary/20'    },
  rare:      { bg: 'bg-success/6',    text: 'text-success',    border: 'border-success/20'    },
  epic:      { bg: 'bg-secondary/6',  text: 'text-secondary',  border: 'border-secondary/20'  },
  legendary: { bg: 'bg-accent/10',    text: 'text-accent',     border: 'border-accent/20'     },
};

export default function QuestsPage() {
  const navigate = useNavigate();
  const { unlockedAchievements, streak, xp } = useGamificationStore();
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
  const newAchievementsCount = unlockedAchievements.filter(a => !a.seen).length;

  return (
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="Progress" hideChat />

        <div className="px-5 pt-5 space-y-4">
          {/* ── Header stats ── */}
          <div className="grid grid-cols-3 gap-2">
            <div className="liquid-glass p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame size={14} className="text-[hsl(36_80%_58%)]" />
                <span className="text-[15px] font-bold tabular-nums text-foreground">{streak.count}</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Day streak</p>
            </div>
            <div className="liquid-glass p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={14} className="text-primary" />
                <span className="text-[15px] font-bold tabular-nums text-foreground">{xp}</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total XP</p>
            </div>
            <div className="liquid-glass p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy size={14} className="text-[hsl(260_36%_56%)]" />
                <span className="text-[15px] font-bold tabular-nums text-foreground">{unlockedIds.size}</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Badges</p>
            </div>
          </div>

          {/* ── XP & Level ── */}
          <XPProgressBar />

          {/* ── Streak ── */}
          <StreakWidget />

          {/* ── Daily Quests ── */}
          <DailyQuestCard />

          {/* ── Leaderboard CTA ── */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="w-10 h-10 rounded-[0.875rem] flex items-center justify-center text-xl shrink-0 liquid-glass">
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground tracking-tight">Weekly Leaderboard</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">See who's most active in your city</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground/40 shrink-0" />
          </button>

          {/* ── Achievements ── */}
          <div className="liquid-glass-heavy p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-foreground tracking-tight flex items-center gap-1.5">
                🏅 Achievements
                {newAchievementsCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold">
                    {newAchievementsCount}
                  </span>
                )}
              </h3>
              <span className="text-[11px] text-muted-foreground">{unlockedIds.size}/{ACHIEVEMENTS.length}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const styles = RARITY_STYLES[achievement.rarity];

                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-[0.875rem] border transition-all text-center',
                      isUnlocked
                        ? `${styles.bg} ${styles.border}`
                        : 'bg-muted/20 border-border/20 opacity-40 grayscale'
                    )}
                  >
                    <span className="text-2xl">{achievement.emoji}</span>
                    <p className={cn(
                      'text-[9px] font-bold leading-tight',
                      isUnlocked ? styles.text : 'text-muted-foreground'
                    )}>
                      {achievement.title}
                    </p>
                    {isUnlocked && (
                      <span className={cn(
                        'text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase',
                        `${styles.bg} ${styles.text}`
                      )}>
                        {achievement.rarity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
