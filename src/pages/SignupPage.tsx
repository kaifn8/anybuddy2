import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/types/anybuddy';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp' | 'name' | 'age' | 'interests';
const steps: Step[] = ['phone', 'otp', 'name', 'age', 'interests'];
const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];

const stepEmojis: Record<Step, string> = { phone: '📱', otp: '🔐', name: '😊', age: '🎂', interests: '🎯' };
const stepTitles: Record<Step, { title: string; subtitle: string }> = {
  phone: { title: "What's your number?", subtitle: "We'll text you a magic code ✨" },
  otp: { title: 'Enter the code', subtitle: '' },
  name: { title: "What should we call you?", subtitle: 'Just your first name is cool' },
  age: { title: 'How old are you?', subtitle: 'Helps us find the right crew 🤝' },
  interests: { title: "What's your vibe?", subtitle: 'Pick at least 2 things you love' },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [interests, setInterests] = useState<Category[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, [step]);
  
  const goToStep = (nextStep: Step) => {
    gsap.to(contentRef.current, { opacity: 0, y: -15, duration: 0.2, onComplete: () => setStep(nextStep) });
  };
  
  const handlePhoneSubmit = () => { if (phone.length >= 10) goToStep('otp'); };
  
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
  
  const handleNameSubmit = () => { if (firstName.trim()) goToStep('age'); };
  const handleAgeSubmit = () => { if (ageRange) goToStep('interests'); };
  
  const handleComplete = () => {
    if (interests.length >= 2) {
      gsap.to(contentRef.current, { opacity: 0, scale: 0.98, duration: 0.25, onComplete: () => {
        setUser({
          id: `user_${Date.now()}`, firstName, phone, ageRange, city: 'Bangalore',
          interests, trustLevel: 'seed', credits: 3, completedJoins: 0, createdAt: new Date(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        });
        setOnboarded(true);
        navigate('/home');
      }});
    }
  };
  
  const toggleInterest = (category: Category) => {
    setInterests((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);
  };
  
  const stepIndex = steps.indexOf(step);
  const { title, subtitle } = stepTitles[step];
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-ambient">
      <div className="flex-1 px-6 py-8">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-10">
          {steps.map((_, index) => (
            <div key={index} className={cn(
              'h-1 rounded-full transition-all duration-300',
              index <= stepIndex ? 'w-10 bg-primary' : 'w-2 bg-muted-foreground/15'
            )} />
          ))}
        </div>
        
        <div ref={contentRef}>
          <div className="mb-8">
            <span className="text-4xl mb-4 block">{stepEmojis[step]}</span>
            <h1 className="text-title font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>}
          </div>
          
          {step === 'phone' && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="w-16 h-12 flex items-center justify-center liquid-glass text-foreground font-semibold text-sm" style={{ borderRadius: '0.875rem' }}>
                  🇮🇳 +91
                </div>
                <Input type="tel" placeholder="Phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 h-12 rounded-xl liquid-glass border-0 text-base font-medium" autoFocus
                />
              </div>
              <Button className="w-full h-12 text-sm font-semibold rounded-xl glass-button-primary" onClick={handlePhoneSubmit} disabled={phone.length < 10}>
                Send Code →
              </Button>
            </div>
          )}
          
          {step === 'otp' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground -mt-4">Sent to +91 {phone} 📩</p>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-15 h-15 text-center text-2xl font-bold rounded-2xl liquid-glass focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <button className="w-full text-primary text-sm font-semibold py-2 tap-scale">Didn't get it? Resend 🔄</button>
            </div>
          )}
          
          {step === 'name' && (
            <div className="space-y-6">
              <Input placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus
                className="h-12 rounded-xl liquid-glass border-0 text-lg font-medium"
              />
              <Button className="w-full h-12 text-sm font-semibold rounded-xl glass-button-primary" onClick={handleNameSubmit} disabled={!firstName.trim()}>
                Continue →
              </Button>
            </div>
          )}
          
          {step === 'age' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {ageRanges.map((range) => (
                  <button key={range} onClick={() => setAgeRange(range)}
                    className={cn('py-4 px-4 rounded-2xl text-sm font-semibold transition-all tap-scale',
                      ageRange === range ? 'glass-button-primary' : 'liquid-glass text-foreground'
                    )}>
                    {range}
                  </button>
                ))}
              </div>
              <Button className="w-full h-12 text-sm font-semibold rounded-xl glass-button-primary" onClick={handleAgeSubmit} disabled={!ageRange}>
                Continue →
              </Button>
            </div>
          )}
          
          {step === 'interests' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const selected = interests.includes(category);
                  return (
                    <button key={category} onClick={() => toggleInterest(category)}
                      className={cn('flex items-center gap-3 py-4 px-4 rounded-2xl text-sm font-semibold transition-all tap-scale text-left',
                        selected ? 'glass-button-primary' : 'liquid-glass text-foreground'
                      )}>
                      <span className="text-xl">{getCategoryEmoji(category)}</span>
                      <span>{getCategoryLabel(category)}</span>
                    </button>
                  );
                })}
              </div>
              <Button className="w-full h-12 text-sm font-semibold rounded-xl glass-button-primary" onClick={handleComplete} disabled={interests.length < 2}>
                Let's Go! 🚀
              </Button>
              {interests.length > 0 && interests.length < 2 && (
                <p className="text-center text-xs text-muted-foreground">Pick {2 - interests.length} more to continue</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
