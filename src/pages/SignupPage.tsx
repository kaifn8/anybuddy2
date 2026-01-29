import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, MapPin, Heart, ArrowRight, Check, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { ModernInput } from '@/components/ui/ModernInput';
import { SelectionChip, ChipGroup } from '@/components/ui/SelectionChip';
import { ProgressDots } from '@/components/ui/ProgressIndicator';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/types/anybuddy';
import { getCategoryLabel, CategoryIcon } from '@/components/icons/CategoryIcon';

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
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [step]);
  
  const handlePhoneSubmit = () => {
    if (phone.length >= 10) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
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
        y: -20,
        duration: 0.2,
        onComplete: () => setStep('name'),
      });
    }
  }, [otp, step]);
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // Take the last character for paste
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
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
        y: -20,
        duration: 0.2,
        onComplete: () => setStep('age'),
      });
    }
  };
  
  const handleAgeSubmit = () => {
    if (ageRange) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        onComplete: () => setStep('interests'),
      });
    }
  };
  
  const handleComplete = () => {
    if (interests.length >= 2) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
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
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-secondary/3 pointer-events-none" />
      
      <div className="flex-1 px-6 py-8 relative">
        {/* Progress */}
        <ProgressDots total={5} current={stepIndex} className="mb-10" />
        
        <div ref={contentRef}>
          {step === 'phone' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Phone size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">What's your number?</h1>
                <p className="text-muted-foreground text-sm">We'll send you a quick verification code</p>
              </div>
              
              <div className="flex gap-3">
                <div className="w-16 h-14 flex items-center justify-center bg-muted/50 rounded-2xl text-foreground font-medium text-sm">
                  +91
                </div>
                <ModernInput
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1"
                />
              </div>
              
              <Button
                className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios"
                onClick={handlePhoneSubmit}
                disabled={phone.length < 10}
              >
                Send Code
                <ArrowRight size={18} className="ml-2" strokeWidth={2} />
              </Button>
            </div>
          )}
          
          {step === 'otp' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Check size={24} className="text-secondary" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Enter the code</h1>
                <p className="text-muted-foreground text-sm">Sent to +91 {phone}</p>
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
                    className="w-14 h-16 text-center text-2xl font-semibold rounded-2xl bg-card border-2 border-transparent focus:border-primary/30 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
              
              <button className="w-full text-primary text-sm font-medium py-2">
                Resend code
              </button>
            </div>
          )}
          
          {step === 'name' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <User size={24} className="text-accent-foreground" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">What's your name?</h1>
                <p className="text-muted-foreground text-sm">Just your first name is fine</p>
              </div>
              
              <ModernInput
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              
              <Button
                className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios"
                onClick={handleNameSubmit}
                disabled={!firstName.trim()}
              >
                Continue
                <ArrowRight size={18} className="ml-2" strokeWidth={2} />
              </Button>
            </div>
          )}
          
          {step === 'age' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MapPin size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Your age range?</h1>
                <p className="text-muted-foreground text-sm">This helps us match you better</p>
              </div>
              
              <ChipGroup columns={2}>
                {ageRanges.map((range) => (
                  <SelectionChip
                    key={range}
                    label={range}
                    selected={ageRange === range}
                    onClick={() => setAgeRange(range)}
                    variant="compact"
                  />
                ))}
              </ChipGroup>
              
              <Button
                className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios"
                onClick={handleAgeSubmit}
                disabled={!ageRange}
              >
                Continue
                <ArrowRight size={18} className="ml-2" strokeWidth={2} />
              </Button>
            </div>
          )}
          
          {step === 'interests' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center">
                  <Heart size={24} className="text-white" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">What interests you?</h1>
                <p className="text-muted-foreground text-sm">Pick at least 2 categories</p>
              </div>
              
              <ChipGroup columns={2}>
                {categories.map((category) => (
                  <SelectionChip
                    key={category}
                    icon={<CategoryIcon category={category} />}
                    label={getCategoryLabel(category)}
                    selected={interests.includes(category)}
                    onClick={() => toggleInterest(category)}
                  />
                ))}
              </ChipGroup>
              
              <Button
                className="w-full h-14 text-base font-medium rounded-2xl gradient-primary shadow-ios"
                onClick={handleComplete}
                disabled={interests.length < 2}
              >
                <Sparkles size={18} className="mr-2" />
                Let's Go!
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
