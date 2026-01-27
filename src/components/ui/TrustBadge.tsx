import { Shield, ShieldCheck, ShieldPlus, Anchor } from 'lucide-react';
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
  anchor: Anchor,
};

const styleMap = {
  seed: 'trust-seed',
  solid: 'trust-solid',
  trusted: 'trust-trusted',
  anchor: 'trust-anchor',
};

const labelMap: Record<TrustLevel, string> = {
  seed: 'Seed',
  solid: 'Solid',
  trusted: 'Trusted',
  anchor: 'Anchor',
};

const sizeMap = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizeMap = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function TrustBadge({ level, showLabel = true, size = 'sm', className }: TrustBadgeProps) {
  const Icon = iconMap[level];
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      styleMap[level],
      sizeMap[size],
      className
    )}>
      <Icon size={iconSizeMap[size]} />
      {showLabel && <span>{labelMap[level]}</span>}
    </div>
  );
}
