import { Zap, Sun, Calendar } from 'lucide-react';
import type { Urgency } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

interface UrgencyBadgeProps {
  urgency: Urgency;
  className?: string;
}

const iconMap = {
  now: Zap,
  today: Sun,
  week: Calendar,
};

const styleMap = {
  now: 'badge-now',
  today: 'badge-today',
  week: 'badge-week',
};

const labelMap: Record<Urgency, string> = {
  now: 'Now',
  today: 'Today',
  week: 'This Week',
};

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const Icon = iconMap[urgency];
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
      styleMap[urgency],
      className
    )}>
      <Icon size={12} />
      <span>{labelMap[urgency]}</span>
    </div>
  );
}
