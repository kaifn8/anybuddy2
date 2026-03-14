import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { format } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { BlueTick } from '@/components/ui/BlueTick';
import { VerificationCard } from '@/components/profile/VerificationCard';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import { cn } from '@/lib/utils';
import type { Badge, Request, TrustLevel, VerificationStatus } from '@/types/anybuddy';

const TRUST_PROGRESSION: { level: TrustLevel; label: string; emoji: string; joinsNeeded: number }[] = [
  { level: 'seed', label: 'New', emoji: '✨', joinsNeeded: 0 },
  { level: 'solid', label: 'Solid', emoji: '🛡️', joinsNeeded: 3 },
  { level: 'trusted', label: 'Trusted', emoji: '⭐', joinsNeeded: 10 },
  { level: 'anchor', label: 'Star', emoji: '🏆', joinsNeeded: 25 },
];

const badgeConfig: Record<Badge, { emoji: string; label: string }> = {
  verified_host: { emoji: '🔵', label: 'Verified Host' },
  top_host: { emoji: '🏆', label: 'Top Host' },
  trusted_member: { emoji: '🛡️', label: 'Trusted Member' },
  early_adopter: { emoji: '⭐', label: 'Early Adopter' },
  streak_7: { emoji: '🔥', label: '7-Day Streak' },
};

