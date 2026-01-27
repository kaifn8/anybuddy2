import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, LogOut, MapPin, Calendar, CheckCircle, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { CategoryIcon, getCategoryLabel } from '@/components/icons/CategoryIcon';
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
          <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/signup')}>Sign In</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold">Profile</h1>
          <button className="tap-scale p-2">
            <Settings size={20} className="text-muted-foreground" />
          </button>
        </div>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-6 card-shadow text-center">
          <div className="relative inline-block">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName}
              className="w-24 h-24 rounded-full mx-auto border-4 border-background shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 tap-scale">
              <Edit2 size={14} />
            </button>
          </div>
          
          <h2 className="text-2xl font-display font-bold mt-4">{user.firstName}</h2>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <TrustBadge level={user.trustLevel} size="md" />
          </div>
          
          <div className="flex items-center justify-center gap-1 text-muted-foreground mt-2">
            <MapPin size={14} />
            <span className="text-sm">{user.city}</span>
          </div>
          
          <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
            <Calendar size={14} />
            <span className="text-sm">
              Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-primary">{user.credits}</p>
            <p className="text-xs text-muted-foreground">Credits</p>
          </div>
          <div className="bg-card rounded-xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-secondary">{user.completedJoins}</p>
            <p className="text-xs text-muted-foreground">Joins</p>
          </div>
          <div className="bg-card rounded-xl p-4 card-shadow text-center">
            <p className="text-2xl font-bold text-success">{myRequests.length}</p>
            <p className="text-xs text-muted-foreground">Requests</p>
          </div>
        </div>
        
        {/* Interests */}
        <div className="bg-card rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold mb-3">My Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <div
                key={interest}
                className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5"
              >
                <CategoryIcon category={interest} className="!p-1" />
                <span className="text-sm">{getCategoryLabel(interest)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Requests */}
        {myRequests.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">My Requests</h3>
            <div className="space-y-2">
              {myRequests.slice(0, 3).map((request) => (
                <button
                  key={request.id}
                  onClick={() => navigate(`/request/${request.id}`)}
                  className="w-full flex items-center gap-3 bg-card rounded-xl p-3 card-shadow text-left tap-scale"
                >
                  <CategoryIcon category={request.category} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.seatsTaken}/{request.seatsTotal} joined
                    </p>
                  </div>
                  <CheckCircle size={18} className="text-success shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Logout */}
        <Button
          variant="outline"
          className="w-full py-6"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Log Out
        </Button>
      </div>
      
      <BottomNav />
    </div>
  );
}
