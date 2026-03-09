import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PricingRule {
  id: string;
  label: string;
  description: string;
  value: number;
  unit: string;
}

const DEFAULT_PRICING: PricingRule[] = [
  { id: 'base', label: 'Base cost to create', description: 'Default credit cost to create a plan', value: 1, unit: 'credit' },
  { id: 'now', label: 'Right Now surcharge', description: 'Extra cost for urgent "now" plans', value: 0.5, unit: 'credit' },
  { id: 'today', label: 'Today surcharge', description: 'Extra cost for same-day plans', value: 0.25, unit: 'credit' },
  { id: 'week', label: 'This Week surcharge', description: 'Extra cost for weekly plans', value: 0, unit: 'credit' },
  { id: 'join_earn', label: 'Join earn rate', description: 'Credits earned when joining a plan', value: 0.5, unit: 'credit' },
  { id: 'signup_bonus', label: 'Signup bonus', description: 'Credits given to new users', value: 3, unit: 'credits' },
  { id: 'referral', label: 'Referral bonus', description: 'Credits for each referred user', value: 1, unit: 'credit' },
];

export default function AdminPricing() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [edited, setEdited] = useState(false);

  const handleChange = (id: string, value: number) => {
    setPricing(p => p.map(r => r.id === id ? { ...r, value } : r));
    setEdited(true);
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold">Credit Pricing</h2>
        <p className="text-sm text-muted-foreground">Configure credit costs and earn rates</p>
      </div>

      <div className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-sm divide-y divide-border/15">
        {pricing.map((rule) => (
          <div key={rule.id} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{rule.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{rule.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                value={rule.value}
                onChange={(e) => handleChange(rule.id, parseFloat(e.target.value) || 0)}
                step={0.25}
                min={0}
                className="w-16 h-8 rounded-lg border border-border/30 bg-background text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="text-[10px] text-muted-foreground w-10">{rule.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {edited && (
        <div className="flex gap-2">
          <button
            onClick={() => { setPricing(DEFAULT_PRICING); setEdited(false); }}
            className="flex-1 h-10 rounded-xl border border-border/30 text-sm font-medium text-muted-foreground tap-scale"
          >
            Reset
          </button>
          <button
            onClick={() => setEdited(false)}
            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tap-scale shadow-sm"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Trust level multipliers */}
      <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trust Level Discounts</h3>
        <div className="space-y-2.5">
          {[
            { level: 'Seed', discount: '0%', color: 'text-muted-foreground' },
            { level: 'Solid', discount: '10%', color: 'text-secondary' },
            { level: 'Trusted', discount: '20%', color: 'text-primary' },
            { level: 'Anchor', discount: '35%', color: 'text-warning' },
          ].map((item) => (
            <div key={item.level} className="flex items-center justify-between text-sm">
              <span className={cn('font-medium', item.color)}>{item.level}</span>
              <span className="text-muted-foreground text-xs">{item.discount} off creation cost</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
