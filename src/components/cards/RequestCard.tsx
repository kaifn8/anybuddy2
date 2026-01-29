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
      y: -4,
      boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
      duration: 0.3,
      ease: 'power2.out',
    });
  };
  
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
      duration: 0.3,
      ease: 'power2.out',
    });
  };
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(buttonRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)',
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
        'glass-card p-4 cursor-pointer',
        className
      )}
      onClick={onView}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <CategoryIcon category={request.category} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <UrgencyBadge urgency={request.urgency} />
            <TrustBadge level={request.userTrust} showLabel={false} />
          </div>
          
          <h3 className="font-medium text-foreground truncate mb-1.5 text-[15px]">
            {request.title}
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin size={12} strokeWidth={2} />
              <span>{request.location.distance}km</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} strokeWidth={2} />
              <span>{seatsLeft} left</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} strokeWidth={2} />
              <span>{timeLeft}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2.5">
            <img 
              src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName}
              className="w-5 h-5 rounded-full ring-1 ring-border"
            />
            <span className="text-xs text-muted-foreground font-medium">{request.userName}</span>
          </div>
        </div>
        
        <Button
          ref={buttonRef}
          variant={isJoined ? "secondary" : "default"}
          size="sm"
          className={cn(
            'shrink-0 rounded-xl font-medium text-xs h-8 px-4',
            isJoined ? 'bg-muted text-muted-foreground' : 'gradient-primary shadow-sm'
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
