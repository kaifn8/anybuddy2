import { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ProgressBar } from '@/components/ui/ProgressIndicator';
import { useAppStore } from '@/store/useAppStore';
import type { TrustLevel } from '@/types/anybuddy';

const trustProgression: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];
const trustRequirements = {
  seed: { joins: 0, label: 'Just starting' },
  solid: { joins: 5, label: '5 completed joins' },
  trusted: { joins: 15, label: '15 completed joins' },
  anchor: { joins: 50, label: '50 completed joins' },
};

export default function CreditsPage() {
  const { user, creditHistory } = useAppStore();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLParagraphElement>(null);
  
  const currentTrustIndex = trustProgression.indexOf(user?.trustLevel || 'seed');
  const nextTrust = trustProgression[currentTrustIndex + 1];
  const nextRequirement = nextTrust ? trustRequirements[nextTrust].joins : null;
  const progress = nextRequirement 
    ? Math.min(100, ((user?.completedJoins || 0) / nextRequirement) * 100)
    : 100;
  
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(contentRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
    if (creditsRef.current && user?.credits) {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: user.credits, duration: 1, ease: 'power2.out',
        onUpdate: () => {
          if (creditsRef.current) creditsRef.current.textContent = Math.round(obj.value).toString();
        },
      });
    }
  }, [user?.credits]);
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <PageHeader title="Credits & Trust 💰" />
      
      <div ref={contentRef} className="px-5 space-y-5">
        {/* Balance Card */}
        <div className="bg-foreground rounded-3xl p-6 text-background overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-10 bg-background" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">💰</span>
              <div>
                <p className="text-background/60 text-xs font-semibold uppercase tracking-wider">Your Balance</p>
                <p ref={creditsRef} className="text-4xl font-extrabold">0</p>
              </div>
            </div>
            <p className="text-background/50 text-sm">
              Earn credits by joining others. Spend them to post requests ✨
            </p>
          </div>
        </div>
        
        {/* Trust Level */}
        <div className="uber-card-elevated p-5 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🛡️</span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Trust Level</p>
              <TrustBadge level={user?.trustLevel || 'seed'} size="md" />
            </div>
          </div>
          
          {nextTrust && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress to {nextTrust}</span>
                <span className="font-semibold">{user?.completedJoins || 0}/{nextRequirement}</span>
              </div>
              <ProgressBar value={user?.completedJoins || 0} max={nextRequirement || 1} size="md" />
            </div>
          )}
          
          {!nextTrust && (
            <div className="flex items-center gap-2 bg-success/10 rounded-2xl px-4 py-3">
              <span>🏆</span>
              <span className="text-sm font-semibold text-success">Max trust level reached!</span>
            </div>
          )}
          
          <div className="pt-4 border-t border-border/40 space-y-3">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-2xl p-3 text-center">
                <p className="text-xl font-extrabold">{user?.completedJoins || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Joins</p>
              </div>
              <div className="bg-muted/40 rounded-2xl p-3 text-center">
                <p className="text-xl font-extrabold text-success">
                  {user?.trustLevel === 'anchor' ? '-25%' : 
                   user?.trustLevel === 'trusted' ? '-15%' : 
                   user?.trustLevel === 'solid' ? '-5%' : '0%'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Discount</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* How to Earn */}
        <div className="uber-card p-5">
          <h3 className="font-bold text-sm mb-4">How to earn credits 🎯</h3>
          <div className="space-y-3">
            {[
              { emoji: '🤝', amount: '+0.5', action: "Join someone's request" },
              { emoji: '✅', amount: '+1', action: 'Complete a meetup' },
              { emoji: '⭐', amount: '+2', action: 'Get a positive rating' },
              { emoji: '🔥', amount: '+1', action: 'Weekly active bonus' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span>{item.emoji}</span>
                <span className="w-10 text-success font-bold text-sm">{item.amount}</span>
                <span className="text-sm text-muted-foreground">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* History */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm px-1">Recent Activity 📋</h3>
          {creditHistory.length > 0 ? (
            <div className="space-y-2">
              {creditHistory.slice(0, 10).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between uber-card p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{txn.type === 'earn' ? '📈' : '📉'}</span>
                    <div>
                      <p className="text-sm font-semibold">{txn.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(txn.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${txn.type === 'earn' ? 'text-success' : 'text-warning'}`}>
                    {txn.type === 'earn' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 uber-card">
              <span className="text-4xl block mb-3">🏁</span>
              <p className="text-sm text-muted-foreground font-medium">
                No activity yet. Start joining requests!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
