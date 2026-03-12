import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import type { Category, Urgency } from '@/types/anybuddy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil } from 'lucide-react';

// ── Template data ──────────────────────────────────────────────
interface QuickTemplate {
  emoji: string;
  label: string;
  category: Category;
  titleFn: (zone: string) => string;
  defaultMinutes: number;
  seats: number;
}

const TEMPLATES: QuickTemplate[] = [
  { emoji: '☕', label: 'Coffee', category: 'chai', titleFn: z => `Coffee near ${z}`, defaultMinutes: 20, seats: 2 },
  { emoji: '🍜', label: 'Food', category: 'food', titleFn: z => `Grab food in ${z}`, defaultMinutes: 30, seats: 2 },
  { emoji: '🏸', label: 'Sports', category: 'sports', titleFn: z => `Badminton in ${z}`, defaultMinutes: 45, seats: 3 },
  { emoji: '🚶', label: 'Walk', category: 'walk', titleFn: z => `Walk around ${z}`, defaultMinutes: 15, seats: 2 },
  { emoji: '🧭', label: 'Explore', category: 'explore', titleFn: z => `Explore ${z}`, defaultMinutes: 30, seats: 2 },
  { emoji: '💻', label: 'Work', category: 'work', titleFn: z => `Co-work in ${z}`, defaultMinutes: 60, seats: 2 },
  { emoji: '🛍️', label: 'Shopping', category: 'shopping', titleFn: z => `Shopping in ${z}`, defaultMinutes: 45, seats: 2 },
  { emoji: '🤙', label: 'Casual', category: 'casual', titleFn: z => `Hangout in ${z}`, defaultMinutes: 20, seats: 2 },
];

const QUICK_STARTS = [
  { emoji: '☕', text: 'Coffee in 20 min', category: 'chai' as Category, minutes: 20, seats: 2 },
  { emoji: '🏸', text: 'Badminton tonight', category: 'sports' as Category, minutes: 180, seats: 4 },
  { emoji: '🚶', text: 'Walk nearby', category: 'walk' as Category, minutes: 10, seats: 2 },
  { emoji: '🍜', text: 'Dinner nearby', category: 'food' as Category, minutes: 60, seats: 3 },
];

const TIME_OPTIONS = [
  { label: '⚡ Now', minutes: 0, urgency: 'now' as Urgency },
  { label: '15 min', minutes: 15, urgency: 'now' as Urgency },
  { label: '30 min', minutes: 30, urgency: 'now' as Urgency },
  { label: '1 hour', minutes: 60, urgency: 'today' as Urgency },
  { label: 'Tonight', minutes: 240, urgency: 'today' as Urgency },
];

const SEAT_OPTIONS = [1, 2, 3, 4];

