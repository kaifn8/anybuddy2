import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { format } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowUpRight, User, Gift, Trophy, Shield, BadgeCheck, Star, Flame, CheckCircle, AlertTriangle, Sparkles, FolderOpen, type LucideIcon } from 'lucide-react';
import type { Badge, Request, TrustLevel } from '@/types/anybuddy';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { VerificationCard } from '@/components/profile/VerificationCard';
import { cn } from '@/lib/utils';

const TRUST_PROGRESSION: { level: TrustLevel; label: string; icon: LucideIcon; requirement: string; joinsNeeded: number }[] = [
  { level: 'seed', label: 'New', icon: Sparkles, requirement: 'Just getting started', joinsNeeded: 0 },
  { level: 'solid', label: 'Solid', icon: Shield, requirement: '3 plans completed', joinsNeeded: 3 },
  { level: 'trusted', label: 'Trusted', icon: Star, requirement: '10 plans + 85% reliability', joinsNeeded: 10 },
  { level: 'anchor', label: 'Star', icon: Trophy, requirement: '25 plans + 95% reliability', joinsNeeded: 25 },
];

function TrustProgressionCard({ trustLevel, completedJoins, reliabilityScore }: { trustLevel: TrustLevel; completedJoins: number; reliabilityScore: number }) {
  const currentIndex = TRUST_PROGRESSION.findIndex(t => t.level === trustLevel);
  const nextLevel = currentIndex < TRUST_PROGRESSION.length - 1 ? TRUST_PROGRESSION[currentIndex + 1] : null;
  const current = TRUST_PROGRESSION[currentIndex];
  const CurrentIcon = current.icon;
  
  const progressToNext = nextLevel 
    ? Math.min(100, (completedJoins / nextLevel.joinsNeeded) * 100)
    : 100;

  return (
    <div className="liquid-glass-heavy p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center" style={{ borderRadius: '0.75rem' }}>
            <CurrentIcon size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-foreground tracking-tight">{current.label} member</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{current.requirement}</p>
          </div>
        </div>
        {nextLevel && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Next: {nextLevel.label}</p>
            <p className="text-[11px] text-primary font-bold">{nextLevel.joinsNeeded - completedJoins} more</p>
          </div>
        )}
      </div>
      
      {nextLevel && (
        <div className="space-y-2">
          <div className="w-full h-[5px] rounded-full overflow-hidden bg-muted/40">
            <div 
              className="h-full rounded-full transition-all duration-700"
              style={{ 
                width: `${progressToNext}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))'
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center font-medium">
            {nextLevel.level === 'trusted' && reliabilityScore < 85 
              ? `Need ${85 - reliabilityScore}% more reliability`
              : nextLevel.level === 'anchor' && reliabilityScore < 95
              ? `Need ${95 - reliabilityScore}% more reliability`
              : `${Math.round(progressToNext)}% to ${nextLevel.label}`}
          </p>
        </div>
      )}
      
      {!nextLevel && (
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-[0.875rem] bg-primary/6" style={{ borderRadius: '0.875rem' }}>
          <Trophy size={14} className="text-primary" />
          <p className="text-[12px] text-primary font-semibold">Max level reached — you get the best rates.</p>
        </div>
      )}
    </div>
  );
}

const badgeConfig: Record<Badge, { icon: LucideIcon; label: string }> = {
  verified_host: { icon: BadgeCheck, label: 'Verified Host' },
  top_host: { icon: Trophy, label: 'Top Host' },
  trusted_member: { icon: Shield, label: 'Trusted Member' },
  early_adopter: { icon: Star, label: 'Early Adopter' },
  streak_7: { icon: Flame, label: '7-Day Streak' },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const { user: rawUser, myRequests, requests } = useAppStore();

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
            <User size={26} className="text-muted-foreground" />
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
  const stats = [
    { value: `${user.reliabilityScore}%`, label: 'Show-up rate' },
    { value: totalJoins, label: 'Plans joined' },
    { value: user.meetupsHosted, label: 'Plans hosted' },
  ];

  const activityCount = pastMeetups.length + myRequests.length + savedPlansList.length;

  return (
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="Profile" hideChat showSettings />

        <div className="px-5 pt-3 space-y-3">
          <ProfileHero user={user} joinText={joinText} stats={stats} />
          <TrustProgressionCard trustLevel={user.trustLevel} completedJoins={user.completedJoins} reliabilityScore={user.reliabilityScore} />
          <VerificationCard />

          {/* Invite nudge */}
          <button
            onClick={() => navigate('/invite')}
            className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-4 text-left"
          >
            <div className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center" style={{ borderRadius: '0.75rem' }}>
              <Gift size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-foreground tracking-tight">Bring your crew</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">3 friends = double credits</p>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground/30 shrink-0" />
          </button>

          {/* Tabs */}
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
            <div className="space-y-5 pb-2">
              {user.interests.length > 0 && (
                <Section title="Interests">
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <div key={interest} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium liquid-glass text-foreground" style={{ borderRadius: '0.75rem' }}>
                        <span>{getCategoryEmoji(interest)}</span>
                        <span>{getCategoryLabel(interest)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {user.badges.length > 0 && (
                <Section title="Badges">
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => {
                      const config = badgeConfig[badge];
                      if (!config) return null;
                      const Icon = config.icon;
                      return (
                        <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[0.75rem] bg-primary/6 text-primary liquid-glass" style={{ borderRadius: '0.75rem' }}>
                          <Icon size={13} />
                          <span>{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {user.meetupsHosted > 0 && (
                <Section title="Host Stats">
                  <div className="grid grid-cols-2 gap-2.5">
                    <StatTile
                      icon={CheckCircle}
                      label="Success rate"
                      value={`${Math.round((user.meetupsAttended / Math.max(user.meetupsHosted, 1)) * 100)}%`}
                    />
                    <StatTile icon={AlertTriangle} label="No-shows" value={String(user.noShows)} />
                  </div>
                </Section>
              )}

              {user.interests.length === 0 && user.badges.length === 0 && user.meetupsHosted === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={26} className="text-muted-foreground" />
                  </div>
                  <p className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Nothing here yet</p>
                  <p className="text-sm text-muted-foreground">Join a plan to get started</p>
                  <Button onClick={() => navigate('/home')} variant="secondary" size="sm" className="mt-5">
                    Browse plans
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Activity ── */}
          {activeTab === 'activity' && (
            <div className="space-y-5 pb-2">
              <Section title="Past Meetups">
                {pastMeetups.length > 0 ? (
                  <div className="space-y-2">
                    {pastMeetups.map((req) => (
                      <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={FolderOpen} message="No meetups yet">
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
                <EmptyState icon={FolderOpen} message="No activity yet" />
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
    <div>
      <p className="section-label mb-2.5 px-0.5">{title}</p>
      {children}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="liquid-glass flex items-center gap-3 p-3.5" style={{ borderRadius: '1rem' }}>
      <Icon size={15} className="text-muted-foreground shrink-0" />
      <div>
        <p className="text-[15px] font-bold tabular-nums text-foreground tracking-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, children }: { icon: LucideIcon; message: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-10">
      <div className="w-14 h-14 rounded-[1.125rem] liquid-glass flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {children}
    </div>
  );
}

function RequestRow({ req, onClick, subtitle }: { req: Request; onClick: () => void; subtitle?: string }) {
  return (
    <button onClick={onClick}
      className="w-full liquid-glass-interactive flex items-center gap-3 p-3.5 text-left">
      <div className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0 text-lg" style={{ borderRadius: '0.75rem' }}>
        {getCategoryEmoji(req.category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] truncate text-foreground tracking-tight">{req.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle || `${req.seatsTaken} people joined`}</p>
      </div>
      <ChevronRight size={14} className="text-muted-foreground/25 shrink-0" />
    </button>
  );
}
