import { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ProgressBar } from '@/components/ui/ProgressIndicator';
import { useAppStore } from '@/store/useAppStore';
import type { TrustLevel } from '@/types/anybuddy';

const trustProgression: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];
const trustRequirements = {
  seed: { joins: 0 },
  solid: { joins: 5 },
  trusted: { joins: 15 },
  anchor: { joins: 50 },
};

export default function CreditsPage() {
  const { user, creditHistory } = useAppStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLParagraphElement>(null);
  
  const currentTrustIndex = trustProgression.indexOf(user?.trustLevel || 'seed');
  const nextTrust = trustProgression[currentTrustIndex + 1];
  const nextReq = nextTrust ? trustRequirements[nextTrust].joins : null;
  
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(contentRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' });
    }
    if (creditsRef.current && user?.credits) {
      const obj = { value: 0 };
      gsap.to(obj, { value: user.credits, duration: 0.8, ease: 'power2.out', onUpdate: () => { if (creditsRef.current) creditsRef.current.textContent = Math.round(obj.value).toString(); } });
    }
  }, [user?.credits]);
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Credits & Trust" />
      
      <div ref={contentRef} className="px-5 pt-2 space-y-4">
        {/* Balance card */}
        <div className="rounded-2xl p-5 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, hsl(211 100% 50%), hsl(240 75% 55%), hsl(260 50% 56%))' }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl bg-white/10" />
          <p className="text-white/50 text-2xs font-semibold uppercase tracking-wider mb-1">Available to spend</p>
          <p ref={creditsRef} className="text-hero font-bold">0</p>
          <p className="text-white/40 text-xs mt-2">Show up = earn more</p>
        </div>
        
        {/* Trust level */}
        <div className="liquid-glass-heavy p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🛡️</span>
            <div className="flex-1">
              <p className="text-2xs text-muted-foreground font-medium mb-0.5">Trust Level</p>
              <TrustBadge level={user?.trustLevel || 'seed'} size="md" />
            </div>
          </div>
          
          {nextTrust && (
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex justify-between text-2xs mb-1.5">
                <span className="text-muted-foreground">{nextReq! - (user?.completedJoins || 0)} more to unlock {nextTrust}</span>
                <span className="font-semibold">{user?.completedJoins || 0}/{nextReq}</span>
              </div>
              <ProgressBar value={user?.completedJoins || 0} max={nextReq || 1} size="md" />
            </div>
          )}
          
          {!nextTrust && (
            <p className="text-xs text-success font-semibold mt-2">🏆 You're a legend. Max trust.</p>
          )}
        </div>
        
        {/* How to earn */}
        <div className="liquid-glass p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">STACK MORE CREDITS</h3>
          <div className="space-y-2.5">
            {[
              { emoji: '🤝', amount: '+0.5', action: 'Join a plan' },
              { emoji: '✅', amount: '+1', action: 'Actually show up' },
              { emoji: '⭐', amount: '+2', action: 'Get rated 5 stars' },
              { emoji: '🔥', amount: '+1', action: 'Active 7 days straight' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-sm">{item.emoji}</span>
                <span className="w-8 text-success font-bold text-xs">{item.amount}</span>
                <span className="text-xs text-muted-foreground">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* History */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">RECENT ACTIVITY</h3>
          {creditHistory.length > 0 ? (
            <div className="space-y-1.5">
              {creditHistory.slice(0, 10).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between liquid-glass p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{txn.type === 'earn' ? '📈' : '📉'}</span>
                    <div>
                      <p className="text-sm font-medium">{txn.reason}</p>
                      <p className="text-2xs text-muted-foreground">{formatDistanceToNow(new Date(txn.timestamp), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${txn.type === 'earn' ? 'text-success' : 'text-warning'}`}>
                    {txn.type === 'earn' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 liquid-glass">
              <span className="text-3xl block mb-2">🏁</span>
              <p className="text-xs text-muted-foreground">No activity yet</p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
