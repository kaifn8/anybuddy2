import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrustBadge } from '@/components/ui/TrustBadge';
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
  
  const currentTrustIndex = trustProgression.indexOf(user?.trustLevel || 'seed');
  const nextTrust = trustProgression[currentTrustIndex + 1];
  const nextRequirement = nextTrust ? trustRequirements[nextTrust].joins : null;
  const progress = nextRequirement 
    ? Math.min(100, ((user?.completedJoins || 0) / nextRequirement) * 100)
    : 100;
  
  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold">Credits & Trust</h1>
        </div>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Credit Balance */}
        <div className="gradient-primary rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Coins size={28} />
            </div>
            <div>
              <p className="text-white/80 text-sm">Your Balance</p>
              <p className="text-4xl font-bold">{user?.credits ?? 0}</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Credits are used to post requests. Earn more by joining others!
          </p>
        </div>
        
        {/* Trust Level */}
        <div className="bg-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-xl p-3">
                <Shield size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trust Level</p>
                <TrustBadge level={user?.trustLevel || 'seed'} size="md" />
              </div>
            </div>
          </div>
          
          {nextTrust && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextTrust}</span>
                <span className="font-medium">{user?.completedJoins || 0}/{nextRequirement}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-secondary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {!nextTrust && (
            <p className="text-sm text-success font-medium">
              🏆 You've reached the highest trust level!
            </p>
          )}
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Trust Level Benefits</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Completed joins</span>
                <span className="font-medium">{user?.completedJoins || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Credit cost reduction</span>
                <span className="font-medium text-success">
                  {user?.trustLevel === 'anchor' ? '-25%' : 
                   user?.trustLevel === 'trusted' ? '-15%' : 
                   user?.trustLevel === 'solid' ? '-5%' : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* How to Earn */}
        <div className="bg-accent/20 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">How to earn credits</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-success">+0.5</span> Join someone's request
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success">+1</span> Complete a meetup
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success">+2</span> Get a positive rating
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success">+1</span> Weekly active bonus
            </li>
          </ul>
        </div>
        
        {/* Transaction History */}
        <div>
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          {creditHistory.length > 0 ? (
            <div className="space-y-2">
              {creditHistory.slice(0, 10).map((txn) => (
                <div 
                  key={txn.id}
                  className="flex items-center justify-between bg-card rounded-xl p-3 card-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${
                      txn.type === 'earn' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      {txn.type === 'earn' ? (
                        <TrendingUp size={16} className="text-success" />
                      ) : (
                        <TrendingDown size={16} className="text-warning" />
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet. Start joining requests!
            </p>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
