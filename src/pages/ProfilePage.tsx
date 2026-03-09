import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { format } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Share2, ChevronRight } from 'lucide-react';
import type { Badge, Request } from '@/types/anybuddy';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileSection } from '@/components/profile/ProfileSection';

const badgeLabels: Record<Badge, { emoji: string; label: string }> = {
  verified_host: { emoji: '✅', label: 'Verified Host' },
  top_host: { emoji: '🏆', label: 'Top Host' },
  trusted_member: { emoji: '🛡️', label: 'Trusted Member' },
  early_adopter: { emoji: '🌟', label: 'Early Adopter' },
  streak_7: { emoji: '🔥', label: '7-Day Streak' },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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

  const stats = [
    { value: `${user.reliabilityScore}%`, label: 'Reliable' },
    { value: user.meetupsAttended + user.completedJoins, label: 'Joined' },
    { value: user.meetupsHosted, label: 'Hosted' },
  ];

  const hostStats = [
    { icon: '✅', label: 'Success rate', value: user.meetupsHosted > 0 ? `${Math.round((user.meetupsAttended / user.meetupsHosted) * 100)}%` : '0%' },
    { icon: '⚠️', label: 'No-shows', value: user.noShows },
  ];
  
  const activityCount = pastMeetups.length + myRequests.length + savedPlansList.length;

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar title="Profile" hideChat showSettings />
      
      <div className="px-5 pt-4 space-y-4">
        {/* Hero Card */}
        <ProfileHero
          user={user}
          joinText={joinText}
          badgeLabels={badgeLabels}
        />

        {/* Quick Stats */}
        <ProfileStats stats={stats} />

        {/* Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              Activity {activityCount > 0 && <span className="ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">{activityCount}</span>}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Invite Card - compact */}
            <button onClick={() => navigate('/invite')}
              className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.04] backdrop-blur-sm p-3.5 tap-scale text-left w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">👋</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Invite friends • 3 left</p>
                  <p className="text-2xs text-muted-foreground mt-0.5">More friends = more plans nearby</p>
                </div>
                <Share2 size={16} className="text-primary shrink-0" />
              </div>
            </button>

            {/* Interests */}
            {user.interests.length > 0 && (
              <ProfileSection title="Interests">
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <div key={interest} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-background/60 backdrop-blur-sm border border-border/40">
                      <span className="text-sm">{getCategoryEmoji(interest)}</span>
                      <span>{getCategoryLabel(interest)}</span>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Badges */}
            {user.badges.length > 0 && (
              <ProfileSection title="Badges">
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge) => (
                    <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/10 border border-accent/20">
                      <span className="text-sm">{badgeLabels[badge]?.emoji}</span>
                      <span>{badgeLabels[badge]?.label}</span>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Host Performance - moved here */}
            {user.meetupsHosted > 0 && (
              <ProfileSection title="Host Performance">
                <div className="space-y-0">
                  {hostStats.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-b-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="text-sm">{s.icon}</span>
                        <span>{s.label}</span>
                      </span>
                      <span className="text-sm font-bold tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 mt-4">
            {/* Past Meetups */}
            <ProfileSection title="Past Meetups">
              {pastMeetups.length > 0 ? (
                <div className="space-y-2">
                  {pastMeetups.map((req) => (
                    <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)} />
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No meetups yet</p>
                  <Button onClick={() => navigate('/home')} variant="secondary" size="sm">
                    Join your first plan 👇
                  </Button>
                </div>
              )}
            </ProfileSection>
            
            {/* My Requests */}
            {myRequests.length > 0 && (
              <ProfileSection title="My Requests" action="See all" onAction={() => {}}>
                <div className="space-y-2">
                  {myRequests.map((req) => (
                    <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)} subtitle={`${req.seatsTaken}/${req.seatsTotal} spots • ${req.status}`} />
                  ))}
                </div>
              </ProfileSection>
            )}
            
            {/* Saved Plans */}
            {savedPlansList.length > 0 && (
              <ProfileSection title="Saved Plans" icon="♡">
                <div className="space-y-2">
                  {savedPlansList.map((req) => (
                    <RequestRow key={req.id} req={req} onClick={() => navigate(`/request/${req.id}`)} subtitle={`📍 ${req.location.name} • ${req.seatsTaken}/${req.seatsTotal} spots`} />
                  ))}
                </div>
              </ProfileSection>
            )}

            {activityCount === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">📭</span>
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom spacer */}
        <div className="h-2" />
      </div>
      
      <BottomNav />
    </div>
  );
}

/* Shared request row component */
function RequestRow({ req, onClick, subtitle }: { req: Request; onClick: () => void; subtitle?: string }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left tap-scale bg-background/50 backdrop-blur-sm border border-border/30 hover:border-border/60 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
        <span className="text-lg">{getCategoryEmoji(req.category)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] truncate group-hover:text-primary transition-colors">{req.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {subtitle || `${req.seatsTaken} people joined`}
        </p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
    </button>
  );
}
