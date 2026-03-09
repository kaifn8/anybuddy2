import { useState, useMemo } from 'react';
import { Search, ChevronDown, ShieldCheck, ShieldAlert, Ban, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateFakeUsers, type AdminUser } from '@/data/adminData';
import { cn } from '@/lib/utils';
import type { TrustLevel } from '@/types/anybuddy';
import { format } from 'date-fns';

const TRUST_COLORS: Record<TrustLevel, string> = {
  seed: 'bg-muted text-muted-foreground',
  solid: 'bg-secondary/20 text-secondary',
  trusted: 'bg-primary/15 text-primary',
  anchor: 'bg-warning/15 text-warning',
};

const VERIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  unverified: { label: 'Unverified', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', color: 'bg-warning/15 text-warning' },
  verified: { label: 'Verified', color: 'bg-primary/15 text-primary' },
  failed: { label: 'Failed', color: 'bg-destructive/15 text-destructive' },
};

export default function AdminUsers() {
  const [users] = useState<AdminUser[]>(() => generateFakeUsers(30));
  const [search, setSearch] = useState('');
  const [trustFilter, setTrustFilter] = useState<TrustLevel | 'all'>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (search && !u.firstName.toLowerCase().includes(search.toLowerCase()) && !u.id.includes(search)) return false;
      if (trustFilter !== 'all' && u.trustLevel !== trustFilter) return false;
      if (verificationFilter !== 'all' && u.verificationStatus !== verificationFilter) return false;
      return true;
    });
  }, [users, search, trustFilter, verificationFilter]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="hidden lg:block mb-5">
        <h2 className="text-xl font-bold">User Management</h2>
        <p className="text-sm text-muted-foreground">{users.length} total users · {users.filter(u => u.isFlagged).length} flagged</p>
      </div>

      {/* Filters */}
      <div className="space-y-2.5 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(['all', 'seed', 'solid', 'trusted', 'anchor'] as const).map((level) => (
            <button key={level} onClick={() => setTrustFilter(level)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all capitalize',
                trustFilter === level ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {level === 'all' ? 'All trust' : level}
            </button>
          ))}
          <span className="w-px h-6 bg-border/30 self-center mx-0.5" />
          {(['all', 'verified', 'pending', 'unverified', 'failed'] as const).map((status) => (
            <button key={status} onClick={() => setVerificationFilter(status)}
              className={cn('shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tap-scale transition-all capitalize',
                verificationFilter === status ? 'bg-foreground text-background' : 'bg-foreground/[0.03] text-muted-foreground'
              )}>
              {status === 'all' ? 'All status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
            className={cn(
              'w-full text-left rounded-2xl border p-3 transition-all tap-scale',
              selectedUser?.id === user.id
                ? 'border-primary/30 bg-primary/[0.03] shadow-sm'
                : 'border-border/20 bg-background/60 hover:border-border/40'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full" />
                {user.isBanned && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                    <Ban size={8} className="text-white" />
                  </div>
                )}
                {user.isFlagged && !user.isBanned && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-warning flex items-center justify-center">
                    <Flag size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{user.firstName}</p>
                  {user.verificationStatus === 'verified' && <ShieldCheck size={12} className="text-primary shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground">{user.zone}, {user.city} · Joined {format(new Date(user.joinedAt), 'MMM d')}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full capitalize', TRUST_COLORS[user.trustLevel])}>
                  {user.trustLevel}
                </span>
                <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', VERIFICATION_LABELS[user.verificationStatus].color)}>
                  {VERIFICATION_LABELS[user.verificationStatus].label}
                </span>
              </div>
            </div>

            {/* Expanded detail */}
            {selectedUser?.id === user.id && (
              <div className="mt-3 pt-3 border-t border-border/15 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div><p className="text-sm font-bold">{user.reliabilityScore}%</p><p className="text-[9px] text-muted-foreground">Reliable</p></div>
                  <div><p className="text-sm font-bold">{user.meetupsAttended}</p><p className="text-[9px] text-muted-foreground">Attended</p></div>
                  <div><p className="text-sm font-bold">{user.meetupsHosted}</p><p className="text-[9px] text-muted-foreground">Hosted</p></div>
                  <div><p className="text-sm font-bold text-destructive">{user.noShows}</p><p className="text-[9px] text-muted-foreground">No-shows</p></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px]">
                    <Flag size={12} className="mr-1" /> {user.isFlagged ? 'Unflag' : 'Flag'}
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 h-8 text-[11px]">
                    <Ban size={12} className="mr-1" /> {user.isBanned ? 'Unban' : 'Ban'}
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 h-8 text-[11px]">
                    <ChevronDown size={12} className="mr-1" /> Trust ↕
                  </Button>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-sm text-muted-foreground">No users match your filters</p>
        </div>
      )}
    </div>
  );
}
