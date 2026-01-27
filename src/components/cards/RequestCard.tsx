import { MapPin, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: Request;
  onJoin?: () => void;
  onView?: () => void;
  isJoined?: boolean;
  className?: string;
}

export function RequestCard({ request, onJoin, onView, isJoined, className }: RequestCardProps) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  
  return (
    <div 
      className={cn(
        'bg-card rounded-2xl p-4 card-shadow card-shadow-hover cursor-pointer slide-up',
        className
      )}
      onClick={onView}
    >
      <div className="flex items-start gap-3">
        <CategoryIcon category={request.category} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <UrgencyBadge urgency={request.urgency} />
            <TrustBadge level={request.userTrust} showLabel={false} />
          </div>
          
          <h3 className="font-semibold text-foreground truncate mb-1">
            {request.title}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{request.location.distance}km</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{seatsLeft} left</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{timeLeft}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <img 
              src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{request.userName}</span>
          </div>
        </div>
        
        <Button
          variant={isJoined ? "secondary" : "default"}
          size="sm"
          className={cn(
            'tap-scale shrink-0',
            isJoined ? '' : 'gradient-primary'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          disabled={seatsLeft === 0 && !isJoined}
        >
          {isJoined ? 'Joined ✓' : seatsLeft === 0 ? 'Full' : 'Join'}
        </Button>
      </div>
    </div>
  );
}
