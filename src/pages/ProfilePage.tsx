import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';
import type { Badge } from '@/types/anybuddy';

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
    .filter(Boolean);
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Profile" />
      
      <div className="px-5 pt-5 space-y-4">
        {/* Profile card */}
        <div className="liquid-glass-heavy p-5 text-center">
          <div className="relative inline-block">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName} className="w-20 h-20 rounded-full mx-auto border-3 border-white/40" />
            {user.isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 text-lg">✅</span>
            )}
          </div>
          <h2 className="text-title font-bold mt-3">{user.firstName}</h2>
          {user.bio && <p className="text-xs text-muted-foreground mt-1">{user.bio}</p>}
          <div className="flex items-center justify-center mt-1.5"><TrustBadge level={user.trustLevel} size="md" /></div>
          <p className="text-2xs text-muted-foreground mt-2">
            📍 {user.zone ? `${user.zone}, ${user.city}` : user.city} · Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: `${user.reliabilityScore}%`, label: 'Reliable' },
            { value: user.meetupsAttended + user.completedJoins, label: 'Meetups' },
            { value: `${user.joinRate}%`, label: 'Join Rate' },
            { value: user.hostRating > 0 ? `${user.hostRating}★` : '—', label: 'Host' },
          ].map((stat, i) => (
            <div key={i} className="liquid-glass p-2.5 text-center">
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{stat.label}</p>
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
        <div className="liquid-glass-heavy p-4 specular-highlight" style={{ borderRadius: '1rem' }}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2.5">INTERESTS</h3>
          <div className="flex flex-wrap gap-1.5">
            {user.interests.map((interest) => (
              <div key={interest} className="liquid-glass-subtle flex items-center gap-1 px-3 py-1.5 text-xs font-medium">
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
                  className="w-full flex items-center gap-3 liquid-glass p-3 text-left tap-scale" style={{ borderRadius: '0.875rem' }}>
                  <span className="text-lg">{getCategoryEmoji(req.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{req.title}</p>
                    <p className="text-2xs text-muted-foreground">📍 {req.location.name} · {req.seatsTaken}/{req.seatsTotal} joined</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Host stats */}
        <div className="liquid-glass p-4 specular-highlight" style={{ borderRadius: '1rem' }}>
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
                  className="w-full flex items-center gap-3 liquid-glass p-3 text-left tap-scale" style={{ borderRadius: '0.875rem' }}>
                  <span className="text-lg">{getCategoryEmoji(req.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{req.title}</p>
                    <p className="text-2xs text-muted-foreground">{req.seatsTaken}/{req.seatsTotal} joined · {req.status}</p>
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
