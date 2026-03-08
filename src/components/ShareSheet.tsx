import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text?: string;
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
    // Instagram doesn't have a direct share URL, copy to clipboard instead
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
          <DialogTitle className="text-sm font-bold">Share Plan</DialogTitle>
          <DialogDescription className="text-2xs text-muted-foreground line-clamp-1">{title}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 mt-2">
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
