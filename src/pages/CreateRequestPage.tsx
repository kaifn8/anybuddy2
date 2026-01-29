import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Clock, Coins, Check, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { ModernInput } from '@/components/ui/ModernInput';
import { SelectionChip, ChipGroup } from '@/components/ui/SelectionChip';
import { PageHeader } from '@/components/layout/PageHeader';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon, getCategoryLabel } from '@/components/icons/CategoryIcon';
import type { Category, Urgency } from '@/types/anybuddy';

const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];
const timers = [
  { value: null, label: 'No limit' },
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
  
  // Initial animation
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Calculate credit cost
  const creditCost = useMemo(() => {
    let cost = 1;
    if (urgency === 'now') cost += 0.5;
    if (urgency === 'today') cost += 0.25;
    if (category === 'help') cost -= 0.25;
    if (user?.trustLevel === 'trusted' || user?.trustLevel === 'anchor') cost -= 0.25;
    return Math.max(1, Math.round(cost * 10) / 10);
  }, [urgency, category, user?.trustLevel]);
  
  // Animate cost changes
  useEffect(() => {
    if (costRef.current) {
      gsap.fromTo(
        costRef.current,
        { scale: 1.2, color: 'hsl(var(--primary))' },
        { scale: 1, color: 'hsl(var(--foreground))', duration: 0.3, ease: 'back.out(2)' }
      );
    }
  }, [creditCost]);
  
  const canPost = title.trim().length > 0 && category && (user?.credits ?? 0) >= creditCost;
  
  const handleSubmit = () => {
    if (!canPost || !user) return;
    
    setIsSubmitting(true);
    
    const now = new Date();
    let when = new Date();
    let expiresAt = new Date();
    
    if (urgency === 'now') {
      expiresAt = timer 
        ? new Date(now.getTime() + timer * 60000) 
        : new Date(now.getTime() + 60 * 60000);
    } else if (urgency === 'today') {
      when = new Date(now.getTime() + 2 * 3600000);
      expiresAt = new Date(when.getTime() + 4 * 3600000);
    } else {
      when = new Date(now.getTime() + 3 * 24 * 3600000);
      expiresAt = new Date(when.getTime() + 24 * 3600000);
    }
    
    createRequest({
      userId: user.id,
      userName: user.firstName,
      userTrust: user.trustLevel,
      userAvatar: user.avatar,
      title: title.trim(),
      category: category!,
      urgency,
      when,
      location: {
        name: user.city || 'Koramangala',
        distance: 0,
      },
      seatsTotal: seats[0],
      seatsTaken: 0,
      expiresAt,
      timer: timer ?? undefined,
      liveShare,
    });
    
    updateCredits(-creditCost, 'Posted a request');
    
    // Success animation
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => navigate('/home'),
    });
  };
  
  return (
    <div className="mobile-container min-h-screen bg-background">
      <PageHeader title="Create Request" />
      
      <div ref={contentRef} className="px-5 pb-32 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            What do you need?
          </label>
          <ModernInput
            placeholder="e.g., Anyone for chai and a chat?"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            suffix={
              <span className="text-xs text-muted-foreground">{title.length}/120</span>
            }
          />
        </div>
        
        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Category
          </label>
          <ChipGroup columns={2}>
            {categories.map((cat) => (
              <SelectionChip
                key={cat}
                icon={<CategoryIcon category={cat} />}
                label={getCategoryLabel(cat)}
                selected={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </ChipGroup>
        </div>
        
        {/* When */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            When?
          </label>
          <div className="flex gap-2">
            {(['now', 'today', 'week'] as Urgency[]).map((u) => (
              <button
                key={u}
                onClick={() => setUrgency(u)}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] ${
                  urgency === u
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-card text-foreground shadow-sm hover:shadow-md'
                }`}
              >
                {u === 'now' && '⚡ Now'}
                {u === 'today' && '☀️ Today'}
                {u === 'week' && '📅 Week'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Timer (only for "now") */}
        {urgency === 'now' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={14} strokeWidth={2} />
              Auto-expire after
            </label>
            <div className="flex gap-2">
              {timers.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTimer(t.value)}
                  className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] ${
                    timer === t.value
                      ? 'bg-secondary/15 text-secondary border-2 border-secondary/30'
                      : 'bg-card text-foreground shadow-sm'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Location */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.city || 'Koramangala'}</p>
                <p className="text-xs text-muted-foreground">Auto-detected</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center">
              <Check size={14} className="text-success" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Share live location</span>
            <Switch checked={liveShare} onCheckedChange={setLiveShare} />
          </div>
        </div>
        
        {/* Seats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users size={14} strokeWidth={2} />
              How many can join?
            </label>
            <span className="text-lg font-semibold text-foreground">{seats[0]}</span>
          </div>
          <Slider
            value={seats}
            onValueChange={setSeats}
            min={1}
            max={10}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 person</span>
            <span>10 people</span>
          </div>
        </div>
        
        {/* Credit Cost */}
        <div className="glass-card p-4 bg-accent/10 border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Coins size={18} className="text-accent-foreground" strokeWidth={2} />
              </div>
              <div>
                <p className="font-medium text-sm">Cost to post</p>
                <p className="text-xs text-muted-foreground">Balance: {user?.credits ?? 0}</p>
              </div>
            </div>
            <span ref={costRef} className="text-2xl font-bold">{creditCost}</span>
          </div>
        </div>
      </div>
      
      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 glass-nav safe-area-pb">
        <div className="max-w-md mx-auto">
          <Button
            className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canPost || isSubmitting}
          >
            {isSubmitting ? (
              'Posting...'
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Post Request
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
