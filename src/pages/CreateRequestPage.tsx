import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { ModernInput } from '@/components/ui/ModernInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import type { Category, Urgency } from '@/types/anybuddy';
import { cn } from '@/lib/utils';

const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];
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
  const [category, setCategory] = useState<Category | null>(null);
  const [urgency, setUrgency] = useState<Urgency>('now');
  const [timer, setTimer] = useState<number | null>(null);
  const [seats, setSeats] = useState([2]);
  const [liveShare, setLiveShare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const costRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(contentRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
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
  
  useEffect(() => {
    if (costRef.current) gsap.fromTo(costRef.current, { scale: 1.15 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  }, [creditCost]);
  
  const canPost = title.trim().length > 0 && category && (user?.credits ?? 0) >= creditCost;
  
  const handleSubmit = () => {
    if (!canPost || !user) return;
    setIsSubmitting(true);
    const now = new Date();
    let when = new Date(), expiresAt = new Date();
    if (urgency === 'now') { expiresAt = timer ? new Date(now.getTime() + timer * 60000) : new Date(now.getTime() + 60 * 60000); }
    else if (urgency === 'today') { when = new Date(now.getTime() + 2 * 3600000); expiresAt = new Date(when.getTime() + 4 * 3600000); }
    else { when = new Date(now.getTime() + 3 * 24 * 3600000); expiresAt = new Date(when.getTime() + 24 * 3600000); }
    
    createRequest({ userId: user.id, userName: user.firstName, userTrust: user.trustLevel, userAvatar: user.avatar, title: title.trim(), category: category!, urgency, when, location: { name: user.city || 'Koramangala', distance: 0 }, seatsTotal: seats[0], seatsTaken: 0, expiresAt, timer: timer ?? undefined, liveShare });
    updateCredits(-creditCost, 'Posted a request');
    gsap.to(contentRef.current, { opacity: 0, y: -20, duration: 0.3, onComplete: () => navigate('/home') });
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient">
      <PageHeader title="New Request ✨" />
      
      <div ref={contentRef} className="px-5 pb-32 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">What do you need?</label>
          <ModernInput placeholder="e.g., Anyone for chai and a chat? ☕" value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            suffix={<span className="text-xs text-muted-foreground">{title.length}/120</span>}
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('flex items-center gap-2.5 py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all tap-scale text-left',
                  category === cat ? 'glass-button-primary' : 'liquid-glass text-foreground'
                )}>
                <span className="text-lg">{getCategoryEmoji(cat)}</span>
                <span>{getCategoryLabel(cat)}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">When?</label>
          <div className="flex gap-2">
            {([{ v: 'now' as Urgency, l: '⚡ Now' }, { v: 'today' as Urgency, l: '☀️ Today' }, { v: 'week' as Urgency, l: '📅 Week' }]).map((u) => (
              <button key={u.v} onClick={() => setUrgency(u.v)}
                className={cn('flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all tap-scale',
                  urgency === u.v ? 'glass-button-primary' : 'liquid-glass text-foreground'
                )}>
                {u.l}
              </button>
            ))}
          </div>
        </div>
        
        {urgency === 'now' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">⏰ Auto-expire</label>
            <div className="flex gap-2">
              {timers.map((t) => (
                <button key={t.label} onClick={() => setTimer(t.value)}
                  className={cn('flex-1 py-3 rounded-xl text-xs font-semibold transition-all tap-scale',
                    timer === t.value ? 'glass-button-primary text-xs' : 'liquid-glass text-foreground'
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="liquid-glass-heavy p-4 space-y-4 specular-highlight" style={{ borderRadius: '1.25rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-sm">{user?.city || 'Koramangala'}</p>
                <p className="text-xs text-muted-foreground">Auto-detected</p>
              </div>
            </div>
            <span className="text-lg">✅</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <span className="text-sm text-muted-foreground">Share live location 📡</span>
            <Switch checked={liveShare} onCheckedChange={setLiveShare} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">👥 How many can join?</label>
            <span className="text-xl font-bold text-foreground">{seats[0]}</span>
          </div>
          <Slider value={seats} onValueChange={setSeats} min={1} max={10} step={1} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Solo buddy</span><span>Full crew</span>
          </div>
        </div>
        
        <div className="liquid-glass-heavy p-4 specular-highlight" style={{ borderRadius: '1.25rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-sm">Cost to post</p>
                <p className="text-xs text-muted-foreground">Balance: {user?.credits ?? 0} credits</p>
              </div>
            </div>
            <span ref={costRef} className="text-3xl font-bold">{creditCost}</span>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-5 liquid-glass-nav safe-area-pb">
        <div className="max-w-md mx-auto">
          <Button className="w-full h-13 text-base font-semibold rounded-2xl glass-button-primary disabled:opacity-40"
            onClick={handleSubmit} disabled={!canPost || isSubmitting}>
            {isSubmitting ? 'Posting... ✨' : 'Post Request 🚀'}
          </Button>
        </div>
      </div>
    </div>
  );
}
