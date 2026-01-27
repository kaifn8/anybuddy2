import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Coins, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { CategoryIcon, getCategoryLabel } from '@/components/icons/CategoryIcon';
import type { Category, Urgency } from '@/types/anybuddy';

const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];
const timers = [
  { value: null, label: 'No timer' },
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
  
  // Calculate credit cost
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
    
    setTimeout(() => {
      navigate('/home');
    }, 500);
  };
  
  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)} className="tap-scale">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold">Create Request</h1>
        </div>
      </header>
      
      <div className="p-4 pb-32 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            What do you need?
          </label>
          <Input
            placeholder="e.g., Anyone for chai and a chat?"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            className="text-lg py-6 rounded-xl"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {title.length}/120
          </p>
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all tap-scale ${
                  category === cat
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-card border-2 border-transparent card-shadow'
                }`}
              >
                <CategoryIcon category={cat} />
                <span className="text-sm">{getCategoryLabel(cat)}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* When */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            When?
          </label>
          <div className="flex gap-2">
            {(['now', 'today', 'week'] as Urgency[]).map((u) => (
              <button
                key={u}
                onClick={() => setUrgency(u)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all tap-scale ${
                  urgency === u
                    ? 'gradient-primary text-white'
                    : 'bg-card text-foreground card-shadow'
                }`}
              >
                {u === 'now' && '⚡ Right Now'}
                {u === 'today' && '☀️ Today'}
                {u === 'week' && '📅 This Week'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Timer (only for "now") */}
        {urgency === 'now' && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              <Clock size={16} className="inline mr-2" />
              Auto-expire after
            </label>
            <div className="flex gap-2">
              {timers.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTimer(t.value)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all tap-scale text-sm ${
                    timer === t.value
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-card text-foreground card-shadow'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Location */}
        <div className="bg-card rounded-xl p-4 card-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.city || 'Koramangala'}</p>
                <p className="text-sm text-muted-foreground">Auto-detected</p>
              </div>
            </div>
            <Check size={20} className="text-success" />
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Share live location</span>
            <Switch checked={liveShare} onCheckedChange={setLiveShare} />
          </div>
        </div>
        
        {/* Seats */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            <Users size={16} className="inline mr-2" />
            How many can join? ({seats[0]})
          </label>
          <Slider
            value={seats}
            onValueChange={setSeats}
            min={1}
            max={10}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 person</span>
            <span>10 people</span>
          </div>
        </div>
        
        {/* Credit Cost */}
        <div className="bg-accent/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={20} className="text-accent-foreground" />
              <span className="font-medium">Cost to post</span>
            </div>
            <span className="text-2xl font-bold text-primary">{creditCost} credits</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your balance: {user?.credits ?? 0} credits
          </p>
        </div>
      </div>
      
      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-effect border-t border-border">
        <div className="max-w-md mx-auto">
          <Button
            className="w-full gradient-primary py-6 tap-scale disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canPost || isSubmitting}
          >
            {isSubmitting ? (
              <>Posting...</>
            ) : (
              <>Post Request 🚀</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
