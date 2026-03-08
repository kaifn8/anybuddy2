import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { useAppStore } from '@/store/useAppStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, myRequests, reset } = useAppStore();
  
  const handleLogout = () => {
    reset();
    navigate('/');
  };
  
  if (!user) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">👤</span>
          <p className="text-muted-foreground mb-4 font-medium">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/signup')} className="bg-foreground text-background rounded-2xl">
            Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="tap-scale text-lg">←</button>
          <h1 className="text-lg font-extrabold">Profile</h1>
          <button className="tap-scale text-lg">⚙️</button>
        </div>
      </header>
      
      <div className="p-5 space-y-5">
        {/* Profile Card */}
        <div className="uber-card-elevated p-6 text-center">
          <div className="relative inline-block">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName}
              className="w-24 h-24 rounded-full mx-auto border-4 border-background shadow-warm"
            />
            <button className="absolute bottom-0 right-0 bg-foreground text-background rounded-full w-8 h-8 flex items-center justify-center tap-scale text-sm">
              ✏️
            </button>
          </div>
          
          <h2 className="text-2xl font-extrabold mt-4">{user.firstName}</h2>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <TrustBadge level={user.trustLevel} size="md" />
          </div>
          
          <div className="flex items-center justify-center gap-4 text-muted-foreground mt-3 text-sm">
            <span>📍 {user.city}</span>
            <span>📅 Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="uber-card p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{user.credits}</p>
            <p className="text-xs text-muted-foreground font-medium">💰 Credits</p>
          </div>
          <div className="uber-card p-4 text-center">
            <p className="text-2xl font-extrabold text-secondary">{user.completedJoins}</p>
            <p className="text-xs text-muted-foreground font-medium">🤝 Joins</p>
          </div>
          <div className="uber-card p-4 text-center">
            <p className="text-2xl font-extrabold text-success">{myRequests.length}</p>
            <p className="text-xs text-muted-foreground font-medium">📝 Posts</p>
          </div>
        </div>
        
        {/* Interests */}
        <div className="uber-card-elevated p-5">
          <h3 className="font-bold text-sm mb-3">My Vibes 🎯</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <div
                key={interest}
                className="flex items-center gap-1.5 bg-muted rounded-full px-3.5 py-2"
              >
                <span>{getCategoryEmoji(interest)}</span>
                <span className="text-sm font-medium">{getCategoryLabel(interest)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* My Requests */}
        {myRequests.length > 0 && (
          <div>
            <h3 className="font-bold text-sm mb-3">My Requests 📝</h3>
            <div className="space-y-2">
              {myRequests.slice(0, 3).map((request) => (
                <button
                  key={request.id}
                  onClick={() => navigate(`/request/${request.id}`)}
                  className="w-full flex items-center gap-3 uber-card p-4 text-left tap-scale"
                >
                  <span className="text-xl">{getCategoryEmoji(request.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{request.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.seatsTaken}/{request.seatsTotal} joined
                    </p>
                  </div>
                  <span className="text-success">✅</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Logout */}
        <Button
          variant="outline"
          className="w-full py-6 rounded-2xl font-semibold"
          onClick={handleLogout}
        >
          👋 Log Out
        </Button>
      </div>
      
      <BottomNav />
    </div>
  );
}
