import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
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
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin?.();
  };
  
  return (
    <div className={cn('liquid-glass-interactive p-4 specular-highlight', className)} onClick={onView}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-lg shrink-0">
          {getCategoryEmoji(request.category)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <UrgencyBadge urgency={request.urgency} />
            {request.liveShare && <span className="text-2xs text-success font-semibold">📡</span>}
          </div>
          <h3 className="font-semibold text-body text-foreground leading-snug line-clamp-2">{request.title}</h3>
        </div>
        
        <button
          className={cn(
            'shrink-0 tap-scale h-8 px-3.5 rounded-lg text-xs font-semibold',
            isJoined ? 'tahoe-btn-secondary text-muted-foreground' : 'tahoe-btn-primary'
          )}
          onClick={handleJoinClick}
          disabled={seatsLeft === 0 && !isJoined}
        >
          {isJoined ? '✓ In' : seatsLeft === 0 ? 'Full' : 'Join'}
        </button>
      </div>
      
      {/* Meta row with reliability */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
        <div className="flex items-center gap-2">
          <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
            alt={request.userName} className="w-5 h-5 rounded-full" />
          <span className="text-xs text-muted-foreground font-medium">{request.userName}</span>
          {request.userReliability && (
            <span className="text-2xs text-success font-semibold">{request.userReliability}%</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-2xs text-muted-foreground">
          <span>📍 {request.location.distance}km</span>
          <span>👥 {seatsLeft}</span>
          <span>⏱ {timeLeft}</span>
        </div>
      </div>
    </div>
  );
}
