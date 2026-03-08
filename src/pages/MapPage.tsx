import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/anybuddy';

const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 };

// Generate positions for pins on the "map"
function getPinPosition(lat: number, lng: number, mapWidth: number, mapHeight: number) {
  const scale = 80;
  const x = (lng - BANGALORE_CENTER.lng) * scale + mapWidth / 2;
  const y = -(lat - BANGALORE_CENTER.lat) * scale + mapHeight / 2;
  return { x: Math.max(24, Math.min(x, mapWidth - 24)), y: Math.max(24, Math.min(y, mapHeight - 24)) };
}

export default function MapPage() {
  const navigate = useNavigate();
  const { requests } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const mapRef = useRef<HTMLDivElement>(null);
  
  const activeRequests = requests
    .filter(r => r.status === 'active' && new Date(r.expiresAt) > new Date())
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => r.location.coords);
  
  const selected = activeRequests.find(r => r.id === selectedId);
  
  useEffect(() => {
    if (mapRef.current) {
      gsap.fromTo(mapRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
  }, []);
  
  const mapWidth = 390;
  const mapHeight = 480;
  
  const filters: { id: Category | 'all'; emoji: string }[] = [
    { id: 'all', emoji: '🔥' },
    { id: 'chai', emoji: '☕' },
    { id: 'sports', emoji: '🏸' },
    { id: 'food', emoji: '🍜' },
    { id: 'explore', emoji: '🧭' },
    { id: 'walk', emoji: '🚶' },
  ];
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 liquid-glass-nav">
        <div className="flex items-center justify-between h-12 px-5 max-w-md mx-auto">
          <h1 className="text-title-sm font-semibold">Nearby Plans</h1>
          <span className="text-2xs text-muted-foreground">{activeRequests.length} active</span>
        </div>
      </header>
      
      {/* Filter row */}
      <div className="flex gap-2 px-5 py-2.5 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button key={f.id} onClick={() => { setFilter(f.id); setSelectedId(null); }}
            className={cn('w-9 h-9 rounded-full flex items-center justify-center tap-scale text-sm transition-all',
              filter === f.id ? 'tahoe-btn-primary' : 'liquid-glass'
            )}>
            {f.emoji}
          </button>
        ))}
      </div>
      
      {/* Map area */}
      <div ref={mapRef} className="flex-1 relative mx-5 rounded-2xl overflow-hidden liquid-glass-heavy specular-highlight" style={{ minHeight: mapHeight }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Center marker (you) */}
        <div className="absolute z-10" style={{ left: mapWidth / 2 - 12, top: mapHeight / 2 - 12 }}>
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
          </div>
          <p className="text-2xs text-center text-muted-foreground font-medium mt-0.5">You</p>
        </div>
        
        {/* Plan pins */}
        {activeRequests.map((req) => {
          if (!req.location.coords) return null;
          const pos = getPinPosition(req.location.coords.lat, req.location.coords.lng, mapWidth, mapHeight);
          const isSelected = selectedId === req.id;
          return (
            <button
              key={req.id}
              onClick={() => setSelectedId(isSelected ? null : req.id)}
              className={cn(
                'absolute z-20 flex flex-col items-center transition-all duration-200 tap-scale',
                isSelected && 'z-30 scale-110'
              )}
              style={{ left: pos.x - 16, top: pos.y - 16 }}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition-all',
                isSelected ? 'tahoe-btn-primary scale-110' : 'liquid-glass'
              )}>
                {getCategoryEmoji(req.category)}
              </div>
              {isSelected && (
                <span className="text-2xs font-semibold mt-0.5 bg-card px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[100px] truncate">
                  {req.title}
                </span>
              )}
            </button>
          );
        })}
        
        {activeRequests.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl block mb-2">🗺️</span>
              <p className="text-xs text-muted-foreground">No plans nearby</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected plan detail */}
      {selected && (
        <div className="mx-5 mt-3 liquid-glass-heavy p-4 specular-highlight slide-up" style={{ borderRadius: '1rem' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-lg shrink-0">
              {getCategoryEmoji(selected.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <UrgencyBadge urgency={selected.urgency} />
                <span className="text-2xs text-muted-foreground">📍 {selected.location.distance}km</span>
              </div>
              <h3 className="text-sm font-semibold truncate">{selected.title}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-2xs text-muted-foreground">
                <span>👥 {selected.seatsTotal - selected.seatsTaken} left</span>
                <span>🎯 {selected.userReliability}%</span>
                <span>{selected.userName}</span>
              </div>
            </div>
            <button onClick={() => navigate(`/join/${selected.id}`)}
              className="tahoe-btn-primary h-8 px-3 rounded-lg text-xs font-semibold tap-scale shrink-0">
              Join
            </button>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
