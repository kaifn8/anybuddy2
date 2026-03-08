import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import type { Request } from '@/types/anybuddy';

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text?: string;
  request?: Request;
}

export function ShareSheet({ open, onClose, title, text }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareText = text || title;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
    onClose();
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        onClose();
      } catch {}
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="liquid-glass-heavy border-border/20 max-w-[340px] rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Invite friends to join</DialogTitle>
          <DialogDescription className="text-2xs text-muted-foreground line-clamp-1">{title}</DialogDescription>
        </DialogHeader>
        
        {/* Message preview */}
        <div className="liquid-glass-subtle p-3 rounded-lg mt-1">
          <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{shareText}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <button onClick={handleWhatsApp} className="flex flex-col items-center gap-2 p-3 rounded-xl liquid-glass tap-scale">
            <span className="text-2xl">💬</span>
            <span className="text-2xs font-semibold">WhatsApp</span>
          </button>
          <button onClick={handleInstagram} className="flex flex-col items-center gap-2 p-3 rounded-xl liquid-glass tap-scale">
            <span className="text-2xl">📸</span>
            <span className="text-2xs font-semibold">Instagram</span>
          </button>
          {navigator.share ? (
            <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 p-3 rounded-xl liquid-glass tap-scale">
              <span className="text-2xl">👥</span>
              <span className="text-2xs font-semibold">Friends</span>
            </button>
          ) : (
            <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 p-3 rounded-xl liquid-glass tap-scale">
              <span className="text-2xl">🔗</span>
              <span className="text-2xs font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          )}
        </div>
        {navigator.share && (
          <button onClick={handleCopyLink} className="w-full mt-2 py-2.5 rounded-xl liquid-glass tap-scale text-xs font-semibold">
            {copied ? '✅ Copied!' : '🔗 Copy Link'}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
