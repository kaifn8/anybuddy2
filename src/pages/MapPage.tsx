import { useState, useEffect, useCallback, useRef } from 'react';
import { Share2, Navigation, MapPin, Users, Star } from 'lucide-react';
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
      background: ${isSelected ? 'hsla(213, 94%, 55%, 0.9)' : 'hsla(0, 0%, 100%, 0.7)'};
      backdrop-filter: blur(12px);
      border: 1px solid ${isSelected ? 'hsla(213, 94%, 65%, 0.8)' : 'hsla(0, 0%, 100%, 0.5)'};
      box-shadow: 0 4px 16px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.6);
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
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
  "><div style="width: 12px; height: 12px; border-radius: 50%; background: hsl(213, 94%, 55%); box-shadow: 0 0 8px hsla(213, 94%, 55%, 0.5);"></div></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitBounds({ requests, selectedId }: { requests: Request[]; selectedId: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedId) {
      const selected = requests.find(r => r.id === selectedId);
      if (selected?.location.coords) {
        map.flyTo([selected.location.coords.lat, selected.location.coords.lng], 15, { duration: 0.5 });
      }
      return;
    }

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
    bounds.extend(MUMBAI_CENTER);
    
    map.flyToBounds(bounds, { 
      padding: [40, 40], 
      duration: 0.5,
      maxZoom: 14 
    });
  }, [requests, selectedId, map]);

  return null;
}

function LocateControl({ setUserPos, mapRef }: { setUserPos: (pos: [number, number]) => void; mapRef: React.MutableRefObject<any> }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

export default function MapPage() {
  const mapRef = useRef<any>(null);
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

  const filters: { id: Category | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'chai', label: 'Chai' },
    { id: 'sports', label: 'Sports' },
    { id: 'food', label: 'Food' },
    { id: 'explore', label: 'Explore' },
    { id: 'walk', label: 'Walk' },
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
    <div className="mobile-container min-h-screen bg-background pb-24 flex flex-col">
      <TopBar title="Map" />

      {/* Category filters — glass pills */}
      <div className="flex gap-2 px-5 py-2.5 overflow-x-auto scrollbar-hide z-[1000] relative">
        {filters.map((f) => (
          <button key={f.id} onClick={() => { setFilter(f.id); setSelectedId(null); }}
            className={cn('h-9 px-3 rounded-full flex items-center gap-1.5 tap-scale text-sm transition-all whitespace-nowrap',
              filter === f.id ? 'glass-pill-active' : 'glass-pill-inactive'
            )}>
            <span className="text-xs font-medium">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative mx-5 rounded-2xl overflow-hidden z-0 liquid-glass" style={{ height: '280px', borderRadius: '1.25rem', padding: 0 }}>
        <MapContainer
          center={MUMBAI_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '1.25rem' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FitBounds requests={activeRequests} selectedId={selectedId} />
          <Marker position={userPos} icon={userIcon} />
          <LocateControl setUserPos={setUserPos} mapRef={mapRef} />
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

        {/* Locate me button — glass */}
        <button
          onClick={() => {
            const map = mapRef.current;
            if (!map || !navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(latlng);
                map.flyTo(latlng, 15, { duration: 0.8 });
              },
              () => {},
              { enableHighAccuracy: true, timeout: 5000 }
            );
          }}
          className="absolute bottom-3 right-3 z-[1000] w-9 h-9 rounded-full liquid-glass flex items-center justify-center tap-scale"
          style={{ borderRadius: '50%' }}
          aria-label="Locate me"
        >
          <Navigation size={16} className="text-primary" />
        </button>

        {activeRequests.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className="text-center liquid-glass-heavy p-4">
              <MapPin size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No plans nearby</p>
            </div>
          </div>
        )}
      </div>

      {/* Events list header */}
      <div className="px-5 pt-3 pb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          {activeRequests.length} {filter === 'all' ? 'plans' : `${currentFilter?.label} plans`} nearby
        </p>
        {selectedId && (
          <button onClick={() => setSelectedId(null)} className="text-2xs text-primary font-semibold tap-scale">
            Show all
          </button>
        )}
      </div>

      {/* Events list — glass cards */}
      <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-2">
        {(selectedId ? activeRequests.filter(r => r.id === selectedId) : activeRequests).map((req) => (
          <div
            key={req.id}
            className={cn(
              "liquid-glass-interactive p-3 transition-all",
              selectedId === req.id && "ring-1 ring-primary/30"
            )}
            onClick={() => setSelectedId(selectedId === req.id ? null : req.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-lg shrink-0" style={{ borderRadius: '0.75rem' }}>
                {getCategoryEmoji(req.category)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-foreground truncate leading-tight">{req.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <UrgencyBadge urgency={req.urgency} />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin size={9} /> {req.location.distance}km · ~{Math.round(req.location.distance * 12)}min
                  </span>
                </div>
              </div>

              <Button
                onClick={(e) => { e.stopPropagation(); handleJoinFromMap(req); }}
                size="sm"
                className="shrink-0 h-8 px-3 text-[12px]"
              >
                Join
              </Button>
            </div>

            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/10">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Users size={10} /> {req.seatsTotal - req.seatsTaken} spots left</span>
                <span className="flex items-center gap-0.5"><Star size={10} /> {req.userReliability}% reliable</span>
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
