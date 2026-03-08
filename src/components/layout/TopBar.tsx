import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bell, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ZONES = ['Bandra', 'Andheri', 'Powai', 'Colaba', 'Juhu', 'Worli', 'Versova', 'Lower Parel', 'Dadar', 'Malad'];

export function TopBar() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const notifications = useAppStore((s) => s.notifications);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  const currentZone = user?.zone || 'Bandra';

  const handleZoneChange = (zone: string) => {
    updateUser({ zone });
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        height: 56,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-full px-4">
        {/* Left: Zone selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 tap-scale outline-none">
            <span className="text-xs">📍</span>
            <span className="text-sm font-semibold text-foreground">{currentZone}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            {ZONES.map((zone) => (
              <DropdownMenuItem
                key={zone}
                onClick={() => handleZoneChange(zone)}
                className={cn(
                  'text-sm cursor-pointer',
                  zone === currentZone && 'font-bold text-primary'
                )}
              >
                {zone}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center: Logo */}
        <span className="text-[16px] font-bold tracking-tight text-foreground absolute left-1/2 -translate-x-1/2">
          any<span className="text-primary">buddy</span>
        </span>

        {/* Right: Chat + Notifications */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative tap-scale p-1"
          >
            <MessageCircle className="w-5 h-5 text-foreground" />
            {unreadChats > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadChats > 9 ? '9+' : unreadChats}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="relative tap-scale p-1"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
