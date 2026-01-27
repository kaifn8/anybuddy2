import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Eye, Ban, Activity, Zap, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel } from '@/components/icons/CategoryIcon';
import type { Category } from '@/types/anybuddy';

interface ModerationLog {
  id: string;
  action: 'approved' | 'rejected' | 'flagged';
  reason: string;
  content: string;
  timestamp: Date;
}

const fakeModerationLogs: ModerationLog[] = [
  { id: '1', action: 'approved', reason: 'Clean content', content: 'Anyone for chai?', timestamp: new Date(Date.now() - 300000) },
  { id: '2', action: 'rejected', reason: 'Spam detected', content: 'Buy crypto now!!!', timestamp: new Date(Date.now() - 600000) },
  { id: '3', action: 'flagged', reason: 'Review needed', content: 'Looking for...(ambiguous)', timestamp: new Date(Date.now() - 900000) },
  { id: '4', action: 'approved', reason: 'Clean content', content: 'Gym buddy needed', timestamp: new Date(Date.now() - 1200000) },
  { id: '5', action: 'rejected', reason: 'Harassment pattern', content: '[Content removed]', timestamp: new Date(Date.now() - 1500000) },
];

const categoryDemand: Record<Category, number> = {
  chai: 85,
  explore: 72,
  shopping: 45,
  work: 68,
  help: 90,
  casual: 55,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'pricing'>('overview');
  
  const liveRequests = requests.filter(r => new Date(r.expiresAt) > new Date()).length;
  const totalParticipants = requests.reduce((acc, r) => acc + r.seatsTaken, 0);
  
  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate('/home')} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <h1 className="text-xl font-display font-bold">Admin Panel</h1>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-border">
          {(['overview', 'moderation', 'pricing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>
      
      <div className="p-4 space-y-6 pb-8">
        {activeTab === 'overview' && (
          <>
            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Live Requests</span>
                </div>
                <p className="text-3xl font-bold text-primary">{liveRequests}</p>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={18} className="text-secondary" />
                  <span className="text-sm text-muted-foreground">Active Users</span>
                </div>
                <p className="text-3xl font-bold text-secondary">{totalParticipants + liveRequests}</p>
              </div>
            </div>
            
            {/* Category Demand Heatmap */}
            <div className="bg-card rounded-2xl p-5 card-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Category Demand
              </h3>
              <div className="space-y-3">
                {(Object.entries(categoryDemand) as [Category, number][]).map(([cat, demand]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{getCategoryLabel(cat)}</span>
                      <span className={`font-medium ${
                        demand > 80 ? 'text-warning' : 
                        demand > 60 ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {demand}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all rounded-full ${
                          demand > 80 ? 'bg-warning' : 
                          demand > 60 ? 'bg-primary' : 'bg-secondary'
                        }`}
                        style={{ width: `${demand}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Live Map Placeholder */}
            <div className="bg-card rounded-2xl p-5 card-shadow">
              <h3 className="font-semibold mb-4">Live Request Map</h3>
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Map visualization</p>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'moderation' && (
          <>
            {/* AI Moderation Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-success/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-success">847</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="bg-warning/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-warning">23</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
              <div className="bg-destructive/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-destructive">12</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
            
            {/* Moderation Logs */}
            <div>
              <h3 className="font-semibold mb-3">Recent Moderation</h3>
              <div className="space-y-2">
                {fakeModerationLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-3 bg-card rounded-xl p-3 card-shadow"
                  >
                    <div className={`rounded-lg p-2 shrink-0 ${
                      log.action === 'approved' ? 'bg-success/10' :
                      log.action === 'rejected' ? 'bg-destructive/10' : 'bg-warning/10'
                    }`}>
                      {log.action === 'approved' ? <Eye size={16} className="text-success" /> :
                       log.action === 'rejected' ? <Ban size={16} className="text-destructive" /> :
                       <AlertTriangle size={16} className="text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.content}</p>
                      <p className="text-xs text-muted-foreground">{log.reason}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      log.action === 'approved' ? 'bg-success/10 text-success' :
                      log.action === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI Checks */}
            <div className="bg-card rounded-2xl p-5 card-shadow">
              <h3 className="font-semibold mb-3">AI Content Checks</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between py-2 border-b border-border">
                  <span>Sexual/Explicit content</span>
                  <span className="text-success">Active ✓</span>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-border">
                  <span>Hate/Harassment</span>
                  <span className="text-success">Active ✓</span>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-border">
                  <span>Scam patterns</span>
                  <span className="text-success">Active ✓</span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span>Spam behavior</span>
                  <span className="text-success">Active ✓</span>
                </li>
              </ul>
            </div>
          </>
        )}
        
        {activeTab === 'pricing' && (
          <>
            {/* Credit Pricing */}
            <div className="bg-card rounded-2xl p-5 card-shadow">
              <h3 className="font-semibold mb-4">Credit Pricing</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Base cost</span>
                    <span className="font-medium">1 credit</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">Urgency Modifiers</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Right Now</span>
                      <span>+0.5 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today</span>
                      <span>+0.25 credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span>+0 credits</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">Trust Discounts</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Seed</span>
                      <span>0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solid</span>
                      <span>-5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trusted</span>
                      <span>-15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anchor</span>
                      <span>-25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Demand-based pricing */}
            <div className="bg-accent/20 rounded-2xl p-5">
              <h3 className="font-semibold mb-2">Dynamic Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Categories with high demand (80%+) have a +0.25 credit surcharge to balance supply and demand.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
