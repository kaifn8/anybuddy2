import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Send, Share2, BadgeCheck, Flag, MoreVertical, UserX, Ban, ShieldAlert, XCircle } from 'lucide-react';
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
  const [showParticipants, setShowParticipants] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string; type: 'user' | 'plan' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const request = requests.find(r => r.id === id);
  const isJoined = joinedRequests.includes(id || '');
  const isHost = request?.userId === user?.id;
  const msgs = chatMessages[id || ''] || [];
  const pendingRequests = (request?.pendingJoinRequests || []).filter(j => j.status === 'pending');
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  
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
    if (!canRemove) {
      toast.error("Can't remove someone within 5 minutes of start time");
      return;
    }
    removeParticipant(request.id, participantId);
    toast(`${name} removed from the plan`);
  };

  const handleBlock = (userId: string, name: string) => {
    blockUser(userId);
    toast(`${name} blocked — they won't see your plans`);
  };

  const handleEndEarly = () => {
    endPlanEarly(request.id);
    toast('Plan ended early');
    navigate('/home');
  };

  const handleApprove = (userId: string) => {
    approveJoinRequest(request.id, userId);
    toast('✅ Request approved');
  };

  const handleDecline = (userId: string) => {
    declineJoinRequest(request.id, userId);
    toast('Request declined');
  };

  const seatsLeft = request.seatsTotal - request.seatsTaken;
  const timeLeft = formatDistanceToNow(new Date(request.expiresAt), { addSuffix: false });
  
  return (
    <div className="mobile-container min-h-screen bg-ambient flex flex-col">
      <TopBar showBack title={request.title} />
      
      {/* Meetup summary card */}
      <div className="px-5 py-3 border-b border-border/15">
        <div className="liquid-glass p-4 rounded-3xl" style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}>
          {/* Time indicator */}
          {(() => {
            const mins = (new Date(request.expiresAt).getTime() - Date.now()) / 60000;
            let timeIndicator = null;
            if (mins <= 5 && mins > 0) {
              timeIndicator = { label: '⚡ Happening now', color: 'text-warning bg-warning/10 border border-warning/20' };
            } else if (mins <= 30 && mins > 0) {
              timeIndicator = { label: `⚡ Starts in ${Math.round(mins)} min`, color: 'text-warning bg-warning/10 border border-warning/20' };
            }
            return timeIndicator ? (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 ${timeIndicator.color}`}>
                {timeIndicator.label}
              </div>
            ) : null;
          })()}

          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{getCategoryEmoji(request.category)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-[15px] leading-tight">{request.title}</h2>
                {request.joinMode === 'approval' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">✋ Approval</span>
                )}
              </div>
              
              <p className="text-[13px] text-muted-foreground font-medium mb-2">
                📍 {request.location.name} • {request.location.distance} km away
              </p>

              {/* Participant avatars */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-1.5">
                  <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                    alt={request.userName} className="w-5 h-5 rounded-full border-2 border-background" />
                  {request.participants.slice(0, 2).map((p) => (
                    <img key={p.id} src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                      alt={p.name} className="w-5 h-5 rounded-full border-2 border-background" />
                  ))}
                  {request.participants.length > 2 && (
                    <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[8px] font-bold text-muted-foreground">+{request.participants.length - 2}</span>
                    </div>
                  )}
                </div>
                <span className="text-[12px] text-muted-foreground font-medium">
                  {request.seatsTaken} of {request.seatsTotal} spots filled
                </span>
              </div>

              {/* Host info */}
              <div className="flex items-center gap-1.5">
                <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                  alt={request.userName} className="w-5 h-5 rounded-full" />
                <span className="text-[12px] text-muted-foreground font-medium flex items-center gap-1">
                  {request.userName}
                  {(request.userTrust === 'trusted' || request.userTrust === 'anchor') && (
                    <BadgeCheck size={16} className="text-primary" strokeWidth={2.5} />
                  )}
                  {request.userReliability && <span className="ml-0.5">• ⭐ {request.userReliability}% reliable</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3 pt-3 border-t border-border/15">
            <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 text-[12px] text-primary font-semibold tap-scale">
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => navigate('/map')} className="flex items-center gap-1.5 text-[12px] text-primary font-semibold tap-scale">
              📍 View on map
            </button>
            {isHost && (
              <button onClick={handleEndEarly} className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                <XCircle size={12} /> End plan
              </button>
            )}
            {!isHost && (
              <button onClick={() => { setReportTarget({ id: request.id, name: request.title, type: 'plan' }); setShowReport(true); }}
                className="flex items-center gap-1.5 text-[12px] text-destructive/70 font-semibold tap-scale ml-auto">
                <Flag size={12} /> Report
              </button>
            )}
          </div>
        </div>

        {/* Pending Join Requests (host only) */}
        {isHost && pendingRequests.length > 0 && (
          <div className="mt-3 liquid-glass-heavy p-3 rounded-xl space-y-2">
            <h4 className="text-[10px] font-semibold text-warning uppercase flex items-center gap-1">
              ✋ Join Requests ({pendingRequests.length})
            </h4>
            {pendingRequests.map((jr) => (
              <div key={jr.userId} className="flex items-center gap-2 py-1.5">
                <img src={jr.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${jr.userName}`}
                  alt={jr.userName} className="w-7 h-7 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{jr.userName} wants to join</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {jr.reliability && <span>⭐ {jr.reliability}% reliable</span>}
                    {jr.note && <span>• "{jr.note}"</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => handleApprove(jr.userId)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="secondary" className="h-7 px-2.5 text-[11px]" onClick={() => handleDecline(jr.userId)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Participants list */}
        <button onClick={() => setShowParticipants(!showParticipants)} className="w-full tap-scale mt-3">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <span>👥 View all participants ({request.participants.length + 1})</span>
          </div>
        </button>

        {showParticipants && (
          <div className="mt-2 liquid-glass-subtle p-3 rounded-xl space-y-2">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">Participants</h4>
            
            {/* Host */}
            <div className="flex items-center gap-2">
              <img src={request.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userName}`}
                alt={request.userName} className="w-6 h-6 rounded-full" />
              <span className="text-xs font-medium">{request.userName}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Host</span>
              {request.userReliability && (
                <span className="text-[10px] text-muted-foreground ml-auto">⭐ {request.userReliability}%</span>
              )}
            </div>

            {/* Participants with host actions */}
            {request.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                  alt={p.name} className="w-6 h-6 rounded-full" />
                <span className="text-xs font-medium">{p.name}</span>
                {p.note && <span className="text-[10px] text-muted-foreground">"{p.note}"</span>}
                
                {/* Host menu for each participant */}
                {isHost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-auto p-1 rounded-md hover:bg-muted/50 tap-scale">
                        <MoreVertical size={14} className="text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => handleRemoveParticipant(p.id, p.name)}
                        className={cn("text-xs", !canRemove && "opacity-50")}
                      >
                        <UserX size={14} className="mr-2" />
                        Remove from plan
                        {!canRemove && <span className="text-[9px] text-muted-foreground ml-1">(locked)</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setReportTarget({ id: p.id, name: p.name, type: 'user' }); setShowReport(true); }}
                        className="text-xs"
                      >
                        <Flag size={14} className="mr-2" /> Report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBlock(p.id, p.name)}
                        className="text-xs text-destructive"
                      >
                        <Ban size={14} className="mr-2" /> Block
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Non-host can report participants */}
                {!isHost && p.id !== user?.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-auto p-1 rounded-md hover:bg-muted/50 tap-scale">
                        <MoreVertical size={14} className="text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => { setReportTarget({ id: p.id, name: p.name, type: 'user' }); setShowReport(true); }}
                        className="text-xs"
                      >
                        <Flag size={14} className="mr-2" /> Report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBlock(p.id, p.name)}
                        className="text-xs text-destructive"
                      >
                        <Ban size={14} className="mr-2" /> Block
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isJoined || isHost ? (
        <>
          {/* Chat */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {msgs.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  msg.senderId === 'system'
                    ? 'liquid-glass-subtle text-muted-foreground text-center w-full text-xs'
                    : msg.senderId === user?.id
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'liquid-glass rounded-bl-md'
                }`}>
                  {msg.senderId !== user?.id && msg.senderId !== 'system' && (
                    <p className="text-2xs font-semibold text-primary mb-0.5">{msg.senderName}</p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-3 liquid-glass-nav">
            <div className="flex gap-2 max-w-md mx-auto">
              {isHost && (
                <Button variant="destructive" size="sm" className="shrink-0 h-10 px-3 text-[11px]" onClick={handleEndEarly}>
                  End
                </Button>
              )}
              {isJoined && !isHost && (
                <Button variant="secondary" size="sm" className="shrink-0 h-10 px-3 text-[11px]" onClick={handleLeave}>
                  Leave
                </Button>
              )}
              <input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-full liquid-glass h-10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button className="rounded-full w-10 h-10 p-0 shrink-0"
                onClick={handleSend} disabled={!message.trim()}>
                <Send size={15} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <span className="text-3xl block mb-3">🔒</span>
            <p className="text-sm text-muted-foreground mb-1">Join to unlock the chat</p>
            {request.joinMode === 'approval' && (
              <p className="text-[10px] text-muted-foreground mb-4">This plan requires host approval</p>
            )}
            <Button className="tap-scale" onClick={() => navigate(`/join/${request.id}`)} disabled={seatsLeft === 0}>
              {seatsLeft === 0 ? 'Request is full' : request.joinMode === 'approval' ? 'Request to Join' : 'Join Plan'}
            </Button>
          </div>
        </div>
      )}

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title={request.title}
        text={`${request.title}\n📍 ${request.location.name}\nStarts in ${timeLeft}\nJoin here 👇`} />

      <ReportDialog
        open={showReport}
        onClose={() => { setShowReport(false); setReportTarget(null); }}
        targetId={reportTarget?.id || request.id}
        targetName={reportTarget?.name || request.title}
        targetType={reportTarget?.type || 'plan'}
      />
    </div>
  );
}
