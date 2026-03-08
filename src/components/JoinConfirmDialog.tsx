import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';

interface JoinConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: Request;
}

export function JoinConfirmDialog({ open, onClose, onConfirm, request }: JoinConfirmDialogProps) {
  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="liquid-glass-heavy border-border/20 max-w-[340px] rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <span>{getCategoryEmoji(request.category)}</span>
            Join this meetup?
          </DialogTitle>
          <DialogDescription className="sr-only">Confirm joining this plan</DialogDescription>
        </DialogHeader>
        <div className="liquid-glass p-3.5 rounded-xl mt-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <h3 className="text-sm font-semibold leading-snug">{request.title}</h3>
          <div className="flex items-center gap-3 mt-2.5 text-2xs text-muted-foreground">
            <span>⏱ Starts in {timeLeft}</span>
            <span>👥 {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left</span>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
              alt={request.userName} className="w-5 h-5 rounded-full" />
            <span className="text-xs font-medium">{request.userName}</span>
            {request.userReliability && (
              <span className="text-2xs text-success font-semibold">{request.userReliability}% reliable</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className="flex-1 h-10 tahoe-btn-secondary rounded-xl tap-scale text-xs font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 h-10 tahoe-btn-primary rounded-xl tap-scale text-xs font-semibold"
            disabled={seatsLeft === 0}>
            {seatsLeft === 0 ? 'Full' : 'Confirm Join'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
