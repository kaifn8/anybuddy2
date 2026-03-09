import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { reset } = useAppStore();
  
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', action: () => navigate('/edit-profile') },
        { icon: '🔔', label: 'Notifications', action: () => navigate('/notifications') },
        { icon: '🔒', label: 'Privacy', action: () => {} },
      ]
    },
    {
      title: 'App',
      items: [
        { icon: '🌍', label: 'Language', action: () => {} },
        { icon: '🎨', label: 'Appearance', action: () => {} },
        { icon: '📍', label: 'Location', action: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help Center', action: () => {} },
        { icon: '📧', label: 'Contact Us', action: () => {} },
        { icon: '⭐', label: 'Rate AnyBuddy', action: () => {} },
      ]
    },
    {
      title: 'Legal',
      items: [
        { icon: '📄', label: 'Terms of Service', action: () => {} },
        { icon: '🔐', label: 'Privacy Policy', action: () => {} },
      ]
    },
  ];
  
  const handleLogout = () => {
    reset();
    navigate('/');
  };
  
  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Settings" />
      
      <div className="px-5 pt-5 space-y-4">
        {settingsSections.map((section, i) => (
          <div key={i} className="liquid-glass-heavy rounded-3xl overflow-hidden">
            <h3 className="text-xs font-semibold text-muted-foreground px-4 pt-4 pb-2">{section.title.toUpperCase()}</h3>
            <div>
              {section.items.map((item, j) => (
                <button
                  key={j}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-4 py-3 tap-scale hover:bg-background/50 transition-colors border-t border-border/20 first:border-t-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {/* App version */}
        <div className="text-center pt-2">
          <p className="text-2xs text-muted-foreground">Version 1.0.0</p>
        </div>
        
        {/* Logout button */}
        <div className="pt-2 pb-2">
          <button 
            className="w-full text-xs text-destructive font-bold hover:text-destructive/80 transition-colors tap-scale" 
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
