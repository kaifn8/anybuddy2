import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  className?: string;
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="h-2.5 w-2.5 rounded-full bg-success" />
        <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-success animate-pulse-ring" />
      </div>
      <span className="text-sm font-semibold text-success">Live Now</span>
    </div>
  );
}
