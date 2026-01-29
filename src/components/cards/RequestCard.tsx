import { useRef } from 'react';
import { MapPin, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  
  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -3,
      duration: 0.25,
      ease: 'power2.out',
    });
  };
  
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
    });
  };
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(buttonRef.current, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out',
          });
        },
      });
    }
    
    onJoin?.();
  };
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        'neo-card p-4 cursor-pointer transition-shadow duration-200',
        'hover:shadow-soft-lg',
        className
      )}
      onClick={onView}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className="shrink-0">
          <CategoryIcon category={request.category} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges Row */}
          <div className="flex items-center gap-1.5 mb-2">
            <UrgencyBadge urgency={request.urgency} />
            <TrustBadge level={request.userTrust} showLabel={false} />
          </div>
          
          {/* Title */}
          <h3 className="font-medium text-foreground truncate mb-2 text-[15px] leading-snug">
            {request.title}
          </h3>
          
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin size={11} strokeWidth={2} className="opacity-60" />
              <span>{request.location.distance}km</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={11} strokeWidth={2} className="opacity-60" />
              <span>{seatsLeft} left</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} strokeWidth={2} className="opacity-60" />
              <span>{timeLeft}</span>
            </div>
          </div>
          
          {/* User Row */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
            <img 
              src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName}
              className="w-5 h-5 rounded-full ring-1 ring-border/50"
            />
            <span className="text-xs text-muted-foreground">{request.userName}</span>
          </div>
        </div>
        
        {/* Join Button */}
        <Button
          ref={buttonRef}
          variant={isJoined ? "secondary" : "default"}
          size="sm"
          className={cn(
            'shrink-0 rounded-xl font-medium text-xs h-8 px-4 transition-all',
            isJoined 
              ? 'bg-muted text-muted-foreground hover:bg-muted' 
              : 'gradient-primary shadow-sm hover:shadow-md text-white'
          )}
          onClick={handleJoinClick}
          disabled={seatsLeft === 0 && !isJoined}
        >
          {isJoined ? 'Joined ✓' : seatsLeft === 0 ? 'Full' : 'Join'}
        </Button>
      </div>
    </div>
  );
}
