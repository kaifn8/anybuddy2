import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { BottomNav } from '@/components/layout/BottomNav';
import type { Request } from '@/types/anybuddy';

export default function ChatsPage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, chatMessages } = useAppStore();

  const chats: { request: Request; lastMessage?: { senderName: string; message: string; timestamp: Date } }[] = joinedRequests
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is Request => !!r)
    .map((request) => {
      const msgs = chatMessages[request.id] || [];
      const last = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      return { request, lastMessage: last };
    })
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Chats" />

      <div className="px-5 pt-4">
        {chats.length === 0 ? (
          <div className="text-center pt-16">
            <span className="text-4xl block mb-3">💬</span>
            <p className="text-sm font-medium text-foreground mb-1">No active chats</p>
            <p className="text-xs text-muted-foreground">Join a plan to start chatting with others</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(({ request, lastMessage }) => (
              <button
                key={request.id}
                onClick={() => navigate(`/request/${request.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl tap-scale text-left"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <span className="text-2xl shrink-0">{getCategoryEmoji(request.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{request.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lastMessage
                      ? `${lastMessage.senderName}: ${lastMessage.message}`
                      : `📍 ${request.location.name}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-muted-foreground">
                    👥 {request.seatsTaken}/{request.seatsTotal}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