type Step = 'pick' | 'customize' | 'preview';

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const { user, createRequest, updateCredits } = useAppStore();
  const zone = user?.zone || user?.city || 'Bandra';

  const [step, setStep] = useState<Step>('pick');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('chai');
  const [timeMinutes, setTimeMinutes] = useState(20);
  const [urgency, setUrgency] = useState<Urgency>('now');
  const [seats, setSeats] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [location, setLocation] = useState(zone);
  const [postedRequestId, setPostedRequestId] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const creditCost = useMemo(() => {
    let cost = 1;
    if (urgency === 'now') cost += 0.5;
    if (urgency === 'today') cost += 0.25;
    if (category === 'help') cost -= 0.25;
    if (user?.trustLevel === 'trusted' || user?.trustLevel === 'anchor') cost -= 0.25;
    return Math.max(1, Math.round(cost * 10) / 10);
  }, [urgency, category, user?.trustLevel]);

  const canPost = title.trim().length > 0 && (user?.credits ?? 0) >= creditCost;

  // Animate step transitions
  useEffect(() => {
    if (pageRef.current?.children) {
      gsap.fromTo(pageRef.current.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' });
    }
  }, [step]);

  useEffect(() => {
    if (isPosted && successRef.current) {
      gsap.fromTo(successRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }, [isPosted]);

  const selectTemplate = (t: QuickTemplate) => {
    setCategory(t.category);
    setTitle(t.titleFn(zone));
    setTimeMinutes(t.defaultMinutes);
    setUrgency(t.defaultMinutes <= 30 ? 'now' : 'today');
    setSeats(t.seats);
    setStep('customize');
  };

  const selectQuickStart = (qs: typeof QUICK_STARTS[number]) => {
    setCategory(qs.category);
    setTitle(`${qs.emoji} ${qs.text}`);
    setTimeMinutes(qs.minutes);
    setUrgency(qs.minutes <= 30 ? 'now' : 'today');
    setSeats(qs.seats);
    setStep('preview');
  };

  const selectTime = (opt: typeof TIME_OPTIONS[number]) => {
    setTimeMinutes(opt.minutes);
    setUrgency(opt.urgency);
  };

  const handleSubmit = () => {
    if (!canPost || !user) return;
    setIsSubmitting(true);
    const now = new Date();
    const when = new Date(now.getTime() + timeMinutes * 60000);
    const expiresAt = new Date(when.getTime() + (urgency === 'now' ? 60 * 60000 : 4 * 3600000));

    createRequest({
      userId: user.id, userName: user.firstName, userTrust: user.trustLevel,
      userAvatar: user.avatar, userReliability: user.reliabilityScore,
      userHostRating: user.hostRating, title: title.trim(),
      category, urgency, when,
      location: { name: zone, distance: 0, coords: { lat: 19.0596, lng: 72.8295 } },
      seatsTotal: seats, seatsTaken: 0, expiresAt,
      liveShare: false, status: 'active', joinMode: 'auto', visibility: 'public', pendingJoinRequests: [],
    });
    updateCredits(-creditCost, 'Posted a plan');

    // Find the newly created request id
    const latestId = `req_${Date.now()}`;
    setPostedRequestId(latestId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsPosted(true);
    }, 400);
  };

  const timeLabel = timeMinutes === 0 ? 'Right now' : timeMinutes < 60 ? `In ${timeMinutes} min` : timeMinutes < 120 ? 'In 1 hour' : 'Later today';

  // ── Posted success screen ──
  if (isPosted) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center px-8">
        <div ref={successRef} className="text-center">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-xl font-bold mb-1">Your plan is live!</h2>
          <p className="text-sm text-muted-foreground mb-6">People nearby can now join</p>
          <div className="liquid-glass p-4 rounded-2xl mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCategoryEmoji(category)}</span>
              <h3 className="text-sm font-bold">{title}</h3>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>📍 {zone}</span>
              <span>⏰ {timeLabel}</span>
              <span>👥 Need {seats} {seats === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
          <Button className="w-full h-12" onClick={() => navigate('/home')}>
            Go to feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={() => step === 'pick' ? navigate(-1) : setStep(step === 'preview' ? 'customize' : 'pick')}
          className="w-8 h-8 rounded-full flex items-center justify-center tap-scale hover:bg-muted/50">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">
          {step === 'pick' ? 'New Plan' : step === 'customize' ? 'Customize' : 'Ready?'}
        </h1>
        {step === 'customize' && (
          <button onClick={() => setStep('preview')} className="ml-auto text-xs font-semibold text-primary tap-scale">
            Preview →
          </button>
        )}
      </div>

      <div ref={pageRef} className="flex-1 px-5 pb-28 overflow-y-auto">

        {/* ── STEP 1: Pick activity ── */}
        {step === 'pick' && (
          <>
            {/* Quick starts — one-tap plans */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">⚡ Quick start</p>
              <div className="space-y-2">
                {QUICK_STARTS.map((qs, i) => (
                  <button key={i} onClick={() => selectQuickStart(qs)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl liquid-glass tap-scale text-left transition-all hover:shadow-md active:scale-[0.98]">
                    <span className="text-2xl">{qs.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{qs.text}</p>
                      <p className="text-[10px] text-muted-foreground">📍 {zone} · 👥 {qs.seats} people</p>
                    </div>
                    <span className="text-xs text-primary font-semibold">Go →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity grid */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Or pick an activity</p>
              <div className="grid grid-cols-4 gap-2.5">
                {TEMPLATES.map((t) => (
                  <button key={t.category} onClick={() => selectTemplate(t)}
                    className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl liquid-glass tap-scale transition-all hover:shadow-md active:scale-[0.96]">
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-[11px] font-medium text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Customize (only 4 fields) ── */}
        {step === 'customize' && (
          <div className="space-y-5">
            {/* Editable title */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{getCategoryEmoji(category)}</span>
                <label className="text-xs font-medium text-muted-foreground">Activity</label>
              </div>
              {editingTitle ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                  className="w-full h-11 px-4 rounded-xl border border-primary/30 bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <button onClick={() => setEditingTitle(true)}
                  className="w-full flex items-center justify-between h-11 px-4 rounded-xl liquid-glass tap-scale">
                  <span className="text-sm font-semibold truncate">{title}</span>
                  <Pencil size={14} className="text-muted-foreground shrink-0" />
                </button>
              )}
            </div>

            {/* Location (auto) */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl liquid-glass">
              <span className="text-lg">📍</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{zone}</p>
                <p className="text-[10px] text-muted-foreground">Your current area</p>
              </div>
              <span className="text-xs text-primary/60">✓</span>
            </div>

            {/* Time — big tappable pills */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2.5 block">⏰ When?</label>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map((opt) => (
                  <button key={opt.label} onClick={() => selectTime(opt)}
                    className={cn(
                      'h-10 px-4 rounded-full text-sm font-medium tap-scale transition-all',
                      timeMinutes === opt.minutes
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'liquid-glass text-foreground'
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seats — big numbered buttons */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2.5 block">👥 How many people?</label>
              <div className="flex gap-3">
                {SEAT_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setSeats(n)}
                    className={cn(
                      'flex-1 h-14 rounded-2xl text-lg font-bold tap-scale transition-all',
                      seats === n
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'liquid-glass text-foreground'
                    )}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                {seats === 1 ? 'Looking for 1 buddy' : `Need ${seats} people`}
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Preview ── */}
        {step === 'preview' && (
          <div className="space-y-5 pt-2">
            <div className="liquid-glass-heavy p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                  {getCategoryEmoji(category)}
                </div>
                <div>
                  <h2 className="text-[15px] font-bold leading-tight">{title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">by {user?.firstName || 'You'}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <span>📍</span>
                  <span className="font-medium">{zone}</span>
                  <span className="text-[10px] text-muted-foreground">Your area</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <span>⏰</span>
                  <span className="font-medium">{timeLabel}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <span>👥</span>
                  <span className="font-medium">Need {seats} {seats === 1 ? 'person' : 'people'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💰</span>
                  <span className="text-xs text-muted-foreground">Cost: <span className="font-bold text-foreground">{creditCost} credit{creditCost !== 1 ? 's' : ''}</span></span>
                </div>
                <span className="text-[10px] text-muted-foreground">Balance: {user?.credits ?? 0}</span>
              </div>
            </div>

            <button onClick={() => setStep('customize')} className="w-full text-center text-xs text-primary font-semibold tap-scale py-2">
              ← Edit details
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step !== 'pick' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 liquid-glass-nav">
          <div className="max-w-md mx-auto">
            {step === 'customize' ? (
              <Button className="w-full h-12" onClick={() => setStep('preview')}>
                Preview Plan →
              </Button>
            ) : (
              <Button className="w-full h-12" onClick={handleSubmit} disabled={!canPost || isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : '🚀 Post Plan'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
