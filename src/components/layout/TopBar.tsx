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

// Simple geo-detection stub: picks city based on random/stored preference
function detectCity(): string {
  // In production this would use navigator.geolocation
  return 'Mumbai';
}

export function TopBar() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const joinedRequests = useAppStore((s) => s.joinedRequests);

  const [currentZone, setCurrentZone] = useState<string>(user?.zone || 'Bandra');
  const [currentCity, setCurrentCity] = useState<string>(user?.city || 'Mumbai');

  // Sync from user if available
  useEffect(() => {
    if (user?.zone) setCurrentZone(user.zone);
    if (user?.city) setCurrentCity(user.city);
  }, [user?.zone, user?.city]);

  const unreadChats = joinedRequests.reduce((count, id) => {
    const msgs = chatMessages[id] || [];
    return count + (msgs.length > 0 ? 1 : 0);
  }, 0);

  const currentZone = user?.zone || 'Bandra';
  const currentCity = user?.city || detectedCity;

  const handleZoneChange = (city: string, zone: string) => {
    setDetectedCity(city);
    updateUser({ city, zone });
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
          <DropdownMenuContent align="start" className="min-w-[180px] max-h-[320px] overflow-y-auto">
            {Object.entries(CITIES).map(([city, zones]) => (
              <div key={city}>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {city} {city === currentCity && '📍'}
                </DropdownMenuLabel>
                {zones.map((zone) => (
                  <DropdownMenuItem
                    key={zone}
                    onClick={() => handleZoneChange(city, zone)}
                    className={cn(
                      'text-sm cursor-pointer',
                      zone === currentZone && 'font-bold text-primary'
                    )}
                  >
                    {zone}
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
          onClick={() => navigate('/notifications')}
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
