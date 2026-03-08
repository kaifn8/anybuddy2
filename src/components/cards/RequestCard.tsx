import { useRef } from 'react';
import { MapPin, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
import type { Request } from '@/types/anybuddy';
import { CategoryIcon, getCategoryEmoji } from '@/components/icons/CategoryIcon';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { y: -3, duration: 0.25, ease: 'power2.out' });
  };
  
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: 'power2.out' });
  };
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
        },
      });
    }
    onJoin?.();
  };
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        'uber-card p-4 cursor-pointer',
        className
      )}
      onClick={onView}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3.5">
        {/* Emoji Category */}
        <CategoryIcon category={request.category} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <UrgencyBadge urgency={request.urgency} />
            {request.liveShare && (
              <span className="text-2xs bg-success/10 text-success px-2 py-0.5 rounded-full font-semibold">📍 Live</span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-2">
            {request.title}
          </h3>
          
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              📍 {request.location.distance}km
            </span>
            <span className="flex items-center gap-1">
              👥 {seatsLeft} left
            </span>
            <span className="flex items-center gap-1">
              ⏰ {timeLeft}
            </span>
          </div>
          
          {/* Creator */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <img 
              src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-muted-foreground font-medium">{request.userName}</span>
          </div>
        </div>
        
        {/* Join Button */}
        <Button
          ref={buttonRef}
          size="sm"
          className={cn(
            'shrink-0 rounded-xl font-semibold text-xs h-9 px-4',
            isJoined 
              ? 'bg-muted text-muted-foreground hover:bg-muted' 
              : 'bg-foreground text-background hover:opacity-90'
          )}
          onClick={handleJoinClick}
          disabled={seatsLeft === 0 && !isJoined}
        >
          {isJoined ? '✓ In' : seatsLeft === 0 ? 'Full' : 'Join'}
        </Button>
      </div>
    </div>
  );
}
