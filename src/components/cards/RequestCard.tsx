import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
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
  if (minutesLeft <= 30 && minutesLeft > 0) {
    const mins = Math.round(minutesLeft);
    return { label: `⚡ Starts in ${mins} min`, color: 'text-warning bg-warning/10 border border-warning/20' };
  }
  return null;
}

export function RequestCard({ request, onJoin, onView, isJoined, className }: RequestCardProps) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const { user, savePlan, unsavePlan } = useAppStore();
  
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeIndicator = getTimeIndicator(request);
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
        className={cn('bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-4 cursor-pointer tap-scale transition-colors hover:bg-background/90', className)}
        style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}
        onClick={onView}
      >
        {/* Time indicator - only one */}
        {timeIndicator && (
          <div className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3', timeIndicator.color)}>
            {timeIndicator.label}
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          {/* Category icon */}
          <div className={cn('w-11 h-11 rounded-2xl border border-white/20 shadow-sm flex items-center justify-center text-2xl shrink-0', CATEGORY_COLORS[request.category])}>
            {getCategoryEmoji(request.category)}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title - main element */}
            <h3 className="font-semibold text-[15px] text-foreground leading-tight line-clamp-2 mb-2">{request.title}</h3>
            
            {/* Location + Distance merged */}
            <p className="text-[13px] text-muted-foreground font-medium mb-2">
              📍 {request.location.name} • {request.location.distance} km away
            </p>

            {/* Participant info with avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {attendeeAvatars.slice(0, 3).map((avatar, i) => (
                  <img key={i} src={avatar} alt="" className="w-5 h-5 rounded-full border-2 border-background" />
                ))}
                {attendeeAvatars.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[8px] font-bold text-muted-foreground">+{attendeeAvatars.length - 3}</span>
                  </div>
                )}
              </div>
              <span className="text-[12px] text-muted-foreground font-medium">
                {request.seatsTaken} of {request.seatsTotal} spots filled
              </span>
            </div>
          </div>
          
          {/* Join button */}
          <div className="shrink-0">
            <button
              className={cn(
                'tap-scale h-10 px-4 rounded-xl text-sm font-medium shadow-sm',
                isJoined ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={handleJoinClick}
              disabled={seatsLeft === 0 && !isJoined}
            >
              {isJoined ? '✓ Joined' : seatsLeft === 0 ? 'Full' : 'Join Plan'}
            </button>
          </div>
        </div>

        {/* Host info + reliability on same row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <button onClick={handleHostClick} className="flex items-center gap-1.5 tap-scale">
            <div className="relative">
              <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                alt={request.userName} className="w-5 h-5 rounded-full" />
              {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
                <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">✅</span>
              )}
            </div>
            <span className="text-[12px] text-muted-foreground font-medium hover:text-foreground transition-colors">
              {request.userName}
              {request.userReliability && <span className="ml-1.5">• ⭐ {request.userReliability}% reliable</span>}
            </span>
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={handleSaveClick} className="tap-scale p-1">
              <Heart size={15} className={cn(isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors')} />
            </button>
            <button onClick={handleShareClick} className="tap-scale hover:text-foreground transition-colors">
              <Share2 size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Safety indicators - combined */}
        <div className="mt-2 text-[11px] text-muted-foreground/70">
          🛡 Public meetup
          {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && ' • Verified host'}
          {request.liveShare && ' • 📡 Live location'}
        </div>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title}
        text={`${request.title}\n📍 ${request.location.name}\nJoin here 👇`} />
    </>
  );
}
