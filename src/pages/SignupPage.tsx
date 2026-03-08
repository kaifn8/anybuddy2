import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/types/anybuddy';
import { getCategoryLabel, getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp' | 'name' | 'age' | 'interests';
const steps: Step[] = ['phone', 'otp', 'name', 'age', 'interests'];
const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];

const stepConfig: Record<Step, { emoji: string; title: string; subtitle: string }> = {
  phone: { emoji: '📱', title: "What's your number?", subtitle: "We'll text you a magic code" },
  otp: { emoji: '🔐', title: 'Enter the code', subtitle: '' },
  name: { emoji: '😊', title: "What should we call you?", subtitle: 'Just your first name is cool' },
  age: { emoji: '🎂', title: 'How old are you?', subtitle: 'Helps us find the right crew' },
  interests: { emoji: '🎯', title: "What's your vibe?", subtitle: 'Pick at least 2' },
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
      gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    }
  }, [step]);
  
  const goToStep = (nextStep: Step) => {
    gsap.to(contentRef.current, { opacity: 0, y: -12, duration: 0.15, onComplete: () => setStep(nextStep) });
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
  
  const handleComplete = () => {
    if (interests.length >= 2) {
      gsap.to(contentRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
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
  
  const toggleInterest = (cat: Category) => {
    setInterests(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  
  const stepIndex = steps.indexOf(step);
  const config = stepConfig[step];
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-ambient">
      <div className="flex-1 px-6 pt-8">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10">
          {steps.map((_, i) => (
            <div key={i} className={cn(
              'h-0.5 rounded-full flex-1 transition-all duration-300',
              i <= stepIndex ? 'bg-primary' : 'bg-muted-foreground/12'
            )} />
          ))}
        </div>
        
        <div ref={contentRef}>
          {/* Header */}
          <div className="mb-8">
            <span className="text-3xl block mb-3">{config.emoji}</span>
            <h1 className="text-heading font-bold text-foreground">{config.title}</h1>
            {config.subtitle && <p className="text-sm text-muted-foreground mt-1.5">{config.subtitle}</p>}
          </div>
          
          {/* Phone */}
          {step === 'phone' && (
            <div className="space-y-5">
              <div className="flex gap-2.5">
                <div className="w-16 h-12 flex items-center justify-center liquid-glass text-sm font-semibold rounded-xl">
                  🇮🇳 +91
                </div>
                <input type="tel" placeholder="Phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <button className="w-full h-12 tahoe-btn-primary tap-scale" onClick={handlePhoneSubmit} disabled={phone.length < 10}>
                Send Code
              </button>
            </div>
          )}
          
          {/* OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground -mt-4">Sent to +91 {phone}</p>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-xl font-bold rounded-xl liquid-glass focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <button className="w-full text-primary text-sm font-semibold py-2 tap-scale">Resend code</button>
            </div>
          )}
          
          {/* Name */}
          {step === 'name' && (
            <div className="space-y-5">
              <input placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus
                className="w-full h-12 px-4 rounded-xl liquid-glass text-body font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="w-full h-12 tahoe-btn-primary tap-scale" onClick={() => firstName.trim() && goToStep('age')} disabled={!firstName.trim()}>
                Continue
              </button>
            </div>
          )}
          
          {/* Age */}
          {step === 'age' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                {ageRanges.map((range) => (
                  <button key={range} onClick={() => setAgeRange(range)}
                    className={cn('py-3.5 px-4 rounded-xl text-sm font-semibold transition-all tap-scale',
                      ageRange === range ? 'tahoe-btn-primary' : 'liquid-glass text-foreground'
                    )}>
                    {range}
                  </button>
                ))}
              </div>
              <button className="w-full h-12 tahoe-btn-primary tap-scale" onClick={() => ageRange && goToStep('interests')} disabled={!ageRange}>
                Continue
              </button>
            </div>
          )}
          
          {/* Interests */}
          {step === 'interests' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const selected = interests.includes(cat);
                  return (
                    <button key={cat} onClick={() => toggleInterest(cat)}
                      className={cn('flex items-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all tap-scale text-left',
                        selected ? 'tahoe-btn-primary' : 'liquid-glass text-foreground'
                      )}>
                      <span className="text-lg">{getCategoryEmoji(cat)}</span>
                      <span>{getCategoryLabel(cat)}</span>
                    </button>
                  );
                })}
              </div>
              <button className="w-full h-12 tahoe-btn-primary tap-scale" onClick={handleComplete} disabled={interests.length < 2}>
                Let's Go
              </button>
              {interests.length > 0 && interests.length < 2 && (
                <p className="text-center text-2xs text-muted-foreground">Pick {2 - interests.length} more</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
