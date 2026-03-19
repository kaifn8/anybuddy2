import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryEmoji, CategoryIcon } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { BlueTick } from '@/components/ui/BlueTick';
import { VerificationCard } from '@/components/profile/VerificationCard';
import { getLevelForXP, getNextLevel, getXPProgress } from '@/types/gamification';
import { cn } from '@/lib/utils';

import { AppIcon } from '@/components/icons/AppIcon';
import type { Badge, Request } from '@/types/anybuddy';

const badgeConfig: Record<Badge, { emoji: string; label: string }> = {
  verified_host:  { emoji: '🔵', label: 'Verified Host'  },
  top_host:       { emoji: '🏆', label: 'Top Host'       },
  trusted_member: { emoji: '🛡️', label: 'Trusted'       },
  early_adopter:  { emoji: '⭐', label: 'Early Adopter'  },
  streak_7:       { emoji: '🔥', label: '7-Day Streak'   },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: rawUser, myRequests, requests } = useAppStore();
  const { xp, streak, unlockedAchievements } = useGamificationStore();

  const pageRef  = useRef<HTMLDivElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);

  const user = rawUser ? {
    ...rawUser,
    badges:     rawUser.badges     || [],
    interests:  rawUser.interests  || [],
    savedPlans: rawUser.savedPlans || [],
  } : null;

  const level       = user ? getLevelForXP(xp) : null;
  const nextLevel   = user ? getNextLevel(xp) : null;
  const xpPct       = user ? getXPProgress(xp) : 0;
  const xpIntoLevel = (nextLevel && level) ? xp - level.xpRequired : 0;
  const xpNeeded    = (nextLevel && level) ? nextLevel.xpRequired - level.xpRequired : 1;

  useEffect(() => {
    if (!user || !pageRef.current) return;
    const sections = Array.from(pageRef.current.children);
    gsap.fromTo(sections,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out', clearProps: 'transform' }
    );
    if (xpBarRef.current) {
      gsap.fromTo(xpBarRef.current,
        { width: '0%' },
        { width: `${xpPct}%`, duration: 1.1, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-5">
              <AppIcon name="fc:businessman" size={32} className="opacity-50" />
            </div>
            <p className="text-[16px] font-bold text-foreground mb-1.5 tracking-tight">Sign in to view your profile</p>
            <p className="text-sm text-muted-foreground mb-6">Your plans, badges, and stats</p>
            <Button onClick={() => navigate('/signup')} className="h-11 px-8">Sign In</Button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  const totalJoins      = user.meetupsAttended + user.completedJoins;
  const newAchievements = unlockedAchievements.filter(a => !a.seen).length;
  const pastMeetups     = requests.filter(r => r.status === 'completed' && r.participants.some(p => p.id === user.id));
  const verifiedStatus  = user.verificationStatus || 'unverified';
  const streakAlive     = streak.lastActiveDate === new Date().toISOString().split('T')[0];
  const recentActivity  = [
    ...myRequests.slice(0, 2).map(r => ({ req: r, tag: 'Hosted' as const })),
    ...pastMeetups.slice(0, 2).map(r => ({ req: r, tag: 'Attended' as const })),
  ];

  return (
    <>
      <div className="mobile-container min-h-screen bg-background pb-28">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-40" style={{
          background: 'hsla(var(--glass-bg) / 0.4)',
          backdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur-heavy)) saturate(220%)',
          borderBottom: '0.5px solid hsla(var(--glass-border) / 0.4)',
        }}>
          <div className="flex items-center justify-between h-[48px] px-4">
            <span className="text-[17px] font-bold text-foreground tracking-tight">Profile</span>
            <button onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center tap-scale">
              <AppIcon name="fc:settings" size={17} />
            </button>
          </div>
        </header>

        {/* ── Sections ── */}
        <div ref={pageRef} className="px-4 pt-5 space-y-4 pb-2">

          {/* 1. Identity */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <GradientAvatar name={user.firstName} size={72} />
              {verifiedStatus === 'verified' && (
                <BlueTick size={18} className="absolute -bottom-0.5 -right-0.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[22px] font-bold tracking-tight text-foreground">{user.firstName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <TrustBadge level={user.trustLevel} size="sm" />
                {user.city && (
                  <>
                    <span className="text-[10px] text-muted-foreground/30">·</span>
                    <span className="text-[11px] text-muted-foreground/50">{user.zone || user.city}</span>
                  </>
                )}
              </div>
              {user.bio && (
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{user.bio}</p>
              )}
            </div>
          </div>

          {/* 2. Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: `${user.reliabilityScore}%`, label: 'Show-up',  color: 'text-success'    },
              { value: totalJoins,                   label: 'Plans',    color: 'text-foreground' },
              { value: user.meetupsHosted,            label: 'Hosted',  color: 'text-foreground' },
            ].map((s, i) => (
              <div key={i} className="liquid-glass rounded-[0.875rem] py-3 text-center">
                <p className={cn('text-[17px] font-bold tabular-nums', s.color)}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 3. XP + Level */}
          <div className="liquid-glass rounded-[1rem] px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">{level?.emoji}</span>
                <div>
                  <p className="text-[13px] font-bold text-foreground tracking-tight">{level?.title}</p>
                  <p className="text-[10px] text-muted-foreground/50">Level {level?.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-bold text-foreground">{xp} <span className="text-muted-foreground/40 font-normal text-[10px]">XP</span></p>
                {nextLevel && (
                  <p className="text-[10px] text-muted-foreground/40">{xpIntoLevel}/{xpNeeded} to {nextLevel.title}</p>
                )}
              </div>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'hsla(var(--muted) / 0.4)' }}>
              <div
                ref={xpBarRef}
                className="h-full rounded-full"
                style={{
                  width: '0%',
                  background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))',
                  boxShadow: '0 0 8px hsl(var(--primary) / 0.35)',
                }}
              />
            </div>
          </div>

          {/* 4. Streak */}
          {streak.count > 0 && (
            <button
              onClick={() => navigate('/quests')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] tap-scale text-left"
              style={{
                background: streakAlive ? 'hsl(var(--accent) / 0.08)' : 'hsla(var(--muted) / 0.3)',
                border: `0.5px solid ${streakAlive ? 'hsl(var(--accent) / 0.25)' : 'hsla(var(--border) / 0.3)'}`,
              }}>
              <AppIcon name="se:fire" size={20} className={streakAlive ? '' : 'grayscale opacity-30'} />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-foreground">{streak.count}-day streak</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  {streakAlive ? 'Active today · Keep it up' : 'Complete a plan today to keep it'}
                </p>
              </div>
              {!streakAlive && <span className="text-[10px] font-bold text-destructive shrink-0">At risk</span>}
              {streakAlive && <span className="text-muted-foreground/30 text-sm shrink-0">›</span>}
            </button>
          )}

          {/* 5. Quick links */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: 'fc:todo-list' as const,      label: 'Quests',         path: '/quests',      badge: newAchievements },
              { icon: 'fc:statistics' as const,     label: 'Leaderboard',    path: '/leaderboard', badge: 0               },
              { icon: 'fc:money-transfer' as const, label: `Credits · ${user.credits}`, path: '/credits', badge: 0        },
              { icon: 'fc:invite' as const,         label: 'Invite & Earn',  path: '/invite',      badge: 0               },
            ].map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="liquid-glass-interactive flex items-center gap-2.5 px-3.5 py-3 text-left relative overflow-hidden">
                {item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
                <AppIcon name={item.icon} size={22} className="shrink-0" />
                <p className="text-[12px] font-bold text-foreground tracking-tight truncate">{item.label}</p>
              </button>
            ))}
          </div>

          {/* 6. Interests */}
          {user.interests.length > 0 && (
            <div>
              <p className="section-label mb-2">Into</p>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((i) => (
                  <span key={i}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium liquid-glass rounded-full text-muted-foreground">
                    <CategoryIcon category={i} size="sm" className="!w-4 !h-4 !rounded-md bg-transparent" />
                    <span className="capitalize">{i}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 7. Badges */}
          {user.badges.length > 0 && (
            <div>
              <p className="section-label mb-2">Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {user.badges.map((badge) => {
                  const cfg = badgeConfig[badge];
                  if (!cfg) return null;
                  return (
                    <span key={badge}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full"
                      style={{ background: 'hsl(var(--primary) / 0.08)', color: 'hsl(var(--primary))' }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. Verification */}
          <VerificationCard />

          {/* 9. Recent activity */}
          {recentActivity.length > 0 && (
            <div>
              <p className="section-label mb-2">Recent</p>
              <div className="space-y-1.5">
                {recentActivity.map(({ req, tag }) => (
                  <button key={req.id + tag} onClick={() => navigate(`/request/${req.id}`)}
                    className="w-full liquid-glass-interactive flex items-center gap-3 p-3 text-left">
                    <CategoryIcon category={req.category} size="sm" className="shrink-0 !w-7 !h-7 liquid-glass" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">{req.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">📍 {req.location.name}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: tag === 'Hosted' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--success) / 0.1)',
                        color:      tag === 'Hosted' ? 'hsl(var(--primary))'        : 'hsl(var(--success))',
                      }}>
                      {tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentActivity.length === 0 && user.badges.length === 0 && (
            <div className="text-center py-10">
              <p className="text-[14px] font-semibold text-foreground mb-1 tracking-tight">Nothing yet</p>
              <p className="text-[13px] text-muted-foreground mb-5">Join a plan to fill your profile</p>
              <Button onClick={() => navigate('/home')} variant="secondary" size="sm">Browse plans</Button>
            </div>
          )}

        </div>
      </div>
      <BottomNav />
    </>
  );
}
