import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, reset } = useAppStore();
  const { isDark, toggleTheme } = useTheme();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleLogout = () => { reset(); navigate('/'); };

  if (!user) {
    return (
      <div className="mobile-container min-h-screen bg-ambient pb-24">
        <TopBar showBack title="Settings" />
        <div className="flex flex-col items-center justify-center px-8 pt-32">
          <div className="w-16 h-16 rounded-[1.25rem] liquid-glass flex items-center justify-center mb-5">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Settings</p>
          <p className="text-sm text-muted-foreground mb-6">Sign in to manage your preferences</p>
          <Button onClick={() => navigate('/signup')} className="h-11 px-8">Sign In</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Settings" />
      <div className="px-5 pt-5 space-y-3">
        {/* Profile Card */}
        <button onClick={() => navigate('/profile')} className="w-full liquid-glass-heavy tap-scale text-left" style={{ padding: '1.125rem' }}>
          <div className="flex items-center gap-3.5">
            <GradientAvatar name={user.firstName} size={56} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-bold tracking-tight truncate">{user.firstName}</h2>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user.phone}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-bold">
                  ⚡ {user.credits} credits
                </span>
              </div>
            </div>
            <span className="text-muted-foreground/30 shrink-0">›</span>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <QuickAction emoji="⚡" label="Credits" sublabel={`${user.credits} pts`} onClick={() => navigate('/credits')} />
          <QuickAction emoji="👥" label="Invite" sublabel="Earn credits" onClick={() => navigate('/invite')} />
        </div>

        <SettingsSection title="Appearance">
          <SettingsToggle emoji="🌙" iconBg="bg-indigo-500/10" label="Dark Mode" checked={isDark} onCheckedChange={toggleTheme} />
          <div className="mx-4 h-px bg-border/15" />
          <SettingsLink emoji="🌐" iconBg="bg-blue-500/10" label="Language" value="English" soon />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsToggle emoji="🔔" iconBg="bg-orange-500/10" label="Push Notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          <div className="mx-4 h-px bg-border/15" />
          <SettingsToggle emoji="✉️" iconBg="bg-blue-500/10" label="Email Notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </SettingsSection>

        <SettingsSection title="Privacy">
          <SettingsToggle emoji="📍" iconBg="bg-green-500/10" label="Location Sharing" checked={locationSharing} onCheckedChange={setLocationSharing} />
          <div className="mx-4 h-px bg-border/15" />
          <SettingsLink emoji="🔒" iconBg="bg-slate-500/10" label="Privacy & Safety" soon />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsLink emoji="❓" iconBg="bg-violet-500/10" label="Help Center" soon />
          <div className="mx-4 h-px bg-border/15" />
          <SettingsLink emoji="🐛" iconBg="bg-red-500/10" label="Report a Bug" soon />
          <div className="mx-4 h-px bg-border/15" />
          <SettingsLink emoji="⭐" iconBg="bg-yellow-500/10" label="Rate AnyBuddy" soon />
        </SettingsSection>

        <button className="w-full liquid-glass-heavy py-3.5 px-5 tap-scale transition-all hover:bg-destructive/3" onClick={handleLogout}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🚪</span>
            <span className="text-[14px] font-bold text-destructive tracking-tight">Log Out</span>
          </div>
        </button>

        <div className="text-center py-3">
          <p className="text-[11px] text-muted-foreground/40 font-medium">AnyBuddy v1.0.0</p>
          <p className="text-[10px] text-muted-foreground/25 mt-0.5">Made in Mumbai</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="liquid-glass-heavy overflow-hidden">
      <p className="section-label px-4 pt-4 pb-2">{title}</p>
      {children}
      <div className="h-1.5" />
    </div>
  );
}

function SettingsToggle({ emoji, iconBg, label, checked, onCheckedChange }: {
  emoji: string; iconBg: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-background/10 transition-colors">
      <div className="flex items-center gap-3">
        <span className={cn('w-8 h-8 rounded-[0.625rem] flex items-center justify-center', iconBg)} style={{ borderRadius: '0.625rem' }}>
          <span className="text-[15px]">{emoji}</span>
        </span>
        <span className="text-[14px] font-medium tracking-tight">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsLink({ emoji, iconBg, label, value, onClick, soon }: {
  emoji: string; iconBg: string; label: string; value?: string; onClick?: () => void; soon?: boolean;
}) {
  return (
    <button onClick={soon ? undefined : onClick} disabled={soon}
      className={cn('w-full flex items-center justify-between px-4 py-3 tap-scale hover:bg-background/10 transition-colors', soon && 'opacity-50 cursor-default')}>
      <div className="flex items-center gap-3">
        <span className={cn('w-8 h-8 rounded-[0.625rem] flex items-center justify-center', iconBg)} style={{ borderRadius: '0.625rem' }}>
          <span className="text-[15px]">{emoji}</span>
        </span>
        <span className="text-[14px] font-medium tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-muted-foreground">{value}</span>}
        {soon ? <span className="text-[8px] font-bold bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full uppercase tracking-wider">Soon</span>
          : <span className="text-muted-foreground/30">›</span>}
      </div>
    </button>
  );
}

function QuickAction({ emoji, label, sublabel, onClick }: {
  emoji: string; label: string; sublabel: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="liquid-glass-heavy p-4 tap-scale text-left flex items-center gap-3">
      <span className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0" style={{ borderRadius: '0.75rem' }}>
        <span className="text-[17px]">{emoji}</span>
      </span>
      <div>
        <p className="text-[14px] font-bold tracking-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </button>
  );
}
