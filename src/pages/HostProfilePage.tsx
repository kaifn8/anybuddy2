import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';

const FAKE_REVIEWS = [
  { name: 'Priya', rating: 5, comment: 'Great host — very chill meetup!', ago: '2 days ago' },
  { name: 'Arjun', rating: 4, comment: 'Really fun, would do it again.', ago: '1 week ago' },
  { name: 'Maya', rating: 5, comment: 'Super organized and on time 👍', ago: '2 weeks ago' },
];

export default function HostProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { requests } = useAppStore();

  const hostRequests = requests.filter(r => r.userId === userId);
  const host = hostRequests[0];

  if (!host) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">🤷</span>
          <p className="text-sm text-muted-foreground mb-4">Host not found</p>
          <button onClick={() => navigate(-1)} className="tahoe-btn-primary h-10 px-6 tap-scale">Go Back</button>
        </div>
      </div>
    );
  }

  const completedMeetups = hostRequests.filter(r => r.status === 'completed').length;
  const activeMeetups = hostRequests.filter(r => r.status === 'active').length;
  const totalMeetups = completedMeetups + activeMeetups;
  const successRate = totalMeetups > 0 ? Math.round((completedMeetups / Math.max(totalMeetups, 1)) * 100) : 92; // fake fallback

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-8">
      <TopBar showBack title="Host Profile" />

      <div className="px-5 pt-5 space-y-4">
        {/* Profile card */}
        <div className="liquid-glass-heavy p-5 text-center">
          <img src={host.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.userName}`}
            alt={host.userName} className="w-20 h-20 rounded-full mx-auto border-3 border-white/40" />
          <h2 className="text-title font-bold mt-3">{host.userName}</h2>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <TrustBadge level={host.userTrust} size="md" />
            <span className="text-2xs text-success font-semibold">🟢 Online</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">🛡️ Public meetup · ✅ Verified host</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: `${host.userReliability || 0}%`, label: 'Reliable' },
            { value: host.userHostRating ? `${host.userHostRating}★` : '—', label: 'Rating' },
            { value: totalMeetups || 12, label: 'Meetups' },
            { value: `${successRate}%`, label: 'Success' },
          ].map((stat, i) => (
            <div key={i} className="liquid-glass p-2.5 text-center">
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="liquid-glass p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">REVIEWS</h3>
          <div className="space-y-3">
            {FAKE_REVIEWS.map((review, i) => (
              <div key={i} className="liquid-glass-subtle p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.name}`}
                      alt={review.name} className="w-5 h-5 rounded-full" />
                    <span className="text-xs font-semibold">{review.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{review.ago}</span>
                </div>
                <div className="text-xs text-warning mb-1">
                  {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className="text-xs text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Past/Active meetups */}
        {hostRequests.length > 0 && (
          <div className="liquid-glass p-4 specular-highlight" style={{ borderRadius: '1rem' }}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2.5">MEETUPS</h3>
            <div className="space-y-2">
              {hostRequests.slice(0, 5).map((req) => (
                <button key={req.id} onClick={() => navigate(`/request/${req.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg liquid-glass-subtle text-left tap-scale">
                  <span className="text-lg">{getCategoryEmoji(req.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{req.title}</p>
                    <p className="text-2xs text-muted-foreground">{req.seatsTaken}/{req.seatsTotal} joined · {req.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
