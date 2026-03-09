import { Shield, ShieldCheck, ShieldPlus, Star } from 'lucide-react';
import type { TrustLevel } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  level: TrustLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap = {
  seed: Shield,
  solid: ShieldCheck,
  trusted: ShieldPlus,
  anchor: Star,
};

const styleMap = {
  seed: 'trust-seed',
  solid: 'trust-solid',
  trusted: 'trust-trusted',
  anchor: 'trust-anchor',
};

const labelMap: Record<TrustLevel, string> = {
  seed: 'New',
  solid: 'Verified',
  trusted: 'Trusted',
  anchor: 'Star',
};

const sizeMap = {
  sm: 'text-2xs px-1.5 py-0.5 gap-0.5',
  md: 'text-xs px-2 py-0.5 gap-1',
  lg: 'text-sm px-2.5 py-1 gap-1',
};

const iconSizeMap = {
  sm: 10,
  md: 12,
  lg: 14,
};

import React from 'react';

export const TrustBadge = React.forwardRef<HTMLDivElement, TrustBadgeProps>(
  ({ level, showLabel = true, size = 'sm', className }, ref) => {
    const Icon = iconMap[level];
    
    return (
      <div ref={ref} className={cn(
        'inline-flex items-center rounded-full font-medium',
        styleMap[level],
        sizeMap[size],
        className
      )}>
        <Icon size={iconSizeMap[size]} strokeWidth={2} />
        {showLabel && <span>{labelMap[level]}</span>}
      </div>
    );
  }
);
TrustBadge.displayName = 'TrustBadge';
