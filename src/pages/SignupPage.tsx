import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, MapPin, Heart, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/types/anybuddy';
import { getCategoryLabel, CategoryIcon } from '@/components/icons/CategoryIcon';

type Step = 'phone' | 'otp' | 'name' | 'age' | 'interests';

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const categories: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [interests, setInterests] = useState<Category[]>([]);
  
  const handlePhoneSubmit = () => {
    if (phone.length >= 10) {
      setStep('otp');
    }
  };
  
  const handleOtpSubmit = () => {
    if (otp.length === 4) {
      setStep('name');
    }
  };
  
  const handleNameSubmit = () => {
    if (firstName.trim()) {
      setStep('age');
    }
  };
  
  const handleAgeSubmit = () => {
    if (ageRange) {
      setStep('interests');
    }
  };
  
  const handleComplete = () => {
    if (interests.length >= 2) {
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
    }
  };
  
  const toggleInterest = (category: Category) => {
    setInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  
  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-6 py-12">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {['phone', 'otp', 'name', 'age', 'interests'].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ['phone', 'otp', 'name', 'age', 'interests'].indexOf(step) >= i
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        {step === 'phone' && (
          <div className="slide-up">
            <div className="gradient-primary rounded-2xl p-4 w-fit mb-6">
              <Phone size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">What's your number?</h1>
            <p className="text-muted-foreground mb-8">We'll send you a quick verification code</p>
            
            <div className="flex gap-2 mb-6">
              <div className="bg-muted rounded-xl px-4 py-3 text-foreground font-medium">+91</div>
              <Input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 text-lg py-6 rounded-xl"
              />
            </div>
            
            <Button
              className="w-full gradient-primary py-6 tap-scale"
              onClick={handlePhoneSubmit}
              disabled={phone.length < 10}
            >
              Send Code <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        )}
        
        {step === 'otp' && (
          <div className="slide-up">
            <div className="gradient-secondary rounded-2xl p-4 w-fit mb-6">
              <Check size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Enter the code</h1>
            <p className="text-muted-foreground mb-8">Sent to +91 {phone}</p>
            
            <div className="flex gap-3 justify-center mb-6">
              {[0, 1, 2, 3].map((i) => (
                <Input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val) {
                      const newOtp = otp.slice(0, i) + val + otp.slice(i + 1);
                      setOtp(newOtp);
                      const nextInput = e.target.nextElementSibling as HTMLInputElement;
                      if (nextInput && val) nextInput.focus();
                    }
                  }}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-xl"
                />
              ))}
            </div>
            
            <Button
              className="w-full gradient-primary py-6 tap-scale"
              onClick={handleOtpSubmit}
              disabled={otp.length < 4}
            >
              Verify <ArrowRight className="ml-2" size={20} />
            </Button>
            
            <button className="w-full text-primary mt-4 py-2 font-medium">
              Resend code
            </button>
          </div>
        )}
        
        {step === 'name' && (
          <div className="slide-up">
            <div className="gradient-accent rounded-2xl p-4 w-fit mb-6">
              <User size={32} className="text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">What's your name?</h1>
            <p className="text-muted-foreground mb-8">Just your first name is fine</p>
            
            <Input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="text-lg py-6 rounded-xl mb-6"
            />
            
            <Button
              className="w-full gradient-primary py-6 tap-scale"
              onClick={handleNameSubmit}
              disabled={!firstName.trim()}
            >
              Continue <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        )}
        
        {step === 'age' && (
          <div className="slide-up">
            <div className="gradient-primary rounded-2xl p-4 w-fit mb-6">
              <MapPin size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Your age range?</h1>
            <p className="text-muted-foreground mb-8">This helps us match you better</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ageRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`py-4 rounded-xl font-medium transition-all tap-scale ${
                    ageRange === range
                      ? 'gradient-primary text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <Button
              className="w-full gradient-primary py-6 tap-scale"
              onClick={handleAgeSubmit}
              disabled={!ageRange}
            >
              Continue <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        )}
        
        {step === 'interests' && (
          <div className="slide-up">
            <div className="gradient-hero rounded-2xl p-4 w-fit mb-6">
              <Heart size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">What interests you?</h1>
            <p className="text-muted-foreground mb-8">Pick at least 2 categories</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleInterest(category)}
                  className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all tap-scale ${
                    interests.includes(category)
                      ? 'bg-primary/10 border-2 border-primary text-primary'
                      : 'bg-card border-2 border-transparent text-foreground card-shadow'
                  }`}
                >
                  <CategoryIcon category={category} />
                  <span className="text-sm">{getCategoryLabel(category)}</span>
                </button>
              ))}
            </div>
            
            <Button
              className="w-full gradient-primary py-6 tap-scale"
              onClick={handleComplete}
              disabled={interests.length < 2}
            >
              Let's Go! 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
