import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, myRequests, reset } = useAppStore();
  
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
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center justify-between h-12 px-5 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="tahoe-btn-ghost w-8 h-8 rounded-lg tap-scale text-sm">←</button>
          <h1 className="text-title-sm font-semibold">Profile</h1>
          <button className="tahoe-btn-ghost w-8 h-8 rounded-lg tap-scale text-sm">⚙️</button>
        </div>
      </header>
      
      <div className="px-5 pt-5 space-y-4">
        {/* Profile card */}
        <div className="liquid-glass-heavy p-5 text-center specular-highlight" style={{ borderRadius: '1.25rem' }}>
          <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
            alt={user.firstName} className="w-20 h-20 rounded-full mx-auto border-3 border-white/40" />
          <h2 className="text-title font-bold mt-3">{user.firstName}</h2>
          <div className="flex items-center justify-center mt-1.5"><TrustBadge level={user.trustLevel} size="md" /></div>
          <p className="text-xs text-muted-foreground mt-2">
            📍 {user.city} · Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { value: user.credits, label: 'Credits', color: 'text-primary' },
            { value: user.completedJoins, label: 'Joins', color: 'text-secondary' },
            { value: myRequests.length, label: 'Posts', color: 'text-success' },
          ].map((stat, i) => (
            <div key={i} className="liquid-glass p-3 text-center specular-highlight" style={{ borderRadius: '0.875rem' }}>
              <p className={`text-title font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Interests */}
        <div className="liquid-glass-heavy p-4 specular-highlight" style={{ borderRadius: '1rem' }}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2.5">MY VIBES</h3>
          <div className="flex flex-wrap gap-1.5">
            {user.interests.map((interest) => (
              <div key={interest} className="liquid-glass-subtle flex items-center gap-1 px-3 py-1.5 text-xs font-medium">
                <span>{getCategoryEmoji(interest)}</span>
                <span>{getCategoryLabel(interest)}</span>
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
                    <p className="text-2xs text-muted-foreground">{req.seatsTaken}/{req.seatsTotal} joined</p>
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
