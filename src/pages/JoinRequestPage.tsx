import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';

export default function JoinRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, joinRequest, updateCredits, user } = useAppStore();
  
  const [note, setNote] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  const request = requests.find(r => r.id === id);
  
  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }
  
  const handleJoin = () => {
    if (!user) return;
    
    setIsJoining(true);
    
    setTimeout(() => {
      joinRequest(request.id, note.trim() || undefined);
      updateCredits(0.5, 'Joined a request');
      setIsJoined(true);
      
      setTimeout(() => {
        navigate(`/request/${request.id}`);
      }, 1500);
    }, 500);
  };
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  
  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold">Join Request</h1>
        </div>
      </header>
      
      {isJoined ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[60vh]">
          <div className="gradient-success rounded-full p-6 mb-6 bounce-in bg-success">
            <Check size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">You're in! 🎉</h2>
          <p className="text-muted-foreground text-center">
            Opening chat with {request.userName}...
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Request Summary */}
          <div className="bg-card rounded-2xl p-5 card-shadow">
            <div className="flex items-start gap-4">
              <CategoryIcon category={request.category} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <UrgencyBadge urgency={request.urgency} />
                </div>
                <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                <div className="flex items-center gap-3">
                  <img
                    src={request.userAvatar}
                    alt={request.userName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{request.userName}</p>
                    <TrustBadge level={request.userTrust} size="sm" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spots available</span>
                <span className="font-medium">{seatsLeft} of {request.seatsTotal}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{request.location.distance}km away</span>
              </div>
            </div>
          </div>
          
          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Add a note (optional)
            </label>
            <Input
              placeholder="e.g., Coming in 10 mins!"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 40))}
              className="py-4 rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {note.length}/40
            </p>
          </div>
          
          {/* Info */}
          <div className="bg-primary/5 rounded-xl p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-success mt-0.5 shrink-0" />
                Your spot is locked immediately
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-success mt-0.5 shrink-0" />
                Group chat unlocks with all participants
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-success mt-0.5 shrink-0" />
                You'll see the meetup location
              </li>
            </ul>
          </div>
          
          {/* Join Button */}
          <Button
            className="w-full gradient-primary py-6 tap-scale"
            onClick={handleJoin}
            disabled={isJoining || seatsLeft === 0}
          >
            {isJoining ? 'Joining...' : `Join ${request.userName}'s Request`}
          </Button>
        </div>
      )}
    </div>
  );
}
