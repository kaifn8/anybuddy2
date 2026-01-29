import { Coffee, Compass, ShoppingBag, Laptop, HandHelping, Sparkles } from 'lucide-react';
import type { Category } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: Category;
  className?: string;
  size?: number;
}

const iconMap = {
  chai: Coffee,
  explore: Compass,
  shopping: ShoppingBag,
  work: Laptop,
  help: HandHelping,
  casual: Sparkles,
};

const colorMap = {
  chai: 'text-warning',
  explore: 'text-secondary',
  shopping: 'text-primary',
  work: 'text-foreground',
  help: 'text-success',
  casual: 'text-accent-foreground',
};

const bgMap = {
  chai: 'bg-warning/10',
  explore: 'bg-secondary/10',
  shopping: 'bg-primary/10',
  work: 'bg-muted',
  help: 'bg-success/10',
  casual: 'bg-accent/15',
};

export function CategoryIcon({ category, className, size = 18 }: CategoryIconProps) {
  const Icon = iconMap[category];
  
  return (
    <div className={cn(
      'inline-flex items-center justify-center rounded-xl p-2.5',
      bgMap[category],
      className
    )}>
      <Icon size={size} className={colorMap[category]} strokeWidth={1.5} />
    </div>
  );
}

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    chai: 'Chai & Food',
    explore: 'Explore',
    shopping: 'Shopping',
    work: 'Work-along',
    help: 'Help',
    casual: 'Casual',
  };
  return labels[category];
}
