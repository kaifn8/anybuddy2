import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { BlueTick } from '@/components/ui/BlueTick';
import { VerificationCard } from '@/components/profile/VerificationCard';
import { getLevelForXP } from '@/types/gamification';
import { cn } from '@/lib/utils';
import { Settings, ChevronRight, Flame, Zap } from 'lucide-react';
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

  const heroRef  = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const user = rawUser ? {
    ...rawUser,
    badges:     rawUser.badges     || [],
    interests:  rawUser.interests  || [],
    savedPlans: rawUser.savedPlans || [],
  } : null;

  useEffect(() => {
    const els = [heroRef.current, cardsRef.current].filter(Boolean);
    gsap.fromTo(els,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', clearProps: 'transform' }
    );
    if (cardsRef.current) {
      gsap.fromTo(Array.from(cardsRef.current.children),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.15, clearProps: 'transform' }
      );
    }
  }, []);

  if (!user) {
    return (
      <>
        <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">👤</span>
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

  const level        = getLevelForXP(xp);
  const nextLevel    = getLevelForXP(xp + 1);
  const xpIntoLevel  = xp - level.minXP;
  const xpNeeded     = level.maxXP - level.minXP;
  const xpPct        = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  const joinDate     = new Date(user.createdAt);
  const joinText     = new Date().toDateString() === joinDate.toDateString()
    ? 'Today' : format(joinDate, 'MMM yyyy');

  const totalJoins       = user.meetupsAttended + user.completedJoins;
  const newAchievements  = unlockedAchievements.filter(a => !a.seen).length;
  const pastMeetups      = requests.filter(r => r.status === 'completed' && r.participants.some(p => p.id === user.id));
  const savedPlansList   = user.savedPlans.map(id => requests.find(r => r.id === id)).filter(Boolean) as Request[];
  const verifiedStatus   = user.verificationStatus || 'unverified';

  const streakAlive = streak.lastActiveDate === new Date().toISOString().split('T')[0];

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
              <Settings size={15} className="text-muted-foreground" />
            </button>
          </div>
        </header>

        <div className="px-4 pt-4 space-y-3">

          {/* ── Hero card ── */}
          <div ref={heroRef} className="liquid-glass-heavy p-5">
            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <GradientAvatar name={user.firstName} size={68} />
                {verifiedStatus === 'verified' && (
                  <BlueTick size={18} className="absolute -bottom-0.5 -right-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[20px] font-bold tracking-tight text-foreground leading-tight">{user.firstName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TrustBadge level={user.trustLevel} size="sm" />
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground/60">📍 {user.zone ? `${user.zone}` : user.city}</span>
                </div>
                {user.bio && (
                  <p className="text-[12px] mt-1.5 leading-relaxed text-muted-foreground line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap size={11} className="text-accent" />
                  <span className="text-[11px] font-bold text-accent">{level.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-medium">
                  {xpIntoLevel} / {xpNeeded} XP
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.4)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${xpPct}%`,
                    background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))',
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { value: `${user.reliabilityScore}%`, label: 'Show-up',   color: 'text-success'     },
                { value: totalJoins,                   label: 'Joined',    color: 'text-foreground'  },
                { value: user.meetupsHosted,            label: 'Hosted',    color: 'text-foreground'  },
                { value: user.hostRating ? `${user.hostRating}★` : '—', label: 'Rating', color: 'text-accent' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={cn('text-[15px] font-bold tabular-nums', s.color)}>{s.value}</p>
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Streak pill */}
            {streak.count > 0 && (
              <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-[0.75rem]"
                style={{ background: streakAlive ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--muted) / 0.3)' }}>
                <div className="flex items-center gap-2">
                  <Flame size={14} className={streakAlive ? 'text-accent' : 'text-muted-foreground/40'} />
                  <span className="text-[12px] font-bold text-foreground">{streak.count}-day streak</span>
                </div>
                {!streakAlive && (
                  <span className="text-[10px] text-destructive font-semibold">At risk!</span>
                )}
                {streakAlive && (
                  <span className="text-[10px] text-accent font-semibold">🔥 Keep going</span>
                )}
              </div>
            )}

            {/* Interests */}
            {user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {user.interests.map((i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium liquid-glass rounded-full text-muted-foreground">
                    {getCategoryEmoji(i)} {getCategoryLabel(i)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick actions ── */}
          <div ref={cardsRef} className="grid grid-cols-2 gap-2">
            {[
              { emoji: '⚡', label: 'Daily Quests',   sub: 'XP + credits',        path: '/quests',      badge: newAchievements },
              { emoji: '🏆', label: 'Leaderboard',    sub: 'Your weekly rank',     path: '/leaderboard', badge: 0               },
              { emoji: '💳', label: 'Credits',         sub: `${user.credits} pts`, path: '/credits',     badge: 0               },
              { emoji: '🎁', label: 'Invite Friends',  sub: 'Earn credits',        path: '/invite',      badge: 0               },
            ].map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="liquid-glass-interactive flex items-center gap-2.5 px-3.5 py-3.5 text-left relative overflow-hidden">
                {item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
                <span className="text-[18px]">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-foreground tracking-tight truncate">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* ── Badges ── */}
          {user.badges.length > 0 && (
            <div className="liquid-glass-heavy p-4">
              <h3 className="section-label mb-3">Badges</h3>
              <div className="flex flex-wrap gap-2">
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

          {/* ── Verification ── */}
          <VerificationCard />

          {/* ── Activity ── */}
          {(myRequests.length > 0 || pastMeetups.length > 0 || savedPlansList.length > 0) && (
            <div className="liquid-glass-heavy p-4">
              <h3 className="section-label mb-3">Activity</h3>
              <div className="space-y-1.5">
                {[
                  ...myRequests.slice(0, 3).map(r => ({ req: r, tag: 'Hosted' })),
                  ...pastMeetups.slice(0, 3).map(r => ({ req: r, tag: 'Attended' })),
                  ...savedPlansList.slice(0, 2).map(r => ({ req: r, tag: 'Saved' })),
                ].map(({ req, tag }) => (
                  <button key={req.id + tag} onClick={() => navigate(`/request/${req.id}`)}
                    className="w-full liquid-glass-interactive flex items-center gap-3 p-3 text-left">
                    <span className="text-base shrink-0">{getCategoryEmoji(req.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">{req.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">📍 {req.location.name}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: tag === 'Hosted'
                          ? 'hsl(var(--primary) / 0.1)'
                          : tag === 'Attended'
                            ? 'hsl(var(--success) / 0.1)'
                            : 'hsl(var(--muted) / 0.4)',
                        color: tag === 'Hosted'
                          ? 'hsl(var(--primary))'
                          : tag === 'Attended'
                            ? 'hsl(var(--success))'
                            : 'hsl(var(--muted-foreground))',
                      }}>
                      {tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {myRequests.length === 0 && pastMeetups.length === 0 && user.badges.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-[14px] font-semibold text-foreground mb-1.5 tracking-tight">Get started</p>
              <p className="text-sm text-muted-foreground mb-5">Join a plan to build your profile</p>
              <Button onClick={() => navigate('/home')} variant="secondary" size="sm">Browse plans</Button>
            </div>
          )}

        </div>
      </div>
      <BottomNav />
    </>
  );
}
