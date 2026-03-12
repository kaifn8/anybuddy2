import { useState, useRef } from 'react';
import { Camera, ShieldCheck, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import type { VerificationStatus } from '@/types/anybuddy';

const STATUS_CONFIG: Record<VerificationStatus, {
  icon: React.ReactNode;
  title: string;
  description: string;
}> = {
  unverified: {
    icon: <Camera size={16} />,
    title: 'Get verified',
    description: 'Upload a selfie to verify your identity. Builds trust.',
  },
  pending: {
    icon: <Clock size={16} />,
    title: 'Verification pending',
    description: 'Your selfie is under review. We\'ll notify you.',
  },
  verified: {
    icon: <CheckCircle2 size={16} />,
    title: 'Verified',
    description: 'Identity confirmed via selfie verification.',
  },
  failed: {
    icon: <AlertCircle size={16} />,
    title: 'Verification failed',
    description: 'Please try again with a clear photo.',
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

  // Icon accent colors per status
  const iconColor = status === 'verified' ? 'hsl(250 85% 72%)'
    : status === 'pending' ? 'hsl(40 96% 64%)'
    : status === 'failed' ? 'hsl(0 72% 62%)'
    : 'rgba(255,255,255,0.5)';

  return (
    <div className="relative overflow-hidden" style={{
      borderRadius: '22px',
      background: 'linear-gradient(160deg, hsl(230 25% 8%), hsl(248 28% 12%))',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      <div className="relative z-10 px-5 py-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{
            background: 'rgba(255,255,255,0.06)',
            color: iconColor,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {config.title}
            </p>
            <p className="text-[10.5px] leading-snug mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {config.description}
            </p>
          </div>
        </div>

        {/* Selfie preview (pending state) */}
        {status === 'pending' && user.verificationSelfie && (
          <div className="mt-3.5 flex items-center gap-3 p-3 rounded-xl" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <img src={user.verificationSelfie} alt="Verification selfie" className="w-10 h-10 rounded-lg object-cover" />
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Selfie submitted for review</p>
          </div>
        )}

        {/* Upload area */}
        {showUpload && !preview && (
          <>
            <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
            <button
              className="mt-3.5 w-full h-10 text-[12px] font-semibold rounded-xl transition-all tap-scale"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={14} className="inline mr-1.5" style={{ verticalAlign: '-2px' }} />
              {status === 'failed' ? 'Try again' : 'Take a selfie'}
            </button>
          </>
        )}

        {/* Preview + confirm */}
        {showUpload && preview && (
          <div className="mt-3.5 space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <img src={preview} alt="Selfie preview" className="w-12 h-12 rounded-lg object-cover" />
              <p className="text-[11px] flex-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Looking good! Used only for verification.</p>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 h-9 text-[12px] font-medium rounded-xl"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onClick={() => setPreview(null)}>
                Retake
              </button>
              <button
                className="flex-1 h-9 text-[12px] font-semibold rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(250 85% 60%), hsl(210 90% 58%))',
                  color: 'white',
                  boxShadow: '0 4px 14px hsl(250 85% 60% / 0.25)',
                }}
                onClick={handleSubmit}>
                <ShieldCheck size={13} className="inline mr-1" style={{ verticalAlign: '-2px' }} />
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