function VerificationPill({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        🛡️ <BlueTick size={12} /> Verified
      </span>
    );
  }
  if (status === 'pending') {
    return <span className="inline-flex items-center gap-1 text-xs text-warning font-medium">⏳ Pending</span>;
  }
  return <span className="text-xs text-muted-foreground">Unverified</span>;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const { user: rawUser, myRequests, requests } = useAppStore();
  const { xp, streak, unlockedAchievements } = useGamificationStore();

  const user = rawUser ? {
    ...rawUser,
    badges: rawUser.badges || [],
    interests: rawUser.interests || [],
    savedPlans: rawUser.savedPlans || [],
  } : null;

  if (!user) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Sign in to view your profile</p>
          <p className="text-sm text-muted-foreground mb-6">Your plans, badges, and stats all in one place</p>
          <Button onClick={() => navigate('/signup')} className="h-11 px-8">Sign In</Button>
        </div>
      </div>
    );
  }

  const savedPlansList = user.savedPlans
    .map(id => requests.find(r => r.id === id))
    .filter(Boolean) as Request[];

  const pastMeetups = requests.filter(r =>
    r.status === 'completed' && r.participants.some(p => p.id === user.id)
  );

  const joinDate = new Date(user.createdAt);
  const isToday = new Date().toDateString() === joinDate.toDateString();
  const joinText = isToday ? 'Joined today' : `Joined ${format(joinDate, 'MMM yyyy')}`;

  const totalJoins = user.meetupsAttended + user.completedJoins;
  const verificationStatus: VerificationStatus = user.verificationStatus || 'unverified';
  const activityCount = pastMeetups.length + myRequests.length + savedPlansList.length;

  // Trust progression
  const currentIndex = TRUST_PROGRESSION.findIndex(t => t.level === user.trustLevel);
  const nextLevel = currentIndex < TRUST_PROGRESSION.length - 1 ? TRUST_PROGRESSION[currentIndex + 1] : null;
  const progressToNext = nextLevel ? Math.min(100, (user.completedJoins / nextLevel.joinsNeeded) * 100) : 100;

  return (
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="Profile" hideChat showSettings />

        <div className="px-5 pt-5 space-y-4">
          {/* ── Profile Card — matches host profile style ── */}
          <div className="liquid-glass-heavy p-5 text-center">
            <GradientAvatar name={user.firstName} size={80} className="mx-auto border-3 border-background text-2xl" />
            <h2 className="text-[22px] font-bold mt-3 tracking-tight text-foreground">{user.firstName}</h2>

            {user.gender && (
              <span className="text-xs text-muted-foreground capitalize mt-0.5 block">
                {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'} {user.gender}
              </span>
            )}

            <div className="flex items-center justify-center gap-2 mt-1.5">
              <TrustBadge level={user.trustLevel} size="md" />
              <VerificationPill status={verificationStatus} />
            </div>

            {user.bio && (
              <p className="text-[13px] text-center mt-3 leading-[1.65] max-w-[260px] mx-auto text-muted-foreground">{user.bio}</p>
            )}

            <div className="flex items-center justify-center gap-2 mt-2.5 text-muted-foreground/50">
              <span className="text-[11px] font-medium flex items-center gap-1">📍 {user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
              <span className="w-px h-2.5 bg-border/50" />
              <span className="text-[11px] font-medium">{joinText}</span>
            </div>
          </div>

          {/* ── Stats Grid — matches host profile 4-col ── */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: `${user.reliabilityScore}%`, label: 'Show-up' },
              { value: totalJoins, label: 'Joined' },
              { value: user.meetupsHosted, label: 'Hosted' },
              { value: user.hostRating ? `${user.hostRating}★` : '—', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i} className="liquid-glass p-2.5 text-center">
                <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Trust Progression — compact ── */}
          {nextLevel ? (
            <div className="liquid-glass p-3.5 flex items-center gap-3">
              <span className="text-lg">{TRUST_PROGRESSION[currentIndex].emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold text-foreground">{TRUST_PROGRESSION[currentIndex].label} → {nextLevel.label}</p>
                  <p className="text-[10px] text-primary font-bold">{nextLevel.joinsNeeded - user.completedJoins} more</p>
                </div>
                <div className="w-full h-[4px] rounded-full overflow-hidden bg-muted/40">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressToNext}%`,
                      background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="liquid-glass p-3.5 flex items-center gap-2.5">
              <span className="text-lg">🏆</span>
              <p className="text-[12px] text-primary font-semibold">Max level reached — you get the best rates.</p>
            </div>
          )}

          <VerificationCard />

          {/* ── Invite nudge ── */}
          <button
            onClick={() => navigate('/invite')}
            className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="text-lg">🎁</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground tracking-tight">Bring your crew</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">3 friends = double credits</p>
            </div>
            <span className="text-muted-foreground/30 shrink-0">↗</span>
          </button>

          {/* ── Tabs ── */}
          <div className="flex gap-1 p-1 rounded-[1rem] liquid-glass" style={{ borderRadius: '1rem' }}>
            {(['overview', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-xs font-semibold transition-all tap-scale capitalize',
                  activeTab === tab
                    ? 'text-foreground liquid-glass-heavy rounded-[0.75rem]'
                    : 'text-muted-foreground hover:text-foreground rounded-xl'
                )}
              >
                {tab}
                {tab === 'activity' && activityCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                    {activityCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4 pb-2">
              {user.interests.length > 0 && (
                <div className="liquid-glass-heavy p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <div key={interest} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium liquid-glass text-foreground" style={{ borderRadius: '0.75rem' }}>
                        <span>{getCategoryEmoji(interest)}</span>
                        <span>{getCategoryLabel(interest)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.badges.length > 0 && (
                <div className="liquid-glass-heavy p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => {
                      const config = badgeConfig[badge];
                      if (!config) return null;
                      return (
                        <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[0.75rem] bg-primary/6 text-primary liquid-glass" style={{ borderRadius: '0.75rem' }}>
                          <span>{config.emoji}</span>
                          <span>{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {user.meetupsHosted > 0 && (
                <div className="liquid-glass-heavy p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Host Stats</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="liquid-glass p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground tabular-nums">{Math.round((user.meetupsAttended / Math.max(user.meetupsHosted, 1)) * 100)}%</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">Success rate</p>
                    </div>
                    <div className="liquid-glass p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground tabular-nums">{user.noShows}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">No-shows</p>
                    </div>
                  </div>
                </div>
              )}

              {user.interests.length === 0 && user.badges.length === 0 && user.meetupsHosted === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <p className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Nothing here yet</p>
                  <p className="text-sm text-muted-foreground">Join a plan to get started</p>
                  <Button onClick={() => navigate('/home')} variant="secondary" size="sm" className="mt-5">Browse plans</Button>
                </div>
              )}
            </div>
          )}

          {/* ── Activity ── */}
          {activeTab === 'activity' && (
            <div className="space-y-4 pb-2">
              <Section title="Past Meetups">
                {pastMeetups.length > 0 ? (
                  <div className="space-y-2">
                    {pastMeetups.map((req) => (
                      <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState emoji="📂" message="No meetups yet">
                    <Button onClick={() => navigate('/home')} variant="secondary" size="sm">Browse plans</Button>
                  </EmptyState>
                )}
              </Section>

              {myRequests.length > 0 && (
                <Section title="My Plans">
                  <div className="space-y-2">
                    {myRequests.map((req) => (
                      <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)}
                        subtitle={`${req.seatsTaken}/${req.seatsTotal} spots · ${req.status}`} />
                    ))}
                  </div>
                </Section>
              )}

              {savedPlansList.length > 0 && (
                <Section title="Saved">
                  <div className="space-y-2">
                    {savedPlansList.map((req) => (
                      <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)}
                        subtitle={`${req.location.name} · ${req.seatsTaken}/${req.seatsTotal} spots`} />
                    ))}
                  </div>
                </Section>
              )}

              {activityCount === 0 && (
                <EmptyState emoji="📂" message="No activity yet" />
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}

/* ── Local sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="liquid-glass-heavy p-4">
      <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ emoji, message, children }: { emoji: string; message: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-10">
      <div className="w-14 h-14 rounded-[1.125rem] liquid-glass flex items-center justify-center mx-auto mb-3">
        <span className="text-xl">{emoji}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {children}
    </div>
  );
}

function RequestRow({ req, onClick, subtitle }: { req: Request; onClick: () => void; subtitle?: string }) {
  return (
    <button onClick={onClick}
      className="w-full liquid-glass-interactive flex items-center gap-3 p-3 text-left">
      <span className="text-lg">{getCategoryEmoji(req.category)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] truncate text-foreground tracking-tight">{req.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle || `${req.seatsTaken} people joined`}</p>
      </div>
      <span className="text-muted-foreground/25 shrink-0">›</span>
    </button>
  );
}
