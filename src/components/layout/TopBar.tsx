import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const CITIES: Record<string, string[]> = {
  'Mumbai': ['Bandra', 'Andheri', 'Powai', 'Colaba', 'Juhu', 'Worli', 'Versova', 'Lower Parel', 'Dadar', 'Malad', 'Goregaon', 'Borivali'],
  'Navi Mumbai': ['Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Panvel', 'Airoli', 'Kopar Khairane'],
  'Thane': ['Thane West', 'Thane East', 'Ghodbunder', 'Majiwada', 'Hiranandani Estate', 'Kalwa'],
};

export function TopBar() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);

  const [zone, setZone] = useState<string>(user?.zone || 'Bandra');
  const [city, setCity] = useState<string>(user?.city || 'Mumbai');

  // Sync from user store when it changes
  useEffect(() => {
    if (user?.zone) setZone(user.zone);
    if (user?.city) setCity(user.city);
  }, [user?.zone, user?.city]);

  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  const handleZoneChange = (newCity: string, newZone: string) => {
    setCity(newCity);
    setZone(newZone);
    if (user) {
      updateUser({ city: newCity, zone: newZone });
    }
  };

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        height: 56,
        background: 'transparent',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-full px-4">
        {/* Left: Zone selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 tap-scale outline-none">
            <span className="text-xs">📍</span>
            <span className="text-sm font-semibold text-foreground">{zone}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px] max-h-[320px] overflow-y-auto">
            {Object.entries(CITIES).map(([cityName, zones]) => (
              <div key={cityName}>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {cityName} {cityName === city && '📍'}
                </DropdownMenuLabel>
                {zones.map((z) => (
                  <DropdownMenuItem
                    key={z}
                    onClick={() => handleZoneChange(cityName, z)}
                    className={cn(
                      'text-sm cursor-pointer',
                      z === zone && 'font-bold text-primary'
                    )}
                  >
                    {z}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center: Logo */}
        <span className="text-[16px] font-bold tracking-tight text-foreground absolute left-1/2 -translate-x-1/2">
          any<span className="text-primary">buddy</span>
        </span>

        {/* Right: Chat emoji with badge */}
        <button
          onClick={() => navigate('/chats')}
          className="relative tap-scale text-lg"
        >
          💬
          {unreadChats > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadChats > 9 ? '9+' : unreadChats}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
