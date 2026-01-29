import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Calendar, Heart, ArrowRight, Check, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/types/anybuddy';
import { getCategoryLabel, CategoryIcon } from '@/components/icons/CategoryIcon';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp' | 'name' | 'age' | 'interests';
const steps: Step[] = ['phone', 'otp', 'name', 'age', 'interests'];

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];

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
  
  // Animate step transitions
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [step]);
  
  const handlePhoneSubmit = () => {
    if (phone.length >= 10) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        onComplete: () => setStep('otp'),
      });
    }
  };
  
  // Auto-submit OTP when complete
  useEffect(() => {
    if (step === 'otp' && otp.every(d => d) && otp.join('').length === 4) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        onComplete: () => setStep('name'),
      });
    }
  }, [otp, step]);
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  
  const handleNameSubmit = () => {
    if (firstName.trim()) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        onComplete: () => setStep('age'),
      });
    }
  };
  
  const handleAgeSubmit = () => {
    if (ageRange) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        onComplete: () => setStep('interests'),
      });
    }
  };
  
  const handleComplete = () => {
    if (interests.length >= 2) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.25,
        onComplete: () => {
          setUser({
            id: `user_${Date.now()}`,
            firstName,
            phone,
            ageRange,
            city: 'Bangalore',
            interests,
            trustLevel: 'seed',
            credits: 3,
            completedJoins: 0,
            createdAt: new Date(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
          });
          setOnboarded(true);
          navigate('/home');
        },
      });
    }
  };
  
  const toggleInterest = (category: Category) => {
    setInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  
  const stepIndex = steps.indexOf(step);
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-6 py-8">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                index <= stepIndex ? 'w-8 bg-primary' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>
        
        <div ref={contentRef}>
          {step === 'phone' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone size={22} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">What's your number?</h1>
                  <p className="text-muted-foreground text-sm mt-1">We'll send you a verification code</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-14 h-12 flex items-center justify-center bg-muted rounded-xl text-foreground font-medium text-sm">
                  +91
                </div>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background text-base"
                />
              </div>
              
              <Button
                className="w-full h-12 text-sm font-semibold rounded-xl gradient-primary shadow-soft text-white"
                onClick={handlePhoneSubmit}
                disabled={phone.length < 10}
              >
                Send Code
                <ArrowRight size={16} className="ml-2" strokeWidth={2.5} />
              </Button>
            </div>
          )}
          
          {step === 'otp' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Check size={22} className="text-success" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Enter the code</h1>
                  <p className="text-muted-foreground text-sm mt-1">Sent to +91 {phone}</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-xl font-semibold rounded-xl neo-card focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                  />
                ))}
              </div>
              
              <button className="w-full text-primary text-sm font-medium py-2 tap-scale">
                Resend code
              </button>
            </div>
          )}
          
          {step === 'name' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <User size={22} className="text-secondary" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">What's your name?</h1>
                  <p className="text-muted-foreground text-sm mt-1">Just your first name is fine</p>
                </div>
              </div>
              
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
                className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background text-base"
              />
              
              <Button
                className="w-full h-12 text-sm font-semibold rounded-xl gradient-primary shadow-soft text-white"
                onClick={handleNameSubmit}
                disabled={!firstName.trim()}
              >
                Continue
                <ArrowRight size={16} className="ml-2" strokeWidth={2.5} />
              </Button>
            </div>
          )}
          
          {step === 'age' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Calendar size={22} className="text-accent-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Your age range?</h1>
                  <p className="text-muted-foreground text-sm mt-1">This helps us match you better</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setAgeRange(range)}
                    className={cn(
                      'py-3 px-4 rounded-xl text-sm font-medium transition-all tap-scale',
                      ageRange === range
                        ? 'bg-primary text-white shadow-soft'
                        : 'neo-card text-foreground hover:bg-muted/50'
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              <Button
                className="w-full h-12 text-sm font-semibold rounded-xl gradient-primary shadow-soft text-white"
                onClick={handleAgeSubmit}
                disabled={!ageRange}
              >
                Continue
                <ArrowRight size={16} className="ml-2" strokeWidth={2.5} />
              </Button>
            </div>
          )}
          
          {step === 'interests' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                  <Heart size={22} className="text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">What interests you?</h1>
                  <p className="text-muted-foreground text-sm mt-1">Pick at least 2 categories</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleInterest(category)}
                    className={cn(
                      'flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-medium transition-all tap-scale text-left',
                      interests.includes(category)
                        ? 'bg-primary text-white shadow-soft'
                        : 'neo-card text-foreground hover:bg-muted/50'
                    )}
                  >
                    <CategoryIcon 
                      category={category} 
                      className={interests.includes(category) ? 'opacity-90' : ''} 
                    />
                    <span>{getCategoryLabel(category)}</span>
                  </button>
                ))}
              </div>
              
              <Button
                className="w-full h-12 text-sm font-semibold rounded-xl gradient-primary shadow-soft text-white"
                onClick={handleComplete}
                disabled={interests.length < 2}
              >
                <Sparkles size={16} className="mr-2" />
                Let's Go!
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
