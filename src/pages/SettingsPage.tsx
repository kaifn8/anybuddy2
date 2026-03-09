import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, reset } = useAppStore();
  const { isDark, toggleTheme } = useTheme();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleLogout = () => {
    reset();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="mobile-container min-h-screen bg-ambient pb-24">
        <TopBar showBack title="Settings" />
        <div className="flex flex-col items-center justify-center px-8 pt-32">
          <span className="text-5xl block mb-4">⚙️</span>
          <p className="text-sm font-medium text-foreground mb-1">Settings</p>
          <p className="text-xs text-muted-foreground mb-5">Sign in to manage your preferences</p>
          <Button onClick={() => navigate('/signup')} className="h-11 px-8">Sign In</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Settings" />

      <div className="px-5 pt-4 space-y-3">

        {/* Profile Card */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full liquid-glass-heavy rounded-3xl p-4 tap-scale text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                alt={user.firstName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-border/30"
              />
              {user.isVerified && (
                <span className="absolute -bottom-1 -right-1 text-sm bg-background rounded-full">✅</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold truncate">{user.firstName}</h2>
              <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  ⚡ {user.credits} credits
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-semibold capitalize">
                  🏆 {user.trustLevel}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground/50 shrink-0" />
          </div>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <QuickAction emoji="⚡" label="Credits" sublabel={`${user.credits} pts`} onClick={() => navigate('/credits')} color="bg-primary/10" />
          <QuickAction emoji="👋" label="Invite" sublabel="Earn credits" onClick={() => navigate('/invite')} color="bg-success/10" />
        </div>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsToggle
            icon="🌙" iconBg="bg-indigo-500/15 dark:bg-indigo-500/25"
            label="Dark Mode"
            checked={isDark}
            onCheckedChange={toggleTheme}
          />
          <Separator className="mx-4 bg-border/20" />
          <SettingsLink
            icon="🌍" iconBg="bg-blue-500/15 dark:bg-blue-500/25"
            label="Language" value="English"
            soon
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsToggle
            icon="🔔" iconBg="bg-orange-500/15 dark:bg-orange-500/25"
            label="Push Notifications"
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
          <Separator className="mx-4 bg-border/20" />
          <SettingsToggle
            icon="📧" iconBg="bg-blue-500/15 dark:bg-blue-500/25"
            label="Email Notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsToggle
            icon="📍" iconBg="bg-green-500/15 dark:bg-green-500/25"
            label="Location Sharing"
            checked={locationSharing}
            onCheckedChange={setLocationSharing}
          />
          <Separator className="mx-4 bg-border/20" />
          <SettingsLink
            icon="🔒" iconBg="bg-slate-500/15 dark:bg-slate-500/25"
            label="Privacy & Safety"
            soon
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsLink
            icon="❓" iconBg="bg-violet-500/15 dark:bg-violet-500/25"
            label="Help Center"
            soon
          />
          <Separator className="mx-4 bg-border/20" />
          <SettingsLink
            icon="🐛" iconBg="bg-red-500/15 dark:bg-red-500/25"
            label="Report a Bug"
            soon
          />
          <Separator className="mx-4 bg-border/20" />
          <SettingsLink
            icon="⭐" iconBg="bg-yellow-500/15 dark:bg-yellow-500/25"
            label="Rate AnyBuddy"
            soon
          />
        </SettingsSection>

        {/* Logout */}
        <button
          className="w-full liquid-glass-heavy rounded-2xl py-3.5 px-5 tap-scale border border-destructive/20 hover:bg-destructive/5 transition-all"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-base">🚪</span>
            <span className="text-sm font-bold text-destructive">Log Out</span>
          </div>
        </button>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground/50">AnyBuddy v1.0.0</p>
          <p className="text-[10px] text-muted-foreground/35 mt-0.5">Made with 💜 in Mumbai</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

/* ── Sub-components ── */

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="liquid-glass-heavy rounded-2xl overflow-hidden">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3.5 pb-1.5">
        {title}
      </p>
      {children}
      <div className="h-1" />
    </div>
  );
}

function SettingsToggle({
  icon, iconBg, label, checked, onCheckedChange,
}: {
  icon: string; iconBg: string; label: string;
  checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-background/20 transition-colors">
      <div className="flex items-center gap-3">
        <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-base', iconBg)}>
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsLink({
  icon, iconBg, label, value, onClick, soon,
}: {
  icon: string; iconBg: string; label: string;
  value?: string; onClick?: () => void; soon?: boolean;
}) {
  return (
    <button
      onClick={soon ? undefined : onClick}
      disabled={soon}
      className={cn(
        'w-full flex items-center justify-between px-4 py-2.5 tap-scale hover:bg-background/20 transition-colors',
        soon && 'opacity-60 cursor-default'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-base', iconBg)}>
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {value && <span className="text-xs text-muted-foreground">{value}</span>}
        {soon
          ? <span className="text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">SOON</span>
          : <ChevronRight size={16} className="text-muted-foreground/40" />}
      </div>
    </button>
  );
}

function QuickAction({ emoji, label, sublabel, onClick, color }: {
  emoji: string; label: string; sublabel: string; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick} className="liquid-glass-heavy rounded-2xl p-3.5 tap-scale text-left flex items-center gap-3">
      <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0', color)}>
        {emoji}
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      </div>
    </button>
  );
}
