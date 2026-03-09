import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { format, formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import type { Badge, Request } from '@/types/anybuddy';

const badgeLabels: Record<Badge, { emoji: string; label: string }> = {
  verified_host: { emoji: '✅', label: 'Verified Host' },
  top_host: { emoji: '🏆', label: 'Top Host' },
  trusted_member: { emoji: '🛡️', label: 'Trusted Member' },
  early_adopter: { emoji: '🌟', label: 'Early Adopter' },
  streak_7: { emoji: '🔥', label: '7-Day Streak' },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: rawUser, myRequests, requests, reset } = useAppStore();
  
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
          <span className="text-4xl block mb-3">👤</span>
          <p className="text-sm text-muted-foreground mb-4">Sign in to view your profile</p>
          <button onClick={() => navigate('/signup')} className="tahoe-btn-primary h-10 px-6 tap-scale">Sign In</button>
        </div>
      </div>
    );
  }

  // Saved plans
  const savedPlansList = user.savedPlans
    .map(id => requests.find(r => r.id === id))
    .filter(Boolean) as Request[];
  
  // Past meetups (completed requests the user joined)
  const pastMeetups = requests.filter(r => 
    r.status === 'completed' && r.participants.some(p => p.id === user.id)
  ).slice(0, 3);
  
  // Determine member status
  const memberStatus = user.badges.includes('early_adopter') ? '⭐ Early member' : '⭐ New member';
  
  // Format join date
  const joinDate = new Date(user.createdAt);
  const isToday = new Date().toDateString() === joinDate.toDateString();
  const joinText = isToday ? 'Joined today' : `Joined ${format(joinDate, 'MMM d, yyyy')}`;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Profile" />
      
      <div className="px-5 pt-5 space-y-5">
        {/* Profile card */}
        <div className="liquid-glass-heavy p-4 text-center rounded-3xl">
          <div className="relative inline-block">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName} className="w-20 h-20 rounded-full mx-auto border-3 border-white/40" />
            {user.isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 text-lg">✅</span>
            )}
          </div>
          <h2 className="text-title font-bold mt-3">{user.firstName}</h2>
          {user.bio && <p className="text-xs text-muted-foreground mt-1">{user.bio}</p>}
          
          {/* Member status */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mt-2">
            {memberStatus}
          </div>
          
          {/* Location and join date */}
          <div className="mt-3 space-y-0.5">
            <p className="text-[11px] text-muted-foreground/70">
              📍 {user.zone ? `${user.zone}, ${user.city}` : user.city}
            </p>
            <p className="text-[11px] text-muted-foreground/70">{joinText}</p>
          </div>
        </div>
        
        {/* Profile actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="default" className="w-full" onClick={() => navigate('/edit-profile')}>
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/invite')}>
            Invite Friends
          </Button>
        </div>
        
        {/* Invite count */}
        <div className="liquid-glass p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">🎟 Invites left</span>
          <span className="text-sm font-bold text-primary">3</span>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '⭐', label: 'Reliability', value: `${user.reliabilityScore}%` },
            { icon: '🤝', label: 'Meetups', value: user.meetupsAttended + user.completedJoins },
            { icon: '📊', label: 'Join rate', value: `${user.joinRate}%` },
            { icon: '🎉', label: 'Hosted', value: user.meetupsHosted },
          ].map((stat, i) => (
            <div key={i} className="liquid-glass p-3 text-center rounded-2xl">
              <div className="text-base mb-1">{stat.icon}</div>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="liquid-glass p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">BADGES</h3>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.map((badge) => (
                <span key={badge} className="liquid-glass-subtle flex items-center gap-1 px-2.5 py-1 text-2xs font-medium">
                  {badgeLabels[badge]?.emoji} {badgeLabels[badge]?.label}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Interests */}
        <div className="liquid-glass-heavy p-4 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground">INTERESTS</h3>
            <button className="text-[11px] text-primary font-semibold tap-scale">Edit interests</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <div key={interest} className="liquid-glass-subtle flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border/30">
                <span>{getCategoryEmoji(interest)}</span>
                <span>{getCategoryLabel(interest)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Plans */}
        {savedPlansList.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">♡ Saved Plans</h3>
            <div className="space-y-1.5">
              {savedPlansList.map((req) => req && (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="w-full flex items-center gap-3 bg-background/80 backdrop-blur-xl border border-border/50 p-4 rounded-3xl text-left tap-scale hover:bg-background/90 transition-colors"
                  style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}>
                  <span className="text-lg">{getCategoryEmoji(req.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate">{req.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">📍 {req.location.name} • {req.location.distance} km away</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{req.seatsTaken} of {req.seatsTotal} spots filled</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Host stats */}
        <div className="liquid-glass p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">HOST STATS</h3>
          <div className="space-y-2">
            {[
              { label: 'Plans hosted', value: user.meetupsHosted },
              { label: 'Successful meetups', value: user.meetupsAttended },
              { label: 'No-shows', value: user.noShows },
              { label: 'Cancellations', value: user.cancellations },
            ].map((s, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* My requests */}
        {myRequests.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">MY REQUESTS</h3>
            <div className="space-y-1.5">
              {myRequests.slice(0, 3).map((req) => (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="w-full flex items-center gap-3 bg-background/80 backdrop-blur-xl border border-border/50 p-4 rounded-3xl text-left tap-scale hover:bg-background/90 transition-colors"
                  style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}>
                  <span className="text-lg">{getCategoryEmoji(req.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate">{req.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">{req.seatsTaken} of {req.seatsTotal} spots filled • {req.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button className="w-full h-11 tahoe-btn-secondary tap-scale text-sm" onClick={() => { reset(); navigate('/'); }}>
          Log Out
        </button>
      </div>
      
      <BottomNav />
    </div>
  );
}
