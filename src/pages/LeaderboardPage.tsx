import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useAppStore } from '@/store/useAppStore';
import { getLevelForXP } from '@/types/gamification';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { cn } from '@/lib/utils';
import { Trophy, Flame } from 'lucide-react';

// Fake leaderboard entries seeded by week number
const FAKE_NAMES = ['Priya M.', 'Arjun S.', 'Maya K.', 'Rohan V.', 'Zara Q.', 'Aditya P.', 'Neha R.', 'Vikram D.', 'Kabir T.', 'Riya N.'];
const FAKE_XP_BASE = [420, 380, 310, 290, 260, 240, 215, 185, 160, 130];

function generateLeaderboard(userXp: number, userName: string, userStreak: number) {
  const week = Math.floor(Date.now() / (7 * 86400000));
  const entries = FAKE_NAMES.map((name, i) => {
    const seed = (week * 1000 + i * 37) % 100;
    const xp = Math.max(10, FAKE_XP_BASE[i] + (seed % 80) - 40);
    return {
      userId: `fake_${i}`,
      name,
      xp,
      weeklyXp: xp,
      level: getLevelForXP(xp * 8).level,
      city: 'Mumbai',
      streak: Math.floor(seed % 15) + 1,
    };
  });

  // Add real user
  const realUser = {
    userId: 'me',
    name: userName || 'You',
    xp: userXp,
    weeklyXp: userXp,
    level: getLevelForXP(userXp * 8).level,
    city: 'Mumbai',
    streak: userStreak,
  };

  return [...entries, realUser].sort((a, b) => b.weeklyXp - a.weeklyXp);
}

const RANK_STYLES = [
  'text-[hsl(36_80%_58%)]',
  'text-muted-foreground',
  'text-[hsl(36_55% 38%)]',
];

const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { xp, weeklyXp, streak } = useGamificationStore();
  const user = useAppStore((s) => s.user);

  const board = useMemo(
    () => generateLeaderboard(weeklyXp, user?.firstName || 'You', streak.count),
    [weeklyXp, user?.firstName, streak.count]
  );

  const myRank = board.findIndex(e => e.userId === 'me') + 1;

  // Reset countdown
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (7 - now.getDay() + 1) % 7 || 7);
  nextMonday.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((nextMonday.getTime() - now.getTime()) / 86400000);

  return (
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="Leaderboard" showBack hideChat />

        <div className="px-5 pt-5 space-y-4">
          {/* Header */}
          <div className="liquid-glass-heavy p-4 text-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              📍 Mumbai · Weekly XP
            </p>
            <p className="text-[13px] font-medium text-muted-foreground">
              Resets in <span className="text-foreground font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
            </p>
            {myRank > 0 && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 text-primary">
                <Trophy size={12} />
                <span className="text-[11px] font-bold">You're #{myRank}</span>
              </div>
            )}
          </div>

          {/* Top 3 podium */}
          <div className="flex items-end gap-3 px-2">
            {[1, 0, 2].map((idx) => {
              const entry = board[idx];
              if (!entry) return null;
              const isMe = entry.userId === 'me';
              const heights = ['h-24', 'h-28', 'h-20'];
              const podiumIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2; // reorder: 2nd, 1st, 3rd

              return (
                <div key={entry.userId} className={cn('flex-1 flex flex-col items-center gap-2', idx === 1 && 'scale-105')}>
                  <div className="relative">
                    <GradientAvatar
                      name={entry.name}
                      size={idx === 1 ? 52 : 40}
                      className={cn(isMe && 'ring-2 ring-primary ring-offset-1 ring-offset-background')}
                    />
                    <span className="absolute -top-2 -right-2 text-base">{MEDAL_EMOJI[podiumIdx]}</span>
                  </div>
                  <div className={cn(
                    'w-full rounded-t-[0.875rem] flex flex-col items-center justify-end pb-3',
                    heights[podiumIdx],
                    idx === 1 ? 'bg-[hsl(36_80%_58%/0.15)] border border-[hsl(36_80%_58%/0.3)]' : 'liquid-glass'
                  )}>
                    <p className="text-[11px] font-bold text-foreground truncate px-2 text-center max-w-full">
                      {entry.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] font-bold text-primary tabular-nums">{entry.weeklyXp} XP</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div className="liquid-glass-heavy p-2">
            {board.map((entry, i) => {
              const isMe = entry.userId === 'me';
              const rank = i + 1;
              const level = getLevelForXP(entry.weeklyXp * 8);

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[0.875rem] transition-all',
                    isMe ? 'bg-primary/6 border border-primary/20' : 'hover:bg-muted/20'
                  )}
                >
                  {/* Rank */}
                  <div className="w-7 text-center shrink-0">
                    {rank <= 3 ? (
                      <span className="text-base">{MEDAL_EMOJI[rank - 1]}</span>
                    ) : (
                      <span className={cn('text-[12px] font-bold tabular-nums', isMe ? 'text-primary' : 'text-muted-foreground/50')}>
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <GradientAvatar
                    name={entry.name}
                    size={34}
                    className={cn(isMe && 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background')}
                  />

                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-semibold truncate', isMe ? 'text-primary' : 'text-foreground')}>
                      {isMe ? `${entry.name} (you)` : entry.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{level.emoji} {level.title}</p>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Flame size={11} className="text-[hsl(36_80%_58%)]" />
                    <span className="text-[10px] text-muted-foreground tabular-nums">{entry.streak}</span>
                  </div>

                  {/* XP */}
                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-bold text-primary tabular-nums">{entry.weeklyXp}</p>
                    <p className="text-[9px] text-muted-foreground">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
