import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
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

function getStatusIndicator(request: Request) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const minutesLeft = (new Date(request.expiresAt).getTime() - Date.now()) / 60000;
  
  if (minutesLeft <= 30 && minutesLeft > 0) {
    const mins = Math.round(minutesLeft);
    return { label: `⚡ Starts in ${mins} min`, color: 'text-warning bg-warning/10 border border-warning/20' };
  }
  if (seatsLeft <= 2 && seatsLeft > 0) return { label: '🔥 Filling fast', color: 'text-destructive bg-destructive/10 border border-destructive/20' };
  if (request.seatsTaken >= Math.ceil(request.seatsTotal * 0.7)) return { label: '🔥 Popular', color: 'text-primary bg-primary/10 border border-primary/20' };
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
        className={cn('p-3 cursor-pointer tap-scale rounded-xl', className)}
        onClick={onView}
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
        }}
      >
        {/* Status badge */}
        {status && (
          <div className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold mb-2', status.color)}>
            {status.label}
          </div>
        )}

        <div className="flex items-start gap-2.5">
          {/* Category icon with color */}
          <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center text-base shrink-0', CATEGORY_COLORS[request.category])}>
            {getCategoryEmoji(request.category)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <UrgencyBadge urgency={request.urgency} />
              {request.liveShare && <span className="text-[10px] text-success font-semibold">📡</span>}
            </div>
            <h3 className="font-semibold text-[13px] text-foreground leading-snug line-clamp-2">{request.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">📍 {request.location.name}</p>
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              className={cn(
                'tap-scale h-7 px-3 rounded-lg text-[11px] font-semibold',
                isJoined ? 'tahoe-btn-secondary text-muted-foreground' : 'tahoe-btn-primary'
              )}
              onClick={handleJoinClick}
              disabled={seatsLeft === 0 && !isJoined}
            >
              {isJoined ? '✓ In' : seatsLeft === 0 ? 'Full' : 'Join'}
            </button>
            <button onClick={handleSaveClick} className="tap-scale p-0.5">
              <Heart size={13} className={cn(isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground/50')} />
            </button>
          </div>
        </div>

        {/* Seats progress + attendee avatars */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/15">
          <div className="flex items-center gap-2">
            {/* Attendee avatars */}
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
            <span className="text-2xs text-muted-foreground font-semibold">
              👥 {request.seatsTaken}/{request.seatsTotal} spots filled
            </span>
          </div>
          <span className="text-2xs text-muted-foreground">⏱ {timeLeft}</span>
        </div>
        
        {/* Host + meta row */}
        <div className="flex items-center justify-between mt-2">
          <button onClick={handleHostClick} className="flex items-center gap-1.5 tap-scale">
            <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName} className="w-4 h-4 rounded-full" />
            <span className="text-2xs text-muted-foreground font-medium underline decoration-dotted">{request.userName}</span>
            {request.userReliability && (
              <span className="text-[10px] text-success font-semibold">{request.userReliability}%</span>
            )}
          </button>
          <div className="flex items-center gap-2 text-2xs text-muted-foreground">
            <span>{request.location.distance}km</span>
            <button onClick={handleShareClick} className="tap-scale">📤</button>
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
