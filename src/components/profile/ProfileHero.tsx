import { MapPin, BadgeCheck, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import type { Badge, User, VerificationStatus, Gender } from '@/types/anybuddy';

interface ProfileHeroProps {
  user: User & { badges: Badge[] };
  joinText: string;
  stats: { value: string | number; label: string }[];
}

function VerificationPill({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
        <ShieldCheck size={10} />
        Verified
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-semibold">
        <Clock size={10} />
        Verification pending
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold">
        <AlertCircle size={10} />
        Verification failed
      </div>
    );
  }
  return (
    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
      Unverified
    </div>
  );
}

export function ProfileHero({ user, joinText, stats }: ProfileHeroProps) {
  const reliabilityColor =
    user.reliabilityScore >= 90 ? 'text-success' :
    user.reliabilityScore >= 70 ? 'text-warning' :
    'text-destructive';

  const verificationStatus: VerificationStatus = user.verificationStatus || 'unverified';

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/20 to-secondary/10" />
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-secondary/8 blur-3xl" />

      <div className="relative liquid-glass-heavy rounded-3xl">
        <div className="flex flex-col items-center px-5 pt-6 pb-4">
          <div className="relative mb-3">
            <div className="w-[80px] h-[80px] rounded-full border-4 border-background shadow-xl overflow-hidden">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            {verificationStatus === 'verified' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-background">
                <BadgeCheck size={13} className="text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>

          <h2 className="text-[22px] font-bold tracking-tight">{user.firstName}</h2>
          <VerificationPill status={verificationStatus} />

          {user.bio && (
            <p className="text-xs text-muted-foreground text-center mt-2.5 leading-relaxed max-w-[260px]">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-primary/60" />
              <span className="text-[11px] font-medium">{user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
            </div>
            <span className="w-px h-3 bg-border/60" />
            <span className="text-[11px] font-medium">{joinText}</span>
          </div>
        </div>

        <div className="border-t border-border/20 grid grid-cols-3 divide-x divide-border/20">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-3.5 gap-0.5">
              <span className={`text-[17px] font-bold tabular-nums ${i === 0 ? reliabilityColor : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}