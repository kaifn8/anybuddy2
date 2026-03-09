import { useState, useMemo } from 'react';
import { generateFakeReports, generateModerationLogs, type AdminReport, type ModerationLog } from '@/data/adminData';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Shield, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function AdminModeration() {
  const [reports] = useState<AdminReport[]>(() => generateFakeReports(15));
  const [modLogs] = useState<ModerationLog[]>(() => generateModerationLogs(20));
  const [activeTab, setActiveTab] = useState<'reports' | 'logs'>('reports');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('all');

  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter(r => r.status === filter);
  }, [reports, filter]);

  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-warning/15 text-warning',
    reviewed: 'bg-primary/15 text-primary',
    dismissed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Reports & Moderation</h2>
        <p className="text-sm text-muted-foreground">{pendingReports} pending reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border/30 bg-background/60 p-3 text-center">
          <p className="text-lg font-bold text-warning">{pendingReports}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Pending</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-3 text-center">
          <p className="text-lg font-bold text-primary">{reports.filter(r => r.status === 'reviewed').length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Reviewed</p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-background/60 p-3 text-center">
          <p className="text-lg font-bold text-muted-foreground">{reports.filter(r => r.status === 'dismissed').length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Dismissed</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1.5 bg-muted/40 p-1 rounded-2xl">
        {(['reports', 'logs'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('flex-1 py-2 text-xs font-semibold rounded-xl transition-all tap-scale capitalize',
              activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}>
            {tab === 'reports' ? `Reports (${pendingReports})` : 'AI Mod Logs'}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-3">
          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {(['all', 'pending', 'reviewed', 'dismissed'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all capitalize',
                  filter === f ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
                )}>
                {f}
              </button>
            ))}
          </div>

          {/* Reports list */}
          {filteredReports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-border/30 bg-background/60 p-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} className="text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold">{report.reason}</p>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full capitalize', STATUS_STYLES[report.status])}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mb-1.5">{report.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>📢 {report.reporterName}</span>
                    <span>→ {report.targetName}</span>
                    <span>{report.targetType === 'plan' ? '📍 Plan' : '👤 User'}</span>
                    <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-2.5 border-t border-border/15">
                  <Button variant="ghost" size="sm" className="flex-1 h-8 text-[11px]">
                    <XCircle size={12} className="mr-1" /> Dismiss
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]">
                    <Shield size={12} className="mr-1" /> Warn User
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 h-8 text-[11px]">
                    <AlertTriangle size={12} className="mr-1" /> Action
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-2">
          {/* AI checks status */}
          <div className="rounded-2xl border border-border/30 bg-background/60 p-4 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">AI Safety Checks</h3>
            {['Sexual/Explicit', 'Hate/Harassment', 'Scam patterns', 'Spam behavior', 'Underage content'].map((check) => (
              <div key={check} className="flex justify-between py-2 border-b border-border/10 text-xs last:border-0">
                <span>{check}</span>
                <span className="text-primary font-semibold flex items-center gap-1"><Bot size={10} /> Active ✓</span>
              </div>
            ))}
          </div>

          {/* Mod log entries */}
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Actions</h3>
          {modLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-background/40">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                log.by === 'AI System' ? 'bg-secondary/15' : 'bg-primary/10'
              )}>
                {log.by === 'AI System' ? <Bot size={12} className="text-secondary" /> : <User size={12} className="text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{log.action}</p>
                <p className="text-[10px] text-muted-foreground">
                  {log.target} · {log.reason} · <span className="font-medium">{log.by}</span>
                </p>
              </div>
              <span className="text-[9px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
