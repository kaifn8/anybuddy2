import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, label, hint, error, icon, suffix, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-13 px-4 rounded-2xl',
              'text-base text-foreground placeholder:text-muted-foreground/50',
              'focus:outline-none transition-all duration-200',
              'liquid-glass border-0',
              'focus:ring-2 focus:ring-primary/20',
              icon && 'pl-12',
              suffix && 'pr-12',
              error && 'ring-2 ring-destructive/30',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}
        </div>
        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';
