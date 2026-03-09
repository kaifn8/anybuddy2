import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore, createDefaultUser } from '@/store/useAppStore';
import type { Category } from '@/types/anybuddy';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Step = 'method' | 'phone' | 'otp' | 'name' | 'photo' | 'bio' | 'age' | 'interests' | 'zone';
const steps: Step[] = ['method', 'phone', 'otp', 'name', 'photo', 'bio', 'age', 'interests', 'zone'];
const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual', 'sports', 'food', 'walk'];
const zones = ['Bandra', 'Andheri', 'Colaba', 'Juhu', 'Powai', 'Lower Parel', 'Versova', 'Worli', 'Dadar', 'Malad'];

const stepConfig: Record<Step, { emoji: string; title: string; subtitle: string }> = {
  method: { emoji: '👋', title: 'Welcome to AnyBuddy', subtitle: 'Choose how to sign in' },
  phone: { emoji: '📱', title: "What's your number?", subtitle: "We'll text you a code" },
  otp: { emoji: '🔐', title: 'Enter the code', subtitle: '' },
  name: { emoji: '😊', title: "What's your name?", subtitle: 'How people will see you' },
  photo: { emoji: '📸', title: 'Add a profile photo', subtitle: 'Helps people recognize you' },
  bio: { emoji: '✍️', title: 'Write a short bio', subtitle: 'Tell people about yourself' },
  age: { emoji: '🎂', title: 'Your age range', subtitle: 'Helps find the right crew' },
  interests: { emoji: '🎯', title: "What's your vibe?", subtitle: 'Pick at least 2' },
  zone: { emoji: '📍', title: 'Your zone', subtitle: 'Where you mostly hang out' },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();
  
  const [step, setStep] = useState<Step>('method');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'google' | 'apple'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [interests, setInterests] = useState<Category[]>([]);
  const [zone, setZone] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    }
  }, [step]);
  
  const goToStep = (nextStep: Step) => {
    gsap.to(contentRef.current, { opacity: 0, y: -12, duration: 0.15, onComplete: () => setStep(nextStep) });
  };
  
  useEffect(() => {
    if (step === 'otp' && otp.every(d => d) && otp.join('').length === 4) goToStep('name');
  }, [otp, step]);
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };
  
  const handleSocialLogin = (method: 'google' | 'apple') => {
    setLoginMethod(method);
    setFirstName(method === 'google' ? 'User' : 'User');
    goToStep('name');
  };
  
  const handleComplete = () => {
    if (interests.length >= 2 && zone) {
      gsap.to(contentRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
        setUser(createDefaultUser({
          id: `user_${Date.now()}`, firstName, phone, email, bio,
          ageRange, city: 'Mumbai', zone, interests, loginMethod,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        }));
        setOnboarded(true);
        navigate('/home');
      }});
    }
  };
  
  const toggleInterest = (cat: Category) => {
    setInterests(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  
  const stepIndex = steps.indexOf(step);
  const config = stepConfig[step];
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-ambient">
      <div className="flex-1 px-6 pt-8">
        {/* Progress */}
        {step !== 'method' && (
          <div className="flex gap-1 mb-10">
            {steps.slice(1).map((_, i) => (
              <div key={i} className={cn(
                'h-0.5 rounded-full flex-1 transition-all duration-300',
                i < stepIndex ? 'bg-primary' : 'bg-muted-foreground/12'
              )} />
            ))}
          </div>
        )}
        
        <div ref={contentRef}>
          <div className="mb-8">
            <span className="text-3xl block mb-3">{config.emoji}</span>
            <h1 className="text-heading font-bold text-foreground">{config.title}</h1>
            {config.subtitle && <p className="text-sm text-muted-foreground mt-1.5">{config.subtitle}</p>}
          </div>
          
          {/* Login method */}
          {step === 'method' && (
            <div className="space-y-3">
              <button onClick={() => { setLoginMethod('phone'); goToStep('phone'); }}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl liquid-glass text-left tap-scale">
                <span className="text-lg">📱</span>
                <div><p className="text-sm font-semibold">Continue with Phone</p><p className="text-2xs text-muted-foreground">OTP verification</p></div>
              </button>
              <button onClick={() => { setLoginMethod('email'); goToStep('phone'); }}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl liquid-glass text-left tap-scale">
                <span className="text-lg">✉️</span>
                <div><p className="text-sm font-semibold">Continue with Email</p><p className="text-2xs text-muted-foreground">Magic link</p></div>
              </button>
            </div>
          )}
          
          {/* Phone */}
          {step === 'phone' && loginMethod === 'phone' && (
            <div className="space-y-5">
              <div className="flex gap-2.5">
                <div className="w-16 h-12 flex items-center justify-center liquid-glass text-sm font-semibold rounded-xl">🇮🇳 +91</div>
                <input type="tel" placeholder="Phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              </div>
              <Button className="w-full h-12" onClick={() => phone.length >= 10 && goToStep('otp')} disabled={phone.length < 10}>Send Code</Button>
            </div>
          )}
          
          {step === 'phone' && loginMethod === 'email' && (
            <div className="space-y-5">
              <input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
              <Button className="w-full h-12" onClick={() => email.includes('@') && goToStep('otp')} disabled={!email.includes('@')}>Send Magic Link</Button>
            </div>
          )}
          
          {/* OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground -mt-4">Sent to {loginMethod === 'phone' ? `+91 ${phone}` : email}</p>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-xl font-bold rounded-xl liquid-glass focus:ring-2 focus:ring-primary/20 focus:outline-none" autoFocus={i === 0} />
                ))}
              </div>
              <button className="w-full text-primary text-sm font-semibold py-2 tap-scale">Resend code</button>
            </div>
          )}
          
          {/* Name */}
          {step === 'name' && (
            <div className="space-y-5">
              <input placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <Button className="w-full h-12" onClick={() => firstName.trim() && goToStep('photo')} disabled={!firstName.trim()}>Continue</Button>
            </div>
          )}
          
          {/* Photo */}
          {step === 'photo' && (
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="w-28 h-28 rounded-full liquid-glass-heavy flex items-center justify-center">
                  <span className="text-4xl">📷</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full h-12">Upload Photo</Button>
              <button className="w-full text-primary text-sm font-semibold py-2 tap-scale" onClick={() => goToStep('bio')}>Skip for now</button>
            </div>
          )}
          
          {/* Bio */}
          {step === 'bio' && (
            <div className="space-y-5">
              <textarea placeholder="Coffee addict ☕ Love meeting new people..." value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 120))}
                className="w-full h-24 px-4 py-3 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" autoFocus />
              <p className="text-2xs text-muted-foreground text-right">{bio.length}/120</p>
              <Button className="w-full h-12" onClick={() => goToStep('age')}>Continue</Button>
            </div>
          )}
          
          {/* Age */}
          {step === 'age' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                {ageRanges.map((range) => (
                  <Button key={range} onClick={() => setAgeRange(range)}
                    variant={ageRange === range ? 'default' : 'secondary'}
                    className="py-3.5 px-4 h-auto"
                  >{range}</Button>
                ))}
              </div>
              <Button className="w-full h-12" onClick={() => ageRange && goToStep('interests')} disabled={!ageRange}>Continue</Button>
            </div>
          )}
          
          {/* Interests */}
          {step === 'interests' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const selected = interests.includes(cat);
                  return (
                    <Button key={cat} onClick={() => toggleInterest(cat)}
                      variant={selected ? 'default' : 'secondary'}
                      className="flex flex-col items-center gap-1 py-3 px-2 h-auto"
                    >
                      <span className="text-lg">{getCategoryEmoji(cat)}</span>
                      <span className="text-xs">{getCategoryLabel(cat)}</span>
                    </Button>
                  );
                })}
              </div>
              <Button className="w-full h-12" onClick={() => interests.length >= 2 && goToStep('zone')} disabled={interests.length < 2}>Continue</Button>
              {interests.length > 0 && interests.length < 2 && (
                <p className="text-center text-2xs text-muted-foreground">Pick {2 - interests.length} more</p>
              )}
            </div>
          )}
          
          {/* Zone */}
          {step === 'zone' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {zones.map((z) => (
                  <Button key={z} onClick={() => setZone(z)}
                    variant={zone === z ? 'default' : 'secondary'}
                    className="py-3 px-3 h-auto text-xs text-left justify-start"
                  >
                    📍 {z}
                  </Button>
                ))}
              </div>
              <Button className="w-full h-12" onClick={handleComplete} disabled={!zone || interests.length < 2}>Let's Go</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}