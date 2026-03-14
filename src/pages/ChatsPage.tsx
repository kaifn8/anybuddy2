import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { GradientAvatar } from '@/components/ui/GradientAvatar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageCircle } from 'lucide-react';
import type { Request } from '@/types/anybuddy';

export default function ChatsPage() {
  const navigate = useNavigate();
  const { requests, joinedRequests, chatMessages } = useAppStore();
  const notifications = useAppStore((s) => s.notifications);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const chats: {
    request: Request;
    lastMessage?: { senderName: string; message: string; timestamp: Date };
    unread: number;
  }[] = joinedRequests
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is Request => !!r)
    .map((request) => {
      const msgs = chatMessages[request.id] || [];
      const last = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const unread = msgs.filter(m => m.senderId !== 'me').length > 0 ? Math.floor(Math.random() * 3) : 0;
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

      {/* Notifications banner */}
      {unreadNotifs > 0 && (
        <button onClick={() => navigate('/notifications')}
          className="mx-4 mt-3.5 flex items-center gap-3 px-4 py-2.5 rounded-[1rem] tap-scale w-[calc(100%-2rem)]"
          style={{
            background: 'hsl(var(--primary) / 0.06)',
            border: '0.5px solid hsl(var(--primary) / 0.18)',
          }}>
          <Bell size={14} className="text-primary shrink-0" />
          <p className="text-[12px] font-semibold text-foreground flex-1 text-left">
            {unreadNotifs} unread notification{unreadNotifs > 1 ? 's' : ''}
          </p>
          <span className="text-[11px] text-primary font-bold shrink-0">View →</span>
        </button>
      )}

      <div className="px-4 pt-4">
        {chats.length === 0 ? (
          /* Empty state */
          <div className="text-center pt-20 px-6">
            <div className="w-20 h-20 rounded-[1.5rem] liquid-glass flex items-center justify-center mx-auto mb-5">
              <MessageCircle size={36} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground mb-2 tracking-tight">No chats yet</h3>
            <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed max-w-[240px] mx-auto">
              Join a plan to start chatting with people nearby
            </p>
            <Button onClick={() => navigate('/home')} className="w-full gap-2 max-w-[220px]">
              Browse plans →
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active chats */}
            {activeChats.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <h3 className="section-label">Active plans</h3>
                  <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {activeChats.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {activeChats.map(({ request, lastMessage, unread }) => (
                    <button key={request.id} onClick={() => navigate(`/request/${request.id}`)}
                      className="w-full liquid-glass-interactive flex items-center gap-3.5 p-4 text-left">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-[0.875rem] liquid-glass flex items-center justify-center">
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
                                <span className="text-[9px] font-bold text-primary-foreground">{unread}</span>
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

            {/* Past chats */}
            {pastChats.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="section-label">Past plans</h3>
                  <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {pastChats.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {pastChats.map(({ request, lastMessage }) => (
                    <button key={request.id} onClick={() => navigate(`/request/${request.id}`)}
                      className="w-full liquid-glass flex items-center gap-3.5 p-3.5 text-left opacity-55 tap-scale">
                      <div className="w-10 h-10 rounded-[0.75rem] liquid-glass flex items-center justify-center shrink-0">
                        <span className="text-lg">{getCategoryEmoji(request.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate tracking-tight">{request.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {lastMessage ? lastMessage.message : request.location.name}
                        </p>
                      </div>
                      <span className="text-muted-foreground/30 shrink-0">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Find more plans CTA */}
            <button onClick={() => navigate('/home')}
              className="w-full liquid-glass-interactive flex items-center gap-3 px-4 py-3 text-left">
              <span className="text-lg">🔍</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground tracking-tight">Find more plans</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Browse what's happening nearby</p>
              </div>
              <span className="text-muted-foreground/30 shrink-0">›</span>
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
