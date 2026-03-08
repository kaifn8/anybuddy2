import { useRef } from 'react';
import { MapPin, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
import type { Request } from '@/types/anybuddy';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
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
    gsap.to(cardRef.current, { y: -2, duration: 0.3, ease: 'power2.out' });
  };
  
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
  };
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.94, duration: 0.1, ease: 'power2.out',
        onComplete: () => gsap.to(buttonRef.current, { scale: 1, duration: 0.25, ease: 'back.out(2)' }),
      });
    }
    onJoin?.();
  };
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        'liquid-glass-interactive p-4 specular-highlight',
        className
      )}
      onClick={onView}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3.5">
        {/* Emoji */}
        <div className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center text-xl shrink-0">
          {getCategoryEmoji(request.category)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <UrgencyBadge urgency={request.urgency} />
            {request.liveShare && (
              <span className="liquid-glass-subtle text-2xs text-success px-2 py-0.5 font-semibold">📡 Live</span>
            )}
          </div>
          
          <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-2">
            {request.title}
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>📍 {request.location.distance}km</span>
            <span>👥 {seatsLeft} left</span>
            <span>⏱ {timeLeft}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <img 
              src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-muted-foreground font-medium">{request.userName}</span>
          </div>
        </div>
        
        {/* Join */}
        <Button
          ref={buttonRef}
          size="sm"
          className={cn(
            'shrink-0 rounded-xl font-semibold text-xs h-9 px-4 transition-all',
            isJoined 
              ? 'liquid-glass-subtle text-muted-foreground border-0' 
              : 'glass-button-primary'
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
