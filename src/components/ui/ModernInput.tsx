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
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
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
              'w-full h-14 px-4 bg-card border-2 border-transparent rounded-2xl',
              'text-base text-foreground placeholder:text-muted-foreground/60',
              'focus:outline-none focus:border-primary/30 focus:bg-background',
              'transition-all duration-200',
              'shadow-sm hover:shadow-md',
              icon && 'pl-12',
              suffix && 'pr-12',
              error && 'border-destructive/50 focus:border-destructive',
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
          <p className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';
