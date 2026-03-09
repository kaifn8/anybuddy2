import { useState, useEffect, useCallback, useRef } from 'react';
import { Share2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { ShareSheet } from '@/components/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { cn } from '@/lib/utils';
import type { Category, Request } from '@/types/anybuddy';
import { Button } from '@/components/ui/button';

const CATEGORY_TINTS: Record<Category, string> = {
  chai: 'bg-amber-500/15 border-amber-400/30',
  food: 'bg-orange-500/15 border-orange-400/30',
  sports: 'bg-emerald-500/15 border-emerald-400/30',
  explore: 'bg-blue-500/15 border-blue-400/30',
  work: 'bg-slate-500/15 border-slate-400/30',
  walk: 'bg-teal-500/15 border-teal-400/30',
  help: 'bg-rose-500/15 border-rose-400/30',
  shopping: 'bg-purple-500/15 border-purple-400/30',
  casual: 'bg-violet-500/15 border-violet-400/30',
};

const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

function createEmojiIcon(emoji: string, isSelected = false) {
  return L.divIcon({
    html: `<div style="
      width: ${isSelected ? '40px' : '32px'};
      height: ${isSelected ? '40px' : '32px'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '18px' : '14px'};
      background: ${isSelected ? 'hsla(213, 94%, 55%, 0.9)' : 'hsla(0, 0%, 100%, 0.85)'};
      backdrop-filter: blur(8px);
      border: 2px solid ${isSelected ? 'hsla(213, 94%, 65%, 0.8)' : 'hsla(0, 0%, 100%, 0.4)'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
    ">${emoji}</div>`,
    className: '',
    iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width: 24px; height: 24px; border-radius: 50%;
    background: hsla(213, 94%, 55%, 0.2);
    display: flex; align-items: center; justify-content: center;
  "><div style="width: 12px; height: 12px; border-radius: 50%; background: hsl(213, 94%, 55%); box-shadow: 0 0 6px hsla(213, 94%, 55%, 0.5);"></div></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitBounds({ requests, selectedId }: { requests: Request[]; selectedId: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    // If a specific item is selected, fly to it
    if (selectedId) {
      const selected = requests.find(r => r.id === selectedId);
      if (selected?.location.coords) {
        map.flyTo([selected.location.coords.lat, selected.location.coords.lng], 15, { duration: 0.5 });
      }
      return;
    }

    // Otherwise fit bounds to all markers
    const validRequests = requests.filter(r => r.location.coords);
    if (validRequests.length === 0) {
      map.setView(MUMBAI_CENTER, 13);
      return;
    }

    if (validRequests.length === 1) {
      const coords = validRequests[0].location.coords!;
      map.flyTo([coords.lat, coords.lng], 14, { duration: 0.5 });
      return;
    }

    const bounds = L.latLngBounds(
      validRequests.map(r => [r.location.coords!.lat, r.location.coords!.lng] as [number, number])
    );
    // Add user location to bounds
    bounds.extend(MUMBAI_CENTER);
    
    map.flyToBounds(bounds, { 
      padding: [40, 40], 
      duration: 0.5,
      maxZoom: 14 
    });
  }, [requests, selectedId, map]);

  return null;
}

function LocateControl({ setUserPos }: { setUserPos: (pos: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    // Expose locate function on the map instance
    (map as any)._locateMe = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(latlng);
          map.flyTo(latlng, 15, { duration: 0.8 });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    };
  }, [map, setUserPos]);

  return null;
}

