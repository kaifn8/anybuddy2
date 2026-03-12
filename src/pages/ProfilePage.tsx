import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { format } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Share2, ChevronRight, ArrowUpRight } from 'lucide-react';
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
    <div className="relative overflow-hidden" style={{
      borderRadius: '22px',
      background: 'linear-gradient(160deg, hsl(230 25% 8%), hsl(250 28% 13%), hsl(265 30% 15%))',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-15" style={{
        background: 'radial-gradient(circle, hsl(260 80% 65% / 0.4) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }} />
      
      <div className="relative z-10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl" style={{
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              {current.emoji}
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{current.label} member</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{current.requirement}</p>
            </div>
          </div>
          {nextLevel && (
            <div className="text-right">
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Next: {nextLevel.emoji} {nextLevel.label}</p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: 'hsl(250 85% 72%)' }}>{nextLevel.joinsNeeded - completedJoins} more</p>
            </div>
          )}
        </div>
        
        {nextLevel && (
          <div className="space-y-2">
            <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${progressToNext}%`,
                  background: 'linear-gradient(90deg, hsl(250 85% 60%), hsl(210 90% 58%), hsl(250 85% 65%))',
                  boxShadow: '0 0 12px hsl(250 85% 60% / 0.3)',
                }}
              />
            </div>
            <p className="text-[9.5px] text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {nextLevel.level === 'trusted' && reliabilityScore < 85 
                ? `Need ${85 - reliabilityScore}% more reliability`
                : nextLevel.level === 'anchor' && reliabilityScore < 95
                ? `Need ${95 - reliabilityScore}% more reliability`
                : `${Math.round(progressToNext)}% to ${nextLevel.label}`}
            </p>
          </div>
        )}
        
        {!nextLevel && (
          <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span className="text-sm">🏆</span>
            <p className="text-[11px] font-semibold" style={{ color: 'hsl(250 85% 72%)' }}>Max level. You get the best rates.</p>
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
    <>
      <div className="mobile-container min-h-screen bg-ambient pb-28">
        <TopBar title="Profile" hideChat showSettings />

        <div className="px-4 pt-2 space-y-3.5">
          {/* Hero */}
          <ProfileHero user={user} joinText={joinText} stats={stats} />

          {/* Trust progression — dark card */}
          <TrustProgressionCard trustLevel={user.trustLevel} completedJoins={user.completedJoins} reliabilityScore={user.reliabilityScore} />

          {/* Selfie verification */}
          <VerificationCard />

          {/* Invite nudge — dark card */}
          <button
            onClick={() => navigate('/invite')}
            className="w-full flex items-center gap-3.5 px-5 py-4 tap-scale text-left"
            style={{
              borderRadius: '22px',
              background: 'linear-gradient(160deg, hsl(230 25% 8%), hsl(248 28% 12%))',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>🎁</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Bring your crew</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>3 friends = double credits 🔥</p>
            </div>
            <ArrowUpRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} className="shrink-0" />
          </button>

          {/* Tabs */}
          <div className="flex gap-1 p-1" style={{
            borderRadius: '18px',
            background: 'rgba(0,0,0,0.04)',
          }}>
            {(['overview', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-[12px] font-semibold transition-all tap-scale capitalize',
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                style={activeTab === tab ? {
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
                } : { borderRadius: '14px' }}
              >
                {tab}
                {tab === 'activity' && activityCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                    style={{ background: 'hsl(250 85% 60% / 0.12)', color: 'hsl(250 85% 60%)' }}>
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
                      <div key={interest} className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium" style={{
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.75)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
                      }}>
                        <span>{getCategoryEmoji(interest)}</span>
                        <span className="text-foreground">{getCategoryLabel(interest)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {user.badges.length > 0 && (
                <Section title="Badges">
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => (
                      <div key={badge} className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold" style={{
                        borderRadius: '14px',
                        background: 'linear-gradient(160deg, hsl(230 25% 8%), hsl(250 28% 13%))',
                        color: 'rgba(255,255,255,0.85)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      }}>
                        <span>{badgeLabels[badge]?.emoji}</span>
                        <span>{badgeLabels[badge]?.label}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {user.meetupsHosted > 0 && (
                <Section title="Host Stats">
                  <div className="grid grid-cols-2 gap-2.5">
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
                <div className="text-center py-12">
                  <span className="text-4xl block mb-3">🌱</span>
                  <p className="text-sm font-medium text-foreground mb-1">Nothing here yet</p>
                  <p className="text-xs text-muted-foreground">Join a plan to get started</p>
                  <Button onClick={() => navigate('/home')} variant="secondary" size="sm" className="mt-4">
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
      </div>
      <BottomNav />
    </>
  );
}

/* ── Local sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2.5 px-1">{title}</p>
      {children}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5" style={{
      borderRadius: '18px',
      background: 'rgba(255,255,255,0.75)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
    }}>
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[15px] font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ emoji, message, children }: { emoji: string; message: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-10">
      <span className="text-3xl block mb-2">{emoji}</span>
      <p className="text-xs text-muted-foreground mb-3">{message}</p>
      {children}
    </div>
  );
}

function RequestRow({ req, onClick, subtitle }: { req: Request; onClick: () => void; subtitle?: string }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3.5 p-3.5 text-left tap-scale transition-all group"
      style={{
        borderRadius: '18px',
        background: 'rgba(255,255,255,0.75)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{
        background: 'rgba(0,0,0,0.03)',
      }}>
        {getCategoryEmoji(req.category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] truncate group-hover:text-primary transition-colors text-foreground">{req.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle || `${req.seatsTaken} people joined`}</p>
      </div>
      <ChevronRight size={15} className="text-muted-foreground/25 shrink-0" />
    </button>
  );
}
