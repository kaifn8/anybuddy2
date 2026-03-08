import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BottomNav } from '@/components/layout/BottomNav';
import { JoinConfirmDialog } from '@/components/JoinConfirmDialog';
import { ShareSheet } from '@/components/ShareSheet';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { cn } from '@/lib/utils';
import type { Category, Request } from '@/types/anybuddy';

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

function FlyToSelected({ selected }: { selected: Request | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.location.coords) {
      map.flyTo([selected.location.coords.lat, selected.location.coords.lng], 15, { duration: 0.5 });
    }
  }, [selected, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { requests, joinRequest, updateCredits } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  const [showShare, setShowShare] = useState(false);

  const activeRequests = requests
    .filter(r => r.status === 'active' && new Date(r.expiresAt) > new Date())
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => r.location.coords);

  const selected = activeRequests.find(r => r.id === selectedId);

  const filters: { id: Category | 'all'; emoji: string }[] = [
    { id: 'all', emoji: '🔥' },
    { id: 'chai', emoji: '☕' },
    { id: 'sports', emoji: '🏸' },
    { id: 'food', emoji: '🍜' },
    { id: 'explore', emoji: '🧭' },
    { id: 'walk', emoji: '🚶' },
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

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24 flex flex-col">
      <header className="sticky top-0 z-[1000] liquid-glass-nav">
        <div className="flex items-center justify-between h-12 px-5 max-w-md mx-auto">
          <h1 className="text-title-sm font-semibold">Nearby Plans</h1>
          <span className="text-2xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
            {activeRequests.length} active
          </span>
        </div>
      </header>

      <div className="flex gap-2 px-5 py-2.5 overflow-x-auto scrollbar-hide z-[1000] relative">
        {filters.map((f) => (
          <button key={f.id} onClick={() => { setFilter(f.id); setSelectedId(null); }}
            className={cn('w-9 h-9 rounded-full flex items-center justify-center tap-scale text-sm transition-all',
              filter === f.id ? 'tahoe-btn-primary' : 'liquid-glass'
            )}>
            {f.emoji}
          </button>
        ))}
      </div>

      <div className="relative mx-5 rounded-2xl overflow-hidden" style={{ height: '480px' }}>
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
          <FlyToSelected selected={selected} />
          <Marker position={MUMBAI_CENTER} icon={userIcon} />
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
                <button onClick={() => navigate(`/host/${selected.userId}`)} className="underline decoration-dotted tap-scale">
                  {selected.userName}
                </button>
                <span>👥 {selected.seatsTotal - selected.seatsTaken} left</span>
                <span>🎯 {selected.userReliability}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-2xs text-muted-foreground/70">
                <span>🛡️ Public</span>
                {(selected.userTrust === 'trusted' || selected.userTrust === 'anchor') && <span>✅ Verified</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => handleJoinFromMap(selected)}
                className="tahoe-btn-primary h-8 px-3 rounded-lg text-xs font-semibold tap-scale">
                Join
              </button>
              <button onClick={() => setShowShare(true)}
                className="liquid-glass h-7 px-2 rounded-lg text-2xs font-semibold tap-scale text-center">
                📤
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRequest && (
        <JoinConfirmDialog
          open={!!confirmRequest}
          onClose={() => setConfirmRequest(null)}
          onConfirm={handleConfirmJoin}
          request={confirmRequest}
        />
      )}

      {showShare && selected && (
        <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={selected.title} />
      )}

      <BottomNav />
    </div>
  );
}
