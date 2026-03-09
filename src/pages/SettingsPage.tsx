import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, reset } = useAppStore();
  
  // Local state for toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { 
          icon: '👤', 
          label: 'Edit Profile', 
          type: 'link',
          action: () => navigate('/profile') 
        },
        { 
          icon: '🔔', 
          label: 'Push Notifications', 
          type: 'toggle',
          value: pushNotifications,
          onChange: setPushNotifications
        },
        { 
          icon: '📧', 
          label: 'Email Notifications', 
          type: 'toggle',
          value: emailNotifications,
          onChange: setEmailNotifications
        },
        { 
          icon: '🔒', 
          label: 'Privacy & Safety', 
          type: 'link',
          action: () => {} 
        },
        { 
          icon: '🔐', 
          label: 'Change Password', 
          type: 'link',
          action: () => {} 
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: '🎨', 
          label: 'Dark Mode', 
          type: 'toggle',
          value: darkMode,
          onChange: setDarkMode
        },
        { 
          icon: '🔊', 
          label: 'Sound Effects', 
          type: 'toggle',
          value: soundEnabled,
          onChange: setSoundEnabled
        },
        { 
          icon: '📍', 
          label: 'Location Sharing', 
          type: 'toggle',
          value: locationSharing,
          onChange: setLocationSharing
        },
        { 
          icon: '🌍', 
          label: 'Language', 
          subtitle: 'English',
          type: 'link',
          action: () => {} 
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          icon: '❓', 
          label: 'Help Center', 
          type: 'link',
          action: () => {} 
        },
        { 
          icon: '💬', 
          label: 'Contact Support', 
          type: 'link',
          action: () => {} 
        },
        { 
          icon: '⭐', 
          label: 'Rate AnyBuddy', 
          type: 'link',
          action: () => {} 
        },
        { 
          icon: '🐛', 
          label: 'Report a Bug', 
          type: 'link',
          action: () => {} 
        },
      ]
    },
    {
      title: 'Legal',
      items: [
        { 
          icon: '📄', 
          label: 'Terms of Service', 
          type: 'link',
          action: () => {} 
        },
        { 
          icon: '🔐', 
          label: 'Privacy Policy', 
          type: 'link',
          action: () => {} 
        },
        { 
          icon: '📋', 
          label: 'Community Guidelines', 
          type: 'link',
          action: () => {} 
        },
      ]
    },
  ];
  
  const handleLogout = () => {
    reset();
    navigate('/');
  };
  
  if (!user) return null;
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Settings" />
      
      <div className="px-5 pt-5 space-y-4">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
          
          <div className="relative liquid-glass-heavy p-5 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`}
                  alt={user.firstName} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-border/30" 
                />
                {user.isVerified && (
                  <span className="absolute -bottom-1 -right-1 text-sm">✅</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold truncate">{user.firstName}</h2>
                <p className="text-xs text-muted-foreground">{user.phone}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                    ⚡ {user.credits} credits
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-semibold">
                    🏆 {user.trustLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Sections */}
        {settingsSections.map((section, i) => (
          <div key={i} className="liquid-glass-heavy rounded-3xl overflow-hidden">
            <h3 className="text-xs font-semibold text-muted-foreground px-5 pt-4 pb-2 tracking-wide">
              {section.title.toUpperCase()}
            </h3>
            <div>
              {section.items.map((item, j) => (
                <div key={j}>
                  {j > 0 && <Separator className="mx-5 bg-border/20" />}
                  {item.type === 'toggle' ? (
                    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-background/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <Switch 
                        checked={item.value as boolean}
                        onCheckedChange={item.onChange as (checked: boolean) => void}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-5 py-3.5 tap-scale hover:bg-background/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div className="text-left">
                          <span className="text-sm font-medium block">{item.label}</span>
                          {item.subtitle && (
                            <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Logout Button */}
        <div className="pt-2 pb-4">
          <button 
            className="w-full liquid-glass-heavy rounded-2xl py-4 px-5 tap-scale hover:bg-destructive/5 transition-all border border-destructive/20" 
            onClick={handleLogout}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-base">🚪</span>
              <span className="text-sm font-bold text-destructive">Log Out</span>
            </div>
          </button>
        </div>
        
        {/* App Version */}
        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/60">AnyBuddy v1.0.0</p>
          <p className="text-[10px] text-muted-foreground/40 mt-1">Made with 💜 in Mumbai</p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
