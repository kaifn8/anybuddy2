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
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-semibold"
        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
        <ShieldCheck size={10} />
        Verified
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-semibold"
        style={{ background: 'rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.9)' }}>
        <Clock size={10} />
        Pending
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-semibold"
        style={{ background: 'rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.9)' }}>
        <AlertCircle size={10} />
        Failed
      </div>
    );
  }
  return (
    <div className="px-2.5 py-[3px] rounded-full text-[10px] font-medium"
      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
      Unverified
    </div>
  );
}

export function ProfileHero({ user, joinText, stats }: ProfileHeroProps) {
  const verificationStatus: VerificationStatus = user.verificationStatus || 'unverified';

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: '28px' }}>
      {/* Layered gradient — deep ink with warm accent */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(165deg, hsl(230 25% 8%) 0%, hsl(245 30% 12%) 30%, hsl(260 35% 16%) 55%, hsl(275 30% 14%) 80%, hsl(240 25% 10%) 100%)',
      }} />
      {/* Ambient orbs */}
      <div className="absolute -top-10 -right-10 w-52 h-52 opacity-25" style={{
        background: 'radial-gradient(circle, hsl(260 80% 65% / 0.5) 0%, transparent 65%)',
        filter: 'blur(30px)',
      }} />
      <div className="absolute -bottom-8 -left-8 w-44 h-44 opacity-20" style={{
        background: 'radial-gradient(circle, hsl(210 90% 60% / 0.4) 0%, transparent 65%)',
        filter: 'blur(25px)',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.07]" style={{
        background: 'radial-gradient(circle, hsl(280 60% 50%) 0%, transparent 50%)',
        filter: 'blur(40px)',
      }} />
      {/* Subtle grain */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      }} />

      <div className="relative z-10">
        {/* Profile content */}
        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          {/* Avatar with ring */}
          <div className="relative mb-4">
            <div className="w-[88px] h-[88px] rounded-full p-[3px]" style={{
              background: 'linear-gradient(135deg, hsl(260 70% 60% / 0.4), hsl(210 80% 55% / 0.3), hsl(280 60% 50% / 0.2))',
            }}>
              <div className="w-full h-full rounded-full overflow-hidden" style={{
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {verificationStatus === 'verified' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(213 94% 55%), hsl(250 85% 60%))',
                boxShadow: '0 4px 14px rgba(99,102,241,0.4), 0 0 0 2.5px hsl(245 30% 12%)',
              }}>
                <BadgeCheck size={14} className="text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-[24px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {user.firstName}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2">
            {user.gender && (
              <span className="text-[11px] font-medium capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'} {user.gender}
              </span>
            )}
            <VerificationPill status={verificationStatus} />
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-[12px] text-center mt-3.5 leading-[1.6] max-w-[250px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {user.bio}
            </p>
          )}

          {/* Location + join date */}
          <div className="flex items-center gap-3 mt-3.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <div className="flex items-center gap-1">
              <MapPin size={10} />
              <span className="text-[10.5px] font-medium">{user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
            </div>
            <span className="w-px h-2.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-[10.5px] font-medium">{joinText}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-4 mb-4 grid grid-cols-3 gap-px overflow-hidden" style={{
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-3.5 gap-1" style={{
              background: 'rgba(255,255,255,0.03)',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.04)' : undefined,
            }}>
              <span className="text-[18px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {stat.value}
              </span>
              <span className="text-[8.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
