import { MapPin, Calendar } from 'lucide-react';
import type { Badge, User } from '@/types/anybuddy';

interface ProfileHeroProps {
  user: User & { badges: Badge[] };
  joinText: string;
  badgeLabels: Record<Badge, { emoji: string; label: string }>;
}

export function ProfileHero({ user, joinText, badgeLabels }: ProfileHeroProps) {
  const memberStatus = user.badges.includes('early_adopter') ? 'Early member' : 'New member';

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-secondary/5 blur-2xl" />
      
      <div className="relative liquid-glass-heavy p-4 rounded-3xl">
        {/* Avatar + Name row */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName} 
              className="w-[64px] h-[64px] rounded-2xl object-cover border-2 border-border/30 shadow-lg" 
            />
            {user.isVerified && (
              <span className="absolute -bottom-1 -right-1 text-sm bg-background rounded-full p-0.5 shadow-sm">✅</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{user.firstName}</h2>
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>
        
        {/* Meta pills */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin size={12} className="text-muted-foreground/60" />
            <span className="text-[11px]">{user.zone ? `${user.zone}, ${user.city}` : user.city}</span>
          </div>
          <div className="w-px h-3 bg-border/40" />
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-[11px]">⭐</span>
            <span className="text-[11px] font-medium">{memberStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
