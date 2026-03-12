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
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-semibold" style={{
        background: 'rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.9)',
      }}>
        <ShieldCheck size={10} />
        Verified
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-warning/20 text-warning text-[10px] font-semibold">
        <Clock size={10} />
        Pending
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-destructive/20 text-destructive text-[10px] font-semibold">
        <AlertCircle size={10} />
        Failed
      </div>
    );
  }
  return (
    <div className="px-2.5 py-[3px] rounded-full text-[10px] font-medium" style={{
      background: 'rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.5)',
    }}>
      Unverified
    </div>
  );
}

export function ProfileHero({ user, joinText, stats }: ProfileHeroProps) {
  const verificationStatus: VerificationStatus = user.verificationStatus || 'unverified';

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: '24px' }}>
      {/* Dark gradient background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4c1d95 100%)',
      }} />
      {/* Soft glow accents */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-20" style={{
        background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
      }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-15" style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
      }} />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
      }} />

      <div className="relative z-10">
        {/* Top section */}
        <div className="flex flex-col items-center px-5 pt-7 pb-5">
          {/* Avatar */}
          <div className="relative mb-3.5">
            <div className="w-[82px] h-[82px] rounded-full overflow-hidden" style={{
              border: '3px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            }}>
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            {verificationStatus === 'verified' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{
                background: 'linear-gradient(135deg, hsl(213 94% 55%), hsl(250 85% 60%))',
                border: '2px solid rgba(15,23,42,0.8)',
              }}>
                <BadgeCheck size={13} className="text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-[22px] font-bold tracking-tight text-white">{user.firstName}</h2>
          
          {/* Gender + verification */}
          <div className="flex items-center gap-2 mt-1.5">
            {user.gender && (
              <span className="text-[11px] font-medium capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'} {user.gender}
              </span>
            )}
            <VerificationPill status={verificationStatus} />
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-[12px] text-center mt-3 leading-relaxed max-w-[260px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {user.bio}
            </p>
          )}

          {/* Location + join date */}
          <div className="flex items-center gap-3 mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <div className="flex items-center gap-1">
              <MapPin size={11} />
              <span className="text-[11px] font-medium">{user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
            </div>
            <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <span className="text-[11px] font-medium">{joinText}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-3.5 gap-0.5" style={{
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : undefined,
            }}>
              <span className="text-[17px] font-bold tabular-nums text-white">
                {stat.value}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
