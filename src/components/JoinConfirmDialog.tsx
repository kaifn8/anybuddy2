import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';
import { Button } from '@/components/ui/button';

interface JoinConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: Request;
}

export function JoinConfirmDialog({ open, onClose, onConfirm, request }: JoinConfirmDialogProps) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });

  // Attendee avatars
  const avatars = [
    request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`,
    ...request.participants.map(p => p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`),
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="liquid-glass-heavy border-border/20 max-w-[340px] rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <span>{getCategoryEmoji(request.category)}</span>
            You in?
          </DialogTitle>
          <DialogDescription className="sr-only">Confirm joining this plan</DialogDescription>
        </DialogHeader>
        <div className="liquid-glass p-3.5 rounded-xl mt-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <h3 className="text-sm font-semibold leading-snug">{request.title}</h3>
          
          {/* Location */}
          <p className="text-2xs text-muted-foreground mt-1.5">📍 {request.location.name} · {request.location.distance}km away</p>
          
          <div className="flex items-center gap-3 mt-2 text-2xs text-muted-foreground">
            <span>⏱ {timeLeft} left to join</span>
            <span className={seatsLeft <= 2 ? 'text-destructive font-semibold' : ''}>
              👥 {seatsLeft === 0 ? 'Full!' : seatsLeft === 1 ? 'Last spot!' : `${seatsLeft} spots`}
            </span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/15">
            <div className="flex -space-x-1.5">
              {avatars.slice(0, 4).map((a, i) => (
                <img key={i} src={a} alt="" className="w-5 h-5 rounded-full border-2 border-background" />
              ))}
            </div>
            <span className="text-2xs text-muted-foreground">{request.seatsTaken} {request.seatsTaken === 1 ? 'person' : 'people'} going</span>
          </div>

          {/* Host */}
          <div className="flex items-center gap-2 mt-2.5">
            <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName} className="w-5 h-5 rounded-full" />
            <span className="text-xs font-medium">{request.userName}</span>
            {request.userReliability && (
              <span className="text-2xs text-success font-semibold">{request.userReliability}% reliable</span>
            )}
          </div>

          {/* Safety */}
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/60">
            <span>🛡️ Public meetup</span>
            {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
              <span>· ✅ Verified host</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1 h-10 text-xs">
            Not now
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-10 text-xs" disabled={seatsLeft === 0}>
            {seatsLeft === 0 ? 'Too late 😔' : "I'm in →"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
