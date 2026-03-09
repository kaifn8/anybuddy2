import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { ShareSheet } from '@/components/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { Copy, Share2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function InviteFriendsPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  
  // Generate unique invite link (in real app, this would be from backend)
  const inviteCode = user?.id ? `${user.id.slice(0, 8)}` : 'ANYBUDDY';
  const inviteLink = `https://anybuddy.app/join/${inviteCode}`;
  const inviteMessage = `Yo! I found people to hang with through this app. Join me: ${inviteLink}`;
  
  const invitesLeft = 3; // From user data
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share it with your friends",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = () => {
    setShareOpen(true);
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Invite Friends" />
      
      <div className="px-5 pt-5 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold mb-2">Invite your friends</h2>
          <p className="text-sm text-muted-foreground">
            Share AnyBuddy with friends and get rewards when they join
          </p>
        </div>
        
        {/* Invites remaining */}
        <div className="liquid-glass-heavy p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Invites remaining</p>
              <p className="text-2xs text-muted-foreground mt-0.5">Invite more friends to unlock rewards</p>
            </div>
            <div className="text-3xl font-bold text-primary">{invitesLeft}</div>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="liquid-glass-heavy p-6 rounded-3xl">
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 text-center">SCAN QR CODE</h3>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <QRCodeSVG 
                value={inviteLink} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          <p className="text-2xs text-muted-foreground text-center mt-4">
            Ask your friend to scan this code with their camera
          </p>
        </div>
        
        {/* Invite Link */}
        <div className="liquid-glass-heavy p-4 rounded-3xl">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">YOUR INVITE LINK</h3>
          <div className="liquid-glass-subtle p-3 rounded-xl flex items-center justify-between gap-3 mb-3">
            <code className="text-xs font-mono text-foreground flex-1 overflow-x-auto whitespace-nowrap">
              {inviteLink}
            </code>
            <button
              onClick={handleCopyLink}
              className="tap-scale p-2 rounded-lg liquid-glass hover:bg-background/80 transition-colors"
            >
              {copied ? (
                <Check size={18} className="text-green-500" />
              ) : (
                <Copy size={18} className="text-muted-foreground" />
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleCopyLink} className="w-full">
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy Link
                </>
              )}
            </Button>
            <Button variant="default" onClick={handleShare} className="w-full">
              <Share2 size={16} />
              Share Link
            </Button>
          </div>
        </div>
        
        {/* Invite Code */}
        <div className="liquid-glass p-4 rounded-3xl">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">YOUR INVITE CODE</h3>
          <div className="text-center">
            <div className="liquid-glass-subtle inline-block px-6 py-3 rounded-xl">
              <code className="text-2xl font-bold tracking-wider text-primary">
                {inviteCode}
              </code>
            </div>
          </div>
          <p className="text-2xs text-muted-foreground text-center mt-3">
            Friends can enter this code when signing up
          </p>
        </div>
        
        {/* Rewards info */}
        <div className="liquid-glass-heavy p-4 rounded-3xl border border-primary/20">
          <h3 className="text-xs font-semibold text-primary mb-3">🎁 REFERRAL REWARDS</h3>
          <div className="space-y-2">
            {[
              { emoji: '⭐', text: 'You get 10 credits for each friend who joins' },
              { emoji: '🏆', text: 'Your friend gets 5 bonus credits to start' },
              { emoji: '🎯', text: 'Unlock special badges with 5+ referrals' },
            ].map((reward, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-base">{reward.emoji}</span>
                <span className="text-muted-foreground">{reward.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <BottomNav />
      
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Join me on AnyBuddy!"
        text={inviteMessage}
      />
    </div>
  );
}
