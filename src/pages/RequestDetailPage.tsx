import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Send, Share2, BadgeCheck, Flag, MoreVertical, UserX, Ban, XCircle, MapPin, Clock, Users, Navigation, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryEmoji } from '@/components/icons/CategoryIcon';
import { UrgencyBadge } from '@/components/ui/UrgencyBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ShareSheet } from '@/components/ShareSheet';
import { ReportDialog } from '@/components/ReportDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const QUICK_ACTIONS = [
  { label: '🏃 On my way', message: "I'm on my way! 🏃" },
  { label: '📍 I\'m here', message: "I'm here! 📍" },
  { label: '⏰ Running late', message: "Running a bit late, be there soon! ⏰" },
];

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    requests, joinedRequests, chatMessages, sendMessage, leaveRequest, user,
    removeParticipant, blockUser, approveJoinRequest, declineJoinRequest, endPlanEarly,
  } = useAppStore();

  const [message, setMessage] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: 'user' | 'plan' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const request = requests.find(r => r.id === id);
  const isJoined = joinedRequests.includes(id || '');
  const isHost = request?.userId === user?.id;
  const msgs = chatMessages[id || ''] || [];
  const pendingRequests = (request?.pendingJoinRequests || []).filter(j => j.status === 'pending');

  useEffect(() => {
    if (showChat) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, showChat]);

  if (!request) {
    return (
      <div className="mobile-container min-h-screen bg-ambient flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Request not found</p>
      </div>
    );
  }

  const handleSend = () => { if (!message.trim() || !id) return; sendMessage(id, message.trim()); setMessage(''); };
  const handleLeave = () => { if (!id) return; leaveRequest(id); navigate('/home'); };

  const minutesToStart = (new Date(request.when).getTime() - Date.now()) / 60000;
  const canRemove = minutesToStart > 5 || minutesToStart < 0;

  const handleRemoveParticipant = (participantId: string, name: string) => {
    if (!canRemove) { toast.error("Can't remove within 5 min of start"); return; }
    removeParticipant(request.id, participantId);
    toast(`${name} removed`);
  };

  const handleBlock = (userId: string, name: string) => {
    blockUser(userId);
    toast(`${name} blocked`);
  };

  const handleEndEarly = () => { endPlanEarly(request.id); toast('Plan ended'); navigate('/home'); };
  const handleApprove = (userId: string) => { approveJoinRequest(request.id, userId); toast('✅ Approved'); };
  const handleDecline = (userId: string) => { declineJoinRequest(request.id, userId); toast('Declined'); };

  const handleQuickAction = (msg: string) => {
    if (!id) return;
    sendMessage(id, msg);
    toast('Status sent to the group ✓');
  };

  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  const minsToStart = Math.max(0, Math.round((new Date(request.when).getTime() - Date.now()) / 60000));

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${request.location.coords.lat},${request.location.coords.lng}`;

  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      <TopBar showBack title={request.title} />

      <div className="flex-1 overflow-y-auto">
        {/* ── Event Details (primary) ── */}
        <div className="px-5 pt-3 space-y-3">

          {/* Hero card */}
          <div className="liquid-glass-heavy p-4 rounded-3xl">
            {/* Time chip */}
            {minsToStart <= 30 && (
              <div className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3',
                minsToStart <= 5 ? 'text-warning bg-warning/10 border border-warning/20' : 'text-primary bg-primary/10 border border-primary/20'
              )}>
                {minsToStart <= 5 ? '⚡ Happening now' : `⏰ Starts in ${minsToStart} min`}
              </div>
            )}

            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{getCategoryEmoji(request.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-base leading-tight">{request.title}</h2>
                  <UrgencyBadge urgency={request.urgency} />
                </div>
                {request.joinMode === 'approval' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">✋ Approval</span>
                )}
              </div>
            </div>

            {/* Key info grid */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{request.location.name}</p>
                  <p className="text-2xs text-muted-foreground">{request.location.distance} km away</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {minsToStart <= 0 ? 'Happening now' : minsToStart < 60 ? `In ${minsToStart} minutes` : `${timeLeft} left`}
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    {new Date(request.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Users size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{request.seatsTaken} of {request.seatsTotal} going</p>
                  <p className="text-2xs text-muted-foreground">
                    {seatsLeft === 0 ? 'Full' : `${seatsLeft} spot${seatsLeft > 1 ? 's' : ''} left`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map preview + directions (joined only) */}
          {(isJoined || isHost) && (
            <div className="liquid-glass rounded-2xl overflow-hidden">
              <div className="h-32 bg-muted/50 relative">
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+ff4444(${request.location.coords.lng},${request.location.coords.lat})/${request.location.coords.lng},${request.location.coords.lat},14,0/400x200@2x?access_token=pk.placeholder`}
                  alt="Map"
                  className="w-full h-full object-cover opacity-60"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={28} className="text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold">{request.location.name}</p>
                  </div>
                </div>
              </div>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary tap-scale">
                <Navigation size={16} />
                Open in Maps
              </a>
            </div>
          )}

          {/* Host info */}
          <div className="liquid-glass p-3.5 rounded-2xl">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Host</p>
            <div className="flex items-center gap-3">
              <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                alt={request.userName} className="w-9 h-9 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold flex items-center gap-1">
                  {request.userName}
                  {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
                    <BadgeCheck size={14} className="text-primary" strokeWidth={2.5} />
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <TrustBadge level={request.userTrust} size="sm" />
                  {request.userReliability && (
                    <span className="text-[10px] text-muted-foreground">⭐ {request.userReliability}% reliable</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="liquid-glass p-3.5 rounded-2xl">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
              People going ({request.participants.length + 1})
            </p>
            <div className="space-y-2">
              {/* Host row */}
              <div className="flex items-center gap-2.5">
                <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                  alt={request.userName} className="w-7 h-7 rounded-full" />
                <span className="text-xs font-medium flex-1">{request.userName}</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Host</span>
              </div>

              {request.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                    alt={p.name} className="w-7 h-7 rounded-full" />
                  <span className="text-xs font-medium flex-1">{p.name}</span>
                  {p.note && <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">"{p.note}"</span>}

                  {/* Host actions */}
                  {isHost && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md hover:bg-muted/50 tap-scale">
                          <MoreVertical size={14} className="text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => handleRemoveParticipant(p.id, p.name)}
                          className={cn("text-xs", !canRemove && "opacity-50")}>
                          <UserX size={14} className="mr-2" /> Remove {!canRemove && '(locked)'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setReportTarget({ id: p.id, name: p.name, type: 'user' }); setShowReport(true); }} className="text-xs">
                          <Flag size={14} className="mr-2" /> Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBlock(p.id, p.name)} className="text-xs text-destructive">
                          <Ban size={14} className="mr-2" /> Block
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {!isHost && p.id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md hover:bg-muted/50 tap-scale">
                          <MoreVertical size={14} className="text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => { setReportTarget({ id: p.id, name: p.name, type: 'user' }); setShowReport(true); }} className="text-xs">
                          <Flag size={14} className="mr-2" /> Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBlock(p.id, p.name)} className="text-xs text-destructive">
                          <Ban size={14} className="mr-2" /> Block
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending join requests (host) */}
          {isHost && pendingRequests.length > 0 && (
            <div className="liquid-glass-heavy p-3.5 rounded-2xl space-y-2">
              <p className="text-[10px] font-semibold text-warning uppercase">✋ Join Requests ({pendingRequests.length})</p>
              {pendingRequests.map((jr) => (
                <div key={jr.userId} className="flex items-center gap-2 py-1.5">
                  <img src={jr.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${jr.userName}`}
                    alt={jr.userName} className="w-7 h-7 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{jr.userName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {jr.reliability && <span>⭐ {jr.reliability}%</span>}
                      {jr.note && <span>"{jr.note}"</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => handleApprove(jr.userId)}>Accept</Button>
                    <Button size="sm" variant="secondary" className="h-7 px-2.5 text-[11px]" onClick={() => handleDecline(jr.userId)}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions (joined/host) */}
          {(isJoined || isHost) && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-1">Quick update</p>
              <div className="flex gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.label} onClick={() => handleQuickAction(action.message)}
                    className="flex-1 py-2.5 rounded-xl liquid-glass text-xs font-semibold tap-scale hover:bg-muted/80 transition-colors text-center">
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-3 py-2">
            <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 text-[12px] text-primary font-semibold tap-scale">
              <Share2 size={14} /> Share
            </button>
            {isHost && (
              <button onClick={handleEndEarly} className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                <XCircle size={12} /> End plan
              </button>
            )}
            {!isHost && isJoined && (
              <button onClick={handleLeave} className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                Leave plan
              </button>
            )}
            {!isHost && !isJoined && (
              <button onClick={() => { setReportTarget({ id: request.id, name: request.title, type: 'plan' }); setShowReport(true); }}
                className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                <Flag size={12} /> Report
              </button>
            )}
          </div>

          {/* Join CTA (not joined) */}
          {!isJoined && !isHost && (
            <div className="pb-4">
              <Button className="w-full h-12 tap-scale" onClick={() => navigate(`/join/${request.id}`)} disabled={seatsLeft === 0}>
                {seatsLeft === 0 ? 'Plan is full' : request.joinMode === 'approval' ? 'Request to Join' : 'Join Plan'}
              </Button>
            </div>
          )}

          {/* ── Chat section (optional, collapsed) ── */}
          {(isJoined || isHost) && (
            <div className="pb-4">
              <button onClick={() => setShowChat(!showChat)}
                className="w-full flex items-center justify-between py-3 px-1 tap-scale">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">Group Chat</span>
                  {msgs.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                      {msgs.length}
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', showChat && 'rotate-180')} />
              </button>

              {showChat && (
                <div className="liquid-glass rounded-2xl overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto px-3.5 py-3 space-y-2">
                    {msgs.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-6">No messages yet — use quick actions above or type below</p>
                    )}
                    {msgs.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={cn(
                          'max-w-[75%] rounded-2xl px-3.5 py-2',
                          msg.senderId === 'system'
                            ? 'liquid-glass-subtle text-muted-foreground text-center w-full text-xs'
                            : msg.senderId === user?.id
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'liquid-glass rounded-bl-md'
                        )}>
                          {msg.senderId !== user?.id && msg.senderId !== 'system' && (
                            <p className="text-2xs font-semibold text-primary mb-0.5">{msg.senderName}</p>
                          )}
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-2.5 border-t border-border/15">
                    <div className="flex gap-2">
                      <input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 rounded-full liquid-glass h-9 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <Button className="rounded-full w-9 h-9 p-0 shrink-0" size="sm" onClick={handleSend} disabled={!message.trim()}>
                        <Send size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} request={request} />
      <ReportDialog open={showReport} onClose={() => { setShowReport(false); setReportTarget(null); }}
        target={reportTarget || { id: request.id, name: request.title, type: 'plan' }} />
    </div>
  );
}