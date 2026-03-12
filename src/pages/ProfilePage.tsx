import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { format } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Share2, ChevronRight } from 'lucide-react';
import type { Badge, Request, TrustLevel } from '@/types/anybuddy';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { VerificationCard } from '@/components/profile/VerificationCard';
import { cn } from '@/lib/utils';

const TRUST_PROGRESSION: { level: TrustLevel; label: string; emoji: string; requirement: string; joinsNeeded: number }[] = [
  { level: 'seed', label: 'New', emoji: '🌱', requirement: 'Just getting started', joinsNeeded: 0 },
  { level: 'solid', label: 'Solid', emoji: '🪨', requirement: '3 plans completed', joinsNeeded: 3 },
  { level: 'trusted', label: 'Trusted', emoji: '⭐', requirement: '10 plans + 85% reliability', joinsNeeded: 10 },
  { level: 'anchor', label: 'Star', emoji: '👑', requirement: '25 plans + 95% reliability', joinsNeeded: 25 },
];

function TrustProgressionCard({ trustLevel, completedJoins, reliabilityScore }: { trustLevel: TrustLevel; completedJoins: number; reliabilityScore: number }) {
  const currentIndex = TRUST_PROGRESSION.findIndex(t => t.level === trustLevel);
  const nextLevel = currentIndex < TRUST_PROGRESSION.length - 1 ? TRUST_PROGRESSION[currentIndex + 1] : null;
  const current = TRUST_PROGRESSION[currentIndex];
  
  const progressToNext = nextLevel 
    ? Math.min(100, (completedJoins / nextLevel.joinsNeeded) * 100)
    : 100;

  return (
    <div className="rounded-2xl overflow-hidden border border-border/30 bg-background/60 backdrop-blur-sm">
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{current.emoji}</span>
            <div>
              <p className="text-[13px] font-bold text-foreground">{current.label} member</p>
              <p className="text-[10px] text-muted-foreground">{current.requirement}</p>
            </div>
          </div>
          {nextLevel && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Next: {nextLevel.emoji} {nextLevel.label}</p>
              <p className="text-[10px] text-primary font-semibold">{nextLevel.joinsNeeded - completedJoins} more plans</p>
            </div>
          )}
        </div>
        
        {nextLevel && (
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground text-center">
              {nextLevel.level === 'trusted' && reliabilityScore < 85 
                ? `Need ${85 - reliabilityScore}% more reliability`
                : nextLevel.level === 'anchor' && reliabilityScore < 95
                ? `Need ${95 - reliabilityScore}% more reliability`
                : `${Math.round(progressToNext)}% to ${nextLevel.label}`}
            </p>
          </div>
        )}
        
        {!nextLevel && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/[0.06] border border-primary/15">
            <span className="text-sm">🏆</span>
            <p className="text-[11px] text-primary font-semibold">You're in the top tier — enjoy priority access</p>
          </div>
        )}
      </div>
    </div>
  );
}

const badgeLabels: Record<Badge, { emoji: string; label: string }> = {
  verified_host: { emoji: '✅', label: 'Verified Host' },
  top_host: { emoji: '🏆', label: 'Top Host' },
  trusted_member: { emoji: '🛡️', label: 'Trusted Member' },
  early_adopter: { emoji: '🌟', label: 'Early Adopter' },
  streak_7: { emoji: '🔥', label: '7-Day Streak' },
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
          <span className="text-5xl block mb-4">👤</span>
          <p className="text-sm text-muted-foreground mb-5">Sign in to view your profile</p>
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
    <div className="mobile-container min-h-screen bg-ambient pb-28">
      <TopBar title="Profile" hideChat showSettings />

      <div className="px-4 pt-3 space-y-3">
        {/* Hero — avatar, name, verification, location, join date + stats */}
        <ProfileHero
          user={user}
          joinText={joinText}
          stats={stats}
        />

        {/* Trust progression */}
        <TrustProgressionCard trustLevel={user.trustLevel} completedJoins={user.completedJoins} reliabilityScore={user.reliabilityScore} />

        {/* Selfie verification card */}
        <VerificationCard />

        {/* Invite nudge — slim */}
        <button
          onClick={() => navigate('/invite')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl tap-scale text-left border border-primary/15 bg-primary/[0.04] backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-base">🎁</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Bring your crew</p>
            <p className="text-[10px] text-muted-foreground">3 friends = double credits 🔥</p>
          </div>
          <Share2 size={15} className="text-primary shrink-0" />
        </button>

        {/* Custom pill tabs */}
        <div className="flex gap-1.5 bg-muted/40 p-1 rounded-2xl">
          {(['overview', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 text-xs font-semibold rounded-xl transition-all tap-scale capitalize',
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
              {tab === 'activity' && activityCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold">
                  {activityCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pb-2">
            {/* Interests */}
            {user.interests.length > 0 && (
              <Section title="Interests">
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <div key={interest} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-background/70 border border-border/30 backdrop-blur-sm">
                      <span>{getCategoryEmoji(interest)}</span>
                      <span>{getCategoryLabel(interest)}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Badges */}
            {user.badges.length > 0 && (
              <Section title="Badges">
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge) => (
                    <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/10 border border-accent/20">
                      <span>{badgeLabels[badge]?.emoji}</span>
                      <span>{badgeLabels[badge]?.label}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Host performance */}
            {user.meetupsHosted > 0 && (
              <Section title="Host Stats">
                <div className="grid grid-cols-2 gap-2">
                  <StatTile
                    icon="✅"
                    label="Success rate"
                    value={`${Math.round((user.meetupsAttended / Math.max(user.meetupsHosted, 1)) * 100)}%`}
                  />
                  <StatTile icon="⚠️" label="No-shows" value={String(user.noShows)} />
                </div>
              </Section>
            )}

            {user.interests.length === 0 && user.badges.length === 0 && user.meetupsHosted === 0 && (
              <div className="text-center py-10">
                <span className="text-4xl block mb-3">🌱</span>
                <p className="text-sm font-medium text-foreground mb-1">Your profile is empty — people can't trust you yet</p>
                <p className="text-xs text-muted-foreground">Join 1 plan to start building your reputation</p>
                <Button onClick={() => navigate('/home')} variant="secondary" size="sm" className="mt-4">
                  Find a plan nearby
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Activity ── */}
        {activeTab === 'activity' && (
          <div className="space-y-4 pb-2">
            {/* Past Meetups */}
            <Section title="Past Meetups">
              {pastMeetups.length > 0 ? (
                <div className="space-y-2">
                  {pastMeetups.map((req) => (
                    <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)} />
                  ))}
                </div>
              ) : (
                <EmptyState emoji="📭" message="No meetups yet">
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
                      subtitle={`📍 ${req.location.name} · ${req.seatsTaken}/${req.seatsTotal} spots`} />
                  ))}
                </div>
              </Section>
            )}

            {activityCount === 0 && (
              <EmptyState emoji="🗂️" message="No activity yet" />
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

/* ── Local sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-0.5">{title}</p>
      {children}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-background/60 border border-border/30 backdrop-blur-sm">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-sm font-bold tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ emoji, message, children }: { emoji: string; message: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-8">
      <span className="text-3xl block mb-2">{emoji}</span>
      <p className="text-xs text-muted-foreground mb-3">{message}</p>
      {children}
    </div>
  );
}

function RequestRow({ req, onClick, subtitle }: { req: Request; onClick: () => void; subtitle?: string }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-2xl text-left tap-scale bg-background/60 backdrop-blur-sm border border-border/30 hover:border-border/60 transition-all group">
      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 text-lg">
        {getCategoryEmoji(req.category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] truncate group-hover:text-primary transition-colors">{req.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle || `${req.seatsTaken} people joined`}</p>
      </div>
      <ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
    </button>
  );
}
