import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel } from '@/components/icons/CategoryIcon';
import type { Category } from '@/types/anybuddy';

const categoryDemand: Record<Category, number> = {
  chai: 85, explore: 72, shopping: 45, work: 68, help: 90, casual: 55,
  sports: 78, food: 82, walk: 60,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'pricing'>('overview');
  
  const liveRequests = requests.filter(r => new Date(r.expiresAt) > new Date()).length;
  const totalParticipants = requests.reduce((acc, r) => acc + r.seatsTaken, 0);
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <TopBar showBack title="🛡️ Admin" />
      <div className="flex max-w-md mx-auto border-b border-border/15">
        {(['overview', 'moderation', 'pricing'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="px-5 pt-3 space-y-4 pb-8">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="liquid-glass p-3.5">
                <p className="text-2xs text-muted-foreground mb-1">Live Requests</p>
                <p className="text-heading font-bold text-primary">{liveRequests}</p>
              </div>
              <div className="liquid-glass p-3.5">
                <p className="text-2xs text-muted-foreground mb-1">Active Users</p>
                <p className="text-heading font-bold text-secondary">{totalParticipants + liveRequests}</p>
              </div>
            </div>
            
            <div className="liquid-glass-heavy p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">CATEGORY DEMAND</h3>
              <div className="space-y-2.5">
                {(Object.entries(categoryDemand) as [Category, number][]).map(([cat, demand]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{getCategoryLabel(cat)}</span>
                      <span className={demand > 80 ? 'text-warning font-semibold' : 'text-muted-foreground'}>{demand}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${demand > 80 ? 'bg-warning' : demand > 60 ? 'bg-primary' : 'bg-secondary'}`}
                        style={{ width: `${demand}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'moderation' && (
          <div className="liquid-glass p-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ v: '847', l: 'Approved', c: 'text-success' }, { v: '23', l: 'Flagged', c: 'text-warning' }, { v: '12', l: 'Rejected', c: 'text-destructive' }].map((s, i) => (
                <div key={i} className="text-center py-2">
                  <p className={`text-title font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-2xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">AI CHECKS</h3>
            {['Sexual/Explicit', 'Hate/Harassment', 'Scam patterns', 'Spam behavior'].map((check) => (
              <div key={check} className="flex justify-between py-2 border-b border-border/15 text-xs last:border-0">
                <span>{check}</span><span className="text-success font-semibold">Active ✓</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'pricing' && (
          <div className="liquid-glass-heavy p-4 specular-highlight" style={{ borderRadius: '1rem' }}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">CREDIT PRICING</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1"><span>Base cost</span><span className="font-semibold">1 credit</span></div>
              <div className="border-t border-border/15 pt-2 space-y-1 text-muted-foreground">
                <div className="flex justify-between"><span>Right Now</span><span>+0.5</span></div>
                <div className="flex justify-between"><span>Today</span><span>+0.25</span></div>
                <div className="flex justify-between"><span>This Week</span><span>+0</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
