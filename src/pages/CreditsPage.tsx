import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, TrendingUp, TrendingDown, Shield, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();
  const { user, creditHistory } = useAppStore();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLParagraphElement>(null);
  
  const currentTrustIndex = trustProgression.indexOf(user?.trustLevel || 'seed');
  const nextTrust = trustProgression[currentTrustIndex + 1];
  const nextRequirement = nextTrust ? trustRequirements[nextTrust].joins : null;
  const progress = nextRequirement 
    ? Math.min(100, ((user?.completedJoins || 0) / nextRequirement) * 100)
    : 100;
  
  // Entry animations
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
    
    // Animate credit count
    if (creditsRef.current && user?.credits) {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: user.credits,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          if (creditsRef.current) {
            creditsRef.current.textContent = Math.round(obj.value).toString();
          }
        },
      });
    }
  }, [user?.credits]);
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <PageHeader title="Credits & Trust" />
      
      <div ref={contentRef} className="px-5 space-y-5">
        {/* Credit Balance */}
        <div className="gradient-primary rounded-3xl p-6 text-white overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Coins size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Your Balance</p>
                <p ref={creditsRef} className="text-4xl font-bold">0</p>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              Credits are used to post requests. Earn more by joining others!
            </p>
          </div>
        </div>
        
        {/* Trust Level */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield size={22} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Trust Level</p>
              <TrustBadge level={user?.trustLevel || 'seed'} size="md" />
            </div>
          </div>
          
          {nextTrust && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress to {nextTrust}</span>
                <span className="font-medium">{user?.completedJoins || 0}/{nextRequirement}</span>
              </div>
              <ProgressBar value={user?.completedJoins || 0} max={nextRequirement || 1} size="md" />
            </div>
          )}
          
          {!nextTrust && (
            <div className="flex items-center gap-2 text-success bg-success/10 rounded-xl px-4 py-3">
              <Sparkles size={16} />
              <span className="text-sm font-medium">You've reached the highest trust level!</span>
            </div>
          )}
          
          <div className="pt-4 border-t border-border/50 space-y-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Benefits</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-lg font-semibold">{user?.completedJoins || 0}</p>
                <p className="text-xs text-muted-foreground">Joins</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-lg font-semibold text-success">
                  {user?.trustLevel === 'anchor' ? '-25%' : 
                   user?.trustLevel === 'trusted' ? '-15%' : 
                   user?.trustLevel === 'solid' ? '-5%' : '0%'}
                </p>
                <p className="text-xs text-muted-foreground">Cost Reduction</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* How to Earn */}
        <div className="glass-card p-5 bg-accent/5 border-accent/10">
          <h3 className="font-semibold text-sm mb-4">How to earn credits</h3>
          <div className="space-y-3">
            {[
              { amount: '+0.5', action: 'Join someone\'s request' },
              { amount: '+1', action: 'Complete a meetup' },
              { amount: '+2', action: 'Get a positive rating' },
              { amount: '+1', action: 'Weekly active bonus' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-10 text-success font-semibold text-sm">{item.amount}</span>
                <span className="text-sm text-muted-foreground">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm px-1">Recent Activity</h3>
          {creditHistory.length > 0 ? (
            <div className="space-y-2">
              {creditHistory.slice(0, 10).map((txn) => (
                <div 
                  key={txn.id}
                  className="flex items-center justify-between glass-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      txn.type === 'earn' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      {txn.type === 'earn' ? (
                        <TrendingUp size={16} className="text-success" strokeWidth={2} />
                      ) : (
                        <TrendingDown size={16} className="text-warning" strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(txn.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    txn.type === 'earn' ? 'text-success' : 'text-warning'
                  }`}>
                    {txn.type === 'earn' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card">
              <p className="text-sm text-muted-foreground">
                No transactions yet. Start joining requests!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
