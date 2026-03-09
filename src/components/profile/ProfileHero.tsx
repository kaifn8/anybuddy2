import { MapPin, Calendar, BadgeCheck, ShieldCheck } from 'lucide-react';
import type { Badge, User } from '@/types/anybuddy';

interface ProfileHeroProps {
  user: User & { badges: Badge[] };
  joinText: string;
  badgeLabels: Record<Badge, { emoji: string; label: string }>;
}

export function ProfileHero({ user, joinText }: ProfileHeroProps) {
  const reliabilityColor =
    user.reliabilityScore >= 90 ? 'text-success bg-success/10' :
    user.reliabilityScore >= 70 ? 'text-warning bg-warning/10' :
    'text-destructive bg-destructive/10';

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/6 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-secondary/6 blur-3xl" />

      <div className="relative liquid-glass-heavy rounded-3xl px-5 pt-6 pb-5">

        {/* Avatar — centered, large */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-xl"
            />
            {/* Verification ring */}
            {user.isVerified && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-md">
                <BadgeCheck size={16} className="text-primary" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Name + verification label */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-xl font-bold tracking-tight">{user.firstName}</h2>
            </div>
            {user.isVerified ? (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                <ShieldCheck size={10} />
                Verified Member
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
                Not verified
              </div>
            )}
          </div>
        </div>

        {/* 3-column info grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Reliability */}
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-background/40">
            <span className={`text-base font-bold tabular-nums ${reliabilityColor} px-2 py-0.5 rounded-lg text-sm`}>
              {user.reliabilityScore}%
            </span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Reliable</span>
          </div>

          {/* Location */}
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-background/40">
            <MapPin size={16} className="text-primary" />
            <span className="text-[10px] text-foreground font-semibold truncate w-full text-center leading-tight">
              {user.zone || user.city}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Location</span>
          </div>

          {/* Join date */}
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-background/40">
            <Calendar size={16} className="text-secondary" />
            <span className="text-[10px] text-foreground font-semibold truncate w-full text-center leading-tight">
              {joinText.replace('Joined ', '')}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Joined</span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}
