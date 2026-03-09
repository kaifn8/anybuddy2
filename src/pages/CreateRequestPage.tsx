import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ModernInput } from '@/components/ui/ModernInput';
import { TopBar } from '@/components/layout/TopBar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import type { Category, Urgency } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual', 'sports', 'food', 'walk'];
const timers = [
  { value: null, label: '♾️ None' },
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
];

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const { user, createRequest, updateCredits } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [urgency, setUrgency] = useState<Urgency>('now');
  const [timer, setTimer] = useState<number | null>(null);
  const [seats, setSeats] = useState([2]);
  const [liveShare, setLiveShare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(contentRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
    }
  }, []);
  
  const creditCost = useMemo(() => {
    let cost = 1;
    if (urgency === 'now') cost += 0.5;
    if (urgency === 'today') cost += 0.25;
    if (category === 'help') cost -= 0.25;
    if (user?.trustLevel === 'trusted' || user?.trustLevel === 'anchor') cost -= 0.25;
    return Math.max(1, Math.round(cost * 10) / 10);
  }, [urgency, category, user?.trustLevel]);
  
  const canPost = title.trim().length > 0 && category && (user?.credits ?? 0) >= creditCost;
  
  const handleSubmit = () => {
    if (!canPost || !user) return;
    setIsSubmitting(true);
    const now = new Date();
    let when = new Date(), expiresAt = new Date();
    if (urgency === 'now') { expiresAt = timer ? new Date(now.getTime() + timer * 60000) : new Date(now.getTime() + 60 * 60000); }
    else if (urgency === 'today') { when = new Date(now.getTime() + 2 * 3600000); expiresAt = new Date(when.getTime() + 4 * 3600000); }
    else { when = new Date(now.getTime() + 3 * 24 * 3600000); expiresAt = new Date(when.getTime() + 24 * 3600000); }
    
    createRequest({
      userId: user.id, userName: user.firstName, userTrust: user.trustLevel,
      userAvatar: user.avatar, userReliability: user.reliabilityScore,
      userHostRating: user.hostRating, title: title.trim(), description: description.trim() || undefined,
      category: category!, urgency, when,
      location: { name: user.zone || user.city || 'Bandra', distance: 0, coords: { lat: 19.0596, lng: 72.8295 } },
      seatsTotal: seats[0], seatsTaken: 0, expiresAt, timer: timer ?? undefined,
      liveShare, status: 'active',
    });
    updateCredits(-creditCost, 'Posted a request');
    gsap.to(contentRef.current, { opacity: 0, y: -16, duration: 0.25, onComplete: () => navigate('/home') });
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <TopBar showBack title="New Request" />
      
      <div ref={contentRef} className="px-5 pb-28 space-y-6 pt-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What do you need?</label>
          <ModernInput placeholder="e.g., Coffee at Carter Road" value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            suffix={<span className="text-2xs text-muted-foreground">{title.length}/120</span>} />
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (optional)</label>
          <textarea placeholder="Add details..." value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            className="w-full h-16 px-4 py-2.5 rounded-xl liquid-glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all tap-scale',
                  category === cat ? 'tahoe-btn-primary' : 'liquid-glass text-foreground'
                )}>
                <span>{getCategoryEmoji(cat)}</span>
                <span>{getCategoryLabel(cat)}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">When?</label>
          <div className="flex gap-2">
            {([{ v: 'now' as Urgency, l: '⚡ Now' }, { v: 'today' as Urgency, l: '☀️ Today' }, { v: 'week' as Urgency, l: '📅 Week' }]).map((u) => (
              <button key={u.v} onClick={() => setUrgency(u.v)}
                className={cn('flex-1 py-3 rounded-xl text-sm font-semibold transition-all tap-scale',
                  urgency === u.v ? 'tahoe-btn-primary' : 'liquid-glass text-foreground'
                )}>{u.l}</button>
            ))}
          </div>
        </div>
        
        {urgency === 'now' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Auto-expire</label>
            <div className="flex gap-2">
              {timers.map((t) => (
                <button key={t.label} onClick={() => setTimer(t.value)}
                  className={cn('flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all tap-scale',
                    timer === t.value ? 'tahoe-btn-primary' : 'liquid-glass text-foreground'
                  )}>{t.label}</button>
              ))}
            </div>
          </div>
        )}
        
        <div className="liquid-glass-heavy p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📍</span>
              <div><p className="text-sm font-semibold">{user?.zone || user?.city || 'Bandra'}</p><p className="text-2xs text-muted-foreground">Auto-detected</p></div>
            </div>
            <span className="text-base">✅</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
            <span className="text-xs text-muted-foreground">Share live location</span>
            <Switch checked={liveShare} onCheckedChange={setLiveShare} />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Seats available</label>
            <span className="text-title font-bold text-foreground">{seats[0]}</span>
          </div>
          <Slider value={seats} onValueChange={setSeats} min={1} max={10} step={1} />
          <div className="flex justify-between text-2xs text-muted-foreground mt-1.5">
            <span>Solo buddy</span><span>Full crew</span>
          </div>
        </div>
        
        <div className="liquid-glass-heavy p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💰</span>
              <div><p className="text-sm font-semibold">Cost to post</p><p className="text-2xs text-muted-foreground">Balance: {user?.credits ?? 0}</p></div>
            </div>
            <span className="text-heading font-bold">{creditCost}</span>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 liquid-glass-nav">
        <div className="max-w-md mx-auto">
          <button className="w-full h-12 tahoe-btn-primary tap-scale disabled:opacity-40"
            onClick={handleSubmit} disabled={!canPost || isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
