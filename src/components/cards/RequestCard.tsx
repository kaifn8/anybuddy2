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
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  const status = getStatusIndicator(request);
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
        className={cn('bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-3xl p-4 cursor-pointer tap-scale transition-colors hover:bg-background/90', className)}
        onClick={onView}
      >
        {/* Status badge */}
        {status && (
          <div className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mb-3', status.color)}>
            {status.label}
          </div>
        )}

        <div className="flex items-start gap-3.5">
          {/* Category icon with color */}
          <div className={cn('w-12 h-12 rounded-2xl border border-white/20 shadow-sm flex items-center justify-center text-2xl shrink-0', CATEGORY_COLORS[request.category])}>
            {getCategoryEmoji(request.category)}
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5 mb-1">
              <UrgencyBadge urgency={request.urgency} />
              {request.liveShare && <span className="text-[10px] text-success font-semibold">📡 Live</span>}
            </div>
            <h3 className="font-bold text-[15px] text-foreground leading-snug line-clamp-2 mb-1">{request.title}</h3>
            <p className="text-[12px] text-muted-foreground font-medium flex items-center gap-1">
              <span>📍</span> <span className="truncate">{request.location.name}</span>
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              className={cn(
                'tap-scale h-8 px-4 rounded-xl text-xs font-bold shadow-sm',
                isJoined ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
              )}
              onClick={handleJoinClick}
              disabled={seatsLeft === 0 && !isJoined}
            >
              {isJoined ? '✓ In' : seatsLeft === 0 ? 'Full' : 'Join'}
            </button>
            <button onClick={handleSaveClick} className="tap-scale p-1 -mr-1">
              <Heart size={16} className={cn(isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors')} />
            </button>
          </div>
        </div>

        {/* Seats progress + attendee avatars */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
          <div className="flex items-center gap-2.5">
            {/* Attendee avatars */}
            <div className="flex -space-x-2">
              {attendeeAvatars.slice(0, 3).map((avatar, i) => (
                <img key={i} src={avatar} alt="" className="w-6 h-6 rounded-full border-2 border-background shadow-sm" />
              ))}
              {attendeeAvatars.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-muted-foreground">+{attendeeAvatars.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              <span className="text-foreground">{request.seatsTaken}</span>/{request.seatsTotal} joined
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">⏱ {timeLeft}</span>
        </div>
        
        {/* Host + meta row */}
        <div className="flex items-center justify-between mt-3">
          <button onClick={handleHostClick} className="flex items-center gap-2 tap-scale">
            <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName} className="w-5 h-5 rounded-full" />
            <span className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors">{request.userName}</span>
            {request.userReliability && (
              <span className="text-[10px] text-success font-bold bg-success/10 px-1.5 py-0.5 rounded-sm">{request.userReliability}%</span>
            )}
          </button>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span className="font-medium">{request.location.distance}km</span>
            <div className="w-1 h-1 rounded-full bg-border"></div>
            <button onClick={handleShareClick} className="tap-scale hover:text-foreground transition-colors"><Share2 size={14} /></button>
          </div>
        </div>

        {/* Safety indicator */}
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground/60">
          <span>🛡️ Public meetup</span>
          {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
            <span>· ✅ Verified host</span>
          )}
        </div>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title}
        text={`${request.title}\n📍 ${request.location.name}\nStarts in ${timeLeft}\nJoin here 👇`} />
    </>
  );
}
