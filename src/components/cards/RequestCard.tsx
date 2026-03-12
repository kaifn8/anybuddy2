import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { Request, Category } from '@/types/anybuddy';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { ShareSheet } from '@/components/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: Request;
  onJoin?: () => void;
  onView?: () => void;
  isJoined?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  chai: 'bg-amber-100 border-amber-200',
  food: 'bg-orange-100 border-orange-200',
  sports: 'bg-emerald-100 border-emerald-200',
  explore: 'bg-blue-100 border-blue-200',
  work: 'bg-slate-100 border-slate-200',
  walk: 'bg-teal-100 border-teal-200',
  help: 'bg-rose-100 border-rose-200',
  shopping: 'bg-purple-100 border-purple-200',
  casual: 'bg-violet-100 border-violet-200',
};

function getTimeIndicator(request: Request) {
  const minutesLeft = (new Date(request.expiresAt).getTime() - Date.now()) / 60000;
  
  if (minutesLeft <= 5 && minutesLeft > 0) {
    return { label: '⚡ Happening now', color: 'text-warning bg-warning/10 border border-warning/20' };
  }
  if (minutesLeft <= 15 && minutesLeft > 0) {
    const mins = Math.round(minutesLeft);
    return { label: `⏰ ${mins} min left`, color: 'text-destructive bg-destructive/10 border border-destructive/20' };
  }
  if (minutesLeft <= 30 && minutesLeft > 0) {
    const mins = Math.round(minutesLeft);
    return { label: `⚡ In ${mins} min`, color: 'text-warning bg-warning/10 border border-warning/20' };
  }
  return null;
}

function getHotIndicator(request: Request) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const fillPercentage = (request.seatsTaken / request.seatsTotal) * 100;
  
  if (seatsLeft === 1) {
    return { label: '🔴 1 spot left', color: 'text-destructive bg-destructive/10 border border-destructive/20' };
  }
  if (seatsLeft === 2) {
    return { label: '🔥 2 spots left', color: 'text-destructive bg-destructive/10 border border-destructive/20' };
  }
  if (fillPercentage >= 70) {
    return { label: `🔥 ${request.seatsTaken} joined`, color: 'text-primary bg-primary/10 border border-primary/20' };
  }
  return null;
}

export function RequestCard({ request, onJoin, onView, isJoined, className }: RequestCardProps) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const { user, savePlan, unsavePlan } = useAppStore();
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeIndicator = getTimeIndicator(request);
  const hotIndicator = getHotIndicator(request);
  const isSaved = user?.savedPlans?.includes(request.id);
  
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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) unsavePlan(request.id);
    else savePlan(request.id);
  };

  // Generate fake attendee avatars from participants + host
  const attendeeAvatars = [
    request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`,
    ...request.participants.map(p => p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`),
  ];
  // Fill up to seatsTaken with generated avatars
  while (attendeeAvatars.length < request.seatsTaken) {
    attendeeAvatars.push(`https://api.dicebear.com/7.x/avataaars/svg?seed=user${attendeeAvatars.length}`);
  }
  
  return (
    <>
      <div
        className={cn('bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-3 cursor-pointer tap-scale transition-colors hover:bg-background/90', className)}
        style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}
        onClick={onView}
      >
        {/* Status badges - time and hot indicator */}
        {(timeIndicator || hotIndicator) && (
          <div className="flex items-center gap-1.5 mb-2">
            {timeIndicator && (
              <div className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', timeIndicator.color)}>
                {timeIndicator.label}
              </div>
            )}
            {hotIndicator && (
              <div className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', hotIndicator.color)}>
                {hotIndicator.label}
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-2.5 mb-2">
          {/* Category icon */}
          <div className={cn('w-10 h-10 rounded-2xl border border-white/20 shadow-sm flex items-center justify-center text-xl shrink-0', CATEGORY_COLORS[request.category])}>
            {getCategoryEmoji(request.category)}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title - main element */}
            <h3 className="font-semibold text-[14px] text-foreground leading-tight line-clamp-2 mb-1.5">{request.title}</h3>
            
            {/* Location + Distance merged */}
            <p className="text-[12px] text-muted-foreground font-medium mb-1.5 truncate">
              📍 {request.location.name} • {request.location.distance} km away
            </p>
          </div>
        </div>

        {/* Participant info + Join button row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex -space-x-1.5 shrink-0">
              {attendeeAvatars.slice(0, 3).map((avatar, i) => (
                <img key={i} src={avatar} alt="" className="w-4 h-4 rounded-full border-2 border-background" />
              ))}
              {attendeeAvatars.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-[7px] font-bold text-muted-foreground">+{attendeeAvatars.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {seatsLeft === 0 ? 'Everyone\'s in!' : seatsLeft === 1 ? 'Only 1 spot — decide now' : `${request.seatsTaken} joined · ${seatsLeft} spots left`}
            </span>
          </div>

          <Button
            variant={isJoined ? 'secondary' : 'default'}
            size="sm"
            className="tap-scale h-8 px-3 text-[12px] shrink-0"
            onClick={handleJoinClick}
            disabled={seatsLeft === 0 && !isJoined}
          >
            {isJoined ? '✓ You\'re in' : seatsLeft === 0 ? 'Missed it' : seatsLeft <= 2 ? 'Join now' : 'Join'}
          </Button>
        </div>

        {/* Host info + reliability on same row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <button onClick={handleHostClick} className="flex items-center gap-1.5 tap-scale">
            <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName} className="w-4 h-4 rounded-full" />
            <span className="text-[11px] text-muted-foreground font-medium hover:text-foreground transition-colors flex items-center gap-1">
              {request.userName}
              {request.userGender && (
                <span className="text-[10px]">{request.userGender === 'male' ? '👨' : request.userGender === 'female' ? '👩' : '🧑'}</span>
              )}
              {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
                <BadgeCheck size={14} className="text-primary" strokeWidth={2.5} />
              )}
              {request.userReliability && <span className="ml-0.5">• ⭐ {request.userReliability}% reliable</span>}
            </span>
          </button>
          
          <div className="flex items-center gap-1.5">
            <button onClick={handleSaveClick} className="tap-scale p-0.5">
              <Heart size={14} className={cn(isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors')} />
            </button>
            <button onClick={handleShareClick} className="tap-scale hover:text-foreground transition-colors">
              <Share2 size={13} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title}
        text={`${request.title}\n📍 ${request.location.name}\nJoin here 👇`} />
    </>
  );
}
