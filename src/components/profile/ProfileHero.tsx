import { MapPin, BadgeCheck, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import type { Badge, User, VerificationStatus } from '@/types/anybuddy';

interface ProfileHeroProps {
  user: User & { badges: Badge[] };
  joinText: string;
  stats: { value: string | number; label: string }[];
}

function VerificationPill({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
        <ShieldCheck size={10} />
        Verified
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-warning/15 text-warning text-[10px] font-semibold">
        <Clock size={10} />
        Pending
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-destructive/15 text-destructive text-[10px] font-semibold">
        <AlertCircle size={10} />
        Failed
      </div>
    );
  }
  return (
    <div className="px-2.5 py-[3px] rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
      Unverified
    </div>
  );
}

export function ProfileHero({ user, joinText, stats }: ProfileHeroProps) {
  const verificationStatus: VerificationStatus = user.verificationStatus || 'unverified';

  return (
    <div className="relative overflow-hidden rounded-[24px]" style={{
      background: 'hsl(var(--glass-bg))',
      backdropFilter: 'blur(var(--glass-blur-heavy))',
      boxShadow: '0 4px 24px hsl(var(--glass-shadow)), 0 0 0 1px hsl(var(--glass-border))',
    }}>
      {/* Soft gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-28 opacity-[0.06]" style={{
        background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, transparent 100%)',
      }} />

      <div className="relative z-10">
        {/* Profile content */}
        <div className="flex flex-col items-center px-6 pt-7 pb-5">
          {/* Avatar */}
          <div className="relative mb-3.5">
            <div className="w-[84px] h-[84px] rounded-full p-[2.5px]" style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.2))',
            }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-card" style={{
                boxShadow: '0 6px 20px hsl(var(--glass-shadow))',
              }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {verificationStatus === 'verified' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center bg-primary shadow-md" style={{
                boxShadow: '0 2px 8px hsl(var(--primary) / 0.35), 0 0 0 2px hsl(var(--background))',
              }}>
                <BadgeCheck size={13} className="text-primary-foreground" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-[22px] font-bold tracking-tight text-foreground">{user.firstName}</h2>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5">
            {user.gender && (
              <span className="text-[11px] font-medium capitalize text-muted-foreground">
                {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'} {user.gender}
              </span>
            )}
            <VerificationPill status={verificationStatus} />
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-[12px] text-center mt-3 leading-[1.6] max-w-[250px] text-muted-foreground">
              {user.bio}
            </p>
          )}

          {/* Location + join date */}
          <div className="flex items-center gap-3 mt-3 text-muted-foreground/60">
            <div className="flex items-center gap-1">
              <MapPin size={10} />
              <span className="text-[10.5px] font-medium">{user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
            </div>
            <span className="w-px h-2.5 bg-border" />
            <span className="text-[10.5px] font-medium">{joinText}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-4 mb-4 grid grid-cols-3 overflow-hidden rounded-2xl" style={{
          background: 'hsl(var(--muted) / 0.4)',
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-3.5 gap-1" style={{
              borderRight: i < 2 ? '1px solid hsl(var(--border) / 0.5)' : undefined,
            }}>
              <span className="text-[18px] font-bold tabular-nums text-foreground">
                {stat.value}
              </span>
              <span className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
