import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Request } from '@/types/anybuddy';

export default function ChatsPage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, chatMessages } = useAppStore();

  const chats: { request: Request; lastMessage?: { senderName: string; message: string; timestamp: Date }; unread: number }[] = joinedRequests
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is Request => !!r)
    .map((request) => {
      const msgs = chatMessages[request.id] || [];
      const last = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const unread = Math.floor(Math.random() * 4);
      return { request, lastMessage: last, unread };
    })
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });

  const activeChats = chats.filter(c => c.request.status === 'active');
  const pastChats = chats.filter(c => c.request.status !== 'active');

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      <TopBar title="Chats" />

      <div className="px-5 pt-5">
        {chats.length === 0 ? (
          <div className="text-center pt-24 px-6">
            <div className="w-20 h-20 rounded-[1.5rem] liquid-glass flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">No chats yet</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Join a plan to start chatting with people nearby
            </p>
            <Button onClick={() => navigate('/home')} className="w-full gap-2">
              Browse plans →
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeChats.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <h3 className="section-label">Active plans</h3>
                </div>
                <div className="space-y-2">
                  {activeChats.map(({ request, lastMessage, unread }) => (
                    <button key={request.id} onClick={() => navigate(`/request/${request.id}`)}
                      className="w-full liquid-glass-interactive flex items-center gap-3.5 p-4 text-left">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-[0.875rem] liquid-glass flex items-center justify-center" style={{ borderRadius: '0.875rem' }}>
                          <span className="text-xl">{getCategoryEmoji(request.category)}</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-[1.5px] border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-[14px] font-bold text-foreground truncate tracking-tight">{request.title}</p>
                          {lastMessage && (
                            <span className="text-[10px] text-muted-foreground/50 shrink-0 font-medium">
                              {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] text-muted-foreground truncate">
                            {lastMessage
                              ? `${lastMessage.senderName}: ${lastMessage.message}`
                              : <span className="flex items-center gap-1">📍 {request.location.name}</span>}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex -space-x-1">
                              {[request.userName, ...request.participants.map(p => p.name)].slice(0, 2).map((name, i) => (
                                <GradientAvatar key={i} name={name} size={14} showInitials={false} className="border border-background" />
                              ))}
                            </div>
                            {unread > 0 && (
                              <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary-foreground">{unread}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pastChats.length > 0 && (
              <div>
                <h3 className="section-label mb-3">Past plans</h3>
                <div className="space-y-2">
                  {pastChats.map(({ request, lastMessage }) => (
                    <button key={request.id} onClick={() => navigate(`/request/${request.id}`)}
                      className="w-full liquid-glass flex items-center gap-3.5 p-3.5 text-left opacity-60 tap-scale">
                      <div className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0" style={{ borderRadius: '0.75rem' }}>
                        <span className="text-lg">{getCategoryEmoji(request.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">{request.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {lastMessage ? lastMessage.message : request.location.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
