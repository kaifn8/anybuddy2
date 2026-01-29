import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  action,
  transparent = false,
  className 
}: PageHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header 
      className={cn(
        'sticky top-0 z-40 transition-all duration-200',
        transparent ? 'bg-transparent' : 'glass-nav',
        className
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
