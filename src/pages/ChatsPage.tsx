import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { BottomNav } from '@/components/layout/BottomNav';
import { MessageCircle, ArrowRight } from 'lucide-react';
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
      const unread = Math.floor(Math.random() * 4); // simulated
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
    <div className="mobile-container min-h-screen bg-ambient pb-24">
      <TopBar showBack title="Chats" />

      <div className="px-5 pt-4">
        {chats.length === 0 ? (
          <div className="text-center pt-20 px-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-9 h-9 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No chats yet</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Join a plan to start chatting with people nearby
            </p>
            <Button onClick={() => navigate('/home')} className="w-full">
              Browse plans <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active chats */}
            {activeChats.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active plans</h3>
                </div>
                <div className="space-y-2">
                  {activeChats.map(({ request, lastMessage, unread }) => (
                    <button
                      key={request.id}
                      onClick={() => navigate(`/request/${request.id}`)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl tap-scale text-left bg-background/80 backdrop-blur-xl border border-border/30 transition-all hover:bg-background/95"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                    >
                      {/* Category icon with online indicator */}
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
                          <span className="text-2xl">{getCategoryEmoji(request.category)}</span>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-background" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-[14px] font-semibold text-foreground truncate">{request.title}</p>
                          {lastMessage && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] text-muted-foreground truncate">
                            {lastMessage
                              ? `${lastMessage.senderName}: ${lastMessage.message}`
                              : `📍 ${request.location.name}`}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground/60">
                              👥 {request.seatsTaken}/{request.seatsTotal}
                            </span>
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

            {/* Past chats */}
            {pastChats.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past plans</h3>
                <div className="space-y-2">
                  {pastChats.map(({ request, lastMessage }) => (
                    <button
                      key={request.id}
                      onClick={() => navigate(`/request/${request.id}`)}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl tap-scale text-left bg-background/50 border border-border/20 opacity-70"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                        <span className="text-xl">{getCategoryEmoji(request.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{request.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
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
