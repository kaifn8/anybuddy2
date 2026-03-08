import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { ShareSheet } from '@/components/ShareSheet';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: Request;
  onJoin?: () => void;
  onView?: () => void;
  isJoined?: boolean;
  className?: string;
}

function getStatusIndicator(request: Request) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const minutesLeft = (new Date(request.expiresAt).getTime() - Date.now()) / 60000;
  
  if (minutesLeft <= 30 && minutesLeft > 0) return { label: '⚡ Starting soon', color: 'text-warning' };
  if (seatsLeft <= 2 && seatsLeft > 0) return { label: '🔥 Filling fast', color: 'text-destructive' };
  if (request.seatsTaken >= Math.ceil(request.seatsTotal * 0.7)) return { label: '🔥 Popular', color: 'text-primary' };
  return null;
}

export function RequestCard({ request, onJoin, onView, isJoined, className }: RequestCardProps) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  const status = getStatusIndicator(request);
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin?.();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShare(true);
  };

  const handleHostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/host/${request.userId}`);
  };
  
  return (
    <>
      <div className={cn('liquid-glass-interactive p-4 specular-highlight', className)} onClick={onView}>
        {status && (
          <div className={cn('text-2xs font-bold mb-2', status.color)}>{status.label}</div>
        )}
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
        
        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
          <button onClick={handleHostClick} className="flex items-center gap-2 tap-scale">
            <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName} className="w-5 h-5 rounded-full" />
            <span className="text-xs text-muted-foreground font-medium underline decoration-dotted">{request.userName}</span>
            {request.userReliability && (
              <span className="text-2xs text-success font-semibold">{request.userReliability}%</span>
            )}
          </button>
          <div className="flex items-center gap-2.5 text-2xs text-muted-foreground">
            <span>📍 {request.location.distance}km</span>
            <span>👥 {seatsLeft}</span>
            <span>⏱ {timeLeft}</span>
            <button onClick={handleShareClick} className="tap-scale text-xs">📤</button>
          </div>
        </div>

        {/* Safety indicator */}
        <div className="flex items-center gap-2 mt-2 text-2xs text-muted-foreground/70">
          <span>🛡️ Public meetup</span>
          {request.userTrust === 'trusted' || request.userTrust === 'anchor' ? (
            <span>· ✅ Verified host</span>
          ) : null}
        </div>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title} />
    </>
  );
}