const mapRef = React.useRef<any>(null);
  const navigate = useNavigate();
  const { requests, joinRequest, updateCredits } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareRequest, setShareRequest] = useState<Request | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>(MUMBAI_CENTER);

  const activeRequests = requests
    .filter(r => r.status === 'active' && new Date(r.expiresAt) > new Date())
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => r.location.coords);

  const selected = activeRequests.find(r => r.id === selectedId);

  const filters: { id: Category | 'all'; emoji: string; label: string }[] = [
    { id: 'all', emoji: '🔥', label: 'All' },
    { id: 'chai', emoji: '☕', label: 'Chai' },
    { id: 'sports', emoji: '🏸', label: 'Sports' },
    { id: 'food', emoji: '🍜', label: 'Food' },
    { id: 'explore', emoji: '🧭', label: 'Explore' },
    { id: 'walk', emoji: '🚶', label: 'Walk' },
  ];

  const handleJoinFromMap = (req: Request) => {
    setConfirmRequest(req);
  };

  const handleConfirmJoin = () => {
    if (!confirmRequest) return;
    joinRequest(confirmRequest.id);
    updateCredits(0.5, 'Joined a request');
    setConfirmRequest(null);
    navigate(`/request/${confirmRequest.id}`);
  };

  const handleShare = (req: Request) => {
    setShareRequest(req);
    setShowShare(true);
  };

  const currentFilter = filters.find(f => f.id === filter);

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24 flex flex-col">
      <TopBar showBack title="Nearby Plans" />

      {/* Category filters */}
      <div className="flex gap-2 px-5 py-2.5 overflow-x-auto scrollbar-hide z-[1000] relative">
        {filters.map((f) => (
          <button key={f.id} onClick={() => { setFilter(f.id); setSelectedId(null); }}
            className={cn('h-9 px-3 rounded-full flex items-center gap-1.5 tap-scale text-sm transition-all whitespace-nowrap',
              filter === f.id ? 'bg-primary text-primary-foreground shadow-lg' : 'liquid-glass'
            )}>
            <span>{f.emoji}</span>
            <span className="text-xs font-medium">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative mx-5 rounded-2xl overflow-hidden z-0" style={{ height: '280px' }}>
        <MapContainer
          center={MUMBAI_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FitBounds requests={activeRequests} selectedId={selectedId} />
          <Marker position={userPos} icon={userIcon} />
          <LocateControl setUserPos={setUserPos} />
          {activeRequests.map((req) => {
            if (!req.location.coords) return null;
            const isSelected = selectedId === req.id;
            return (
              <Marker
                key={req.id}
                position={[req.location.coords.lat, req.location.coords.lng]}
                icon={createEmojiIcon(getCategoryEmoji(req.category), isSelected)}
                eventHandlers={{
                  click: () => setSelectedId(isSelected ? null : req.id),
                }}
              />
            );
          })}
        </MapContainer>

        {activeRequests.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className="text-center liquid-glass-heavy p-4 rounded-xl">
              <span className="text-3xl block mb-2">🗺️</span>
              <p className="text-xs text-muted-foreground">No plans nearby</p>
            </div>
          </div>
        )}
      </div>

      {/* Events list header */}
      <div className="px-5 pt-3 pb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          {currentFilter?.emoji} {activeRequests.length} {filter === 'all' ? 'plans' : `${currentFilter?.label} plans`} nearby
        </p>
        {selectedId && (
          <button onClick={() => setSelectedId(null)} className="text-2xs text-primary font-semibold tap-scale">
            Show all
          </button>
        )}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-2">
        {(selectedId ? activeRequests.filter(r => r.id === selectedId) : activeRequests).map((req) => (
          <div
            key={req.id}
            className={cn(
              "backdrop-blur-xl bg-background/80 border border-border/50 rounded-2xl p-3 tap-scale transition-all shadow-sm",
              selectedId === req.id && "ring-1 ring-primary/50 bg-background/95 shadow-md"
            )}
            onClick={() => setSelectedId(selectedId === req.id ? null : req.id)}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border", CATEGORY_TINTS[req.category])}>
                {getCategoryEmoji(req.category)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-foreground truncate leading-tight">{req.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <UrgencyBadge urgency={req.urgency} />
                  <span className="text-[10px] text-muted-foreground">📍 {req.location.distance}km</span>
                </div>
              </div>

              {/* Join button only */}
              <Button
                onClick={(e) => { e.stopPropagation(); handleJoinFromMap(req); }}
                size="sm"
                className="shrink-0 h-8 px-3 text-[12px]"
              >
                Join
              </Button>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/10">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>👥 {req.seatsTotal - req.seatsTaken} spots left</span>
                <span>🎯 {req.userReliability}% reliable</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleShare(req); }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground tap-scale"
              >
                <Share2 size={10} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmRequest && (
        <JoinConfirmDialog
          open={!!confirmRequest}
          onClose={() => setConfirmRequest(null)}
          onConfirm={handleConfirmJoin}
          request={confirmRequest}
        />
      )}

      {showShare && shareRequest && (
        <ShareSheet open={showShare} onClose={() => { setShowShare(false); setShareRequest(null); }} title={shareRequest.title} />
      )}

      <BottomNav />
    </div>
  );
}
