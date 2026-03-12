import { useState, useRef } from 'react';
import { Camera, ShieldCheck, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from '@/types/anybuddy';

const STATUS_CONFIG: Record<VerificationStatus, {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  unverified: {
    icon: <Camera size={16} />,
    title: 'Get verified',
    description: 'Upload a selfie to verify your identity. Builds trust.',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
  },
  pending: {
    icon: <Clock size={16} />,
    title: 'Verification pending',
    description: 'Your selfie is under review. We\'ll notify you.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  verified: {
    icon: <CheckCircle2 size={16} />,
    title: 'Verified',
    description: 'Identity confirmed via selfie verification.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  failed: {
    icon: <AlertCircle size={16} />,
    title: 'Verification failed',
    description: 'Please try again with a clear photo.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

export function VerificationCard() {
  const { user, submitVerificationSelfie } = useAppStore();
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const status = user.verificationStatus || 'unverified';
  const config = STATUS_CONFIG[status];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!preview) return;
    submitVerificationSelfie(preview);
    setPreview(null);
  };

  const showUpload = status === 'unverified' || status === 'failed';

  return (
    <div className="rounded-[20px] p-4 transition-all" style={{
      background: 'hsl(var(--glass-bg))',
      backdropFilter: 'blur(var(--glass-blur))',
      boxShadow: '0 2px 12px hsl(var(--glass-shadow)), 0 0 0 1px hsl(var(--glass-border))',
    }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', config.bgColor, config.color)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-[13px] font-semibold', status === 'verified' ? 'text-primary' : 'text-foreground')}>
            {config.title}
          </p>
          <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">
            {config.description}
          </p>
        </div>
      </div>

      {/* Selfie preview (pending state) */}
      {status === 'pending' && user.verificationSelfie && (
        <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-muted/30">
          <img src={user.verificationSelfie} alt="Verification selfie" className="w-10 h-10 rounded-lg object-cover" />
          <p className="text-[11px] text-muted-foreground">Selfie submitted for review</p>
        </div>
      )}

      {/* Upload area */}
      {showUpload && !preview && (
        <>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full h-9 text-[12px]"
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={14} className="mr-1.5" />
            {status === 'failed' ? 'Try again' : 'Take a selfie'}
          </Button>
        </>
      )}

      {/* Preview + confirm */}
      {showUpload && preview && (
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30">
            <img src={preview} alt="Selfie preview" className="w-12 h-12 rounded-lg object-cover" />
            <p className="text-[11px] text-muted-foreground flex-1">Looking good! Used only for verification.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 h-9 text-[12px]" onClick={() => setPreview(null)}>
              Retake
            </Button>
            <Button size="sm" className="flex-1 h-9 text-[12px]" onClick={handleSubmit}>
              <ShieldCheck size={14} className="mr-1" />
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
