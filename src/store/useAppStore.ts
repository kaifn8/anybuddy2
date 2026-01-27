import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Request, Notification, CreditTransaction, Category, TrustLevel, Urgency, Participant, ChatMessage } from '@/types/anybuddy';

// Fake user names and data
const FAKE_NAMES = ['Priya', 'Arjun', 'Maya', 'Rohan', 'Zara', 'Aditya', 'Neha', 'Vikram', 'Ananya', 'Kabir', 'Riya', 'Dev', 'Simran', 'Rahul'];
const FAKE_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara',
];

const FAKE_REQUEST_TITLES = [
  'Anyone for chai and a chat?',
  'Need help moving a couch 🛋️',
  'Looking for a co-working buddy',
  'Exploring the new art exhibition',
  'Quick grocery run - need company!',
  'Study session at the library?',
  'Morning walk in the park',
  'Anyone know good cafes nearby?',
  'Trying a new restaurant tonight',
  'Weekend hiking trip planning',
  'Need a gym buddy 💪',
  'Coffee and brainstorming session',
];

const LOCATIONS = [
  { name: 'Koramangala', distance: 0.5 },
  { name: 'Indiranagar', distance: 1.2 },
  { name: 'HSR Layout', distance: 0.8 },
  { name: 'Whitefield', distance: 4.5 },
  { name: 'MG Road', distance: 2.1 },
  { name: 'JP Nagar', distance: 3.2 },
];

const CATEGORIES: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual'];
const URGENCIES: Urgency[] = ['now', 'today', 'week'];
const TRUST_LEVELS: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];

interface AppState {
  // Auth
  user: User | null;
  isOnboarded: boolean;
  
  // Requests
  requests: Request[];
  myRequests: Request[];
  joinedRequests: string[];
  
  // Chat
  chatMessages: Record<string, ChatMessage[]>;
  
  // Notifications
  notifications: Notification[];
  
  // Credit history
  creditHistory: CreditTransaction[];
  
  // Actions
  setUser: (user: User | null) => void;
  setOnboarded: (value: boolean) => void;
  updateCredits: (amount: number, reason: string) => void;
  updateTrust: (level: TrustLevel) => void;
  
  // Request actions
  createRequest: (request: Omit<Request, 'id' | 'createdAt' | 'participants'>) => void;
  joinRequest: (requestId: string, note?: string) => void;
  leaveRequest: (requestId: string) => void;
  
  // Chat
  sendMessage: (requestId: string, message: string) => void;
  
  // Feed
  refreshFeed: () => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  
  // Reset
  reset: () => void;
}

const generateFakeRequest = (): Request => {
  const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const urgency = URGENCIES[Math.floor(Math.random() * URGENCIES.length)];
  const now = new Date();
  
  let when = new Date();
  let expiresAt = new Date();
  
  if (urgency === 'now') {
    when = now;
    expiresAt = new Date(now.getTime() + (Math.random() * 30 + 10) * 60000);
  } else if (urgency === 'today') {
    when = new Date(now.getTime() + Math.random() * 8 * 3600000);
    expiresAt = new Date(when.getTime() + 2 * 3600000);
  } else {
    when = new Date(now.getTime() + (Math.random() * 6 + 1) * 24 * 3600000);
    expiresAt = new Date(when.getTime() + 24 * 3600000);
  }
  
  const seatsTotal = Math.floor(Math.random() * 5) + 1;
  const seatsTaken = Math.floor(Math.random() * seatsTotal);
  
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    userName: name,
    userTrust: TRUST_LEVELS[Math.floor(Math.random() * TRUST_LEVELS.length)],
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    title: FAKE_REQUEST_TITLES[Math.floor(Math.random() * FAKE_REQUEST_TITLES.length)],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    urgency,
    when,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    seatsTotal,
    seatsTaken,
    expiresAt,
    createdAt: new Date(now.getTime() - Math.random() * 3600000),
    liveShare: Math.random() > 0.5,
    participants: [],
  };
};

const generateInitialRequests = (count: number): Request[] => {
  return Array.from({ length: count }, generateFakeRequest);
};

const initialState = {
  user: null,
  isOnboarded: false,
  requests: generateInitialRequests(8),
  myRequests: [],
  joinedRequests: [],
  chatMessages: {},
  notifications: [],
  creditHistory: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      updateCredits: (amount, reason) => {
        const { user, creditHistory } = get();
        if (!user) return;
        
        const transaction: CreditTransaction = {
          id: `txn_${Date.now()}`,
          type: amount > 0 ? 'earn' : 'spend',
          amount: Math.abs(amount),
          reason,
          timestamp: new Date(),
        };
        
        set({
          user: { ...user, credits: Math.max(0, user.credits + amount) },
          creditHistory: [transaction, ...creditHistory],
        });
      },
      
      updateTrust: (level) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, trustLevel: level } });
      },
      
      createRequest: (requestData) => {
        const { user, myRequests, requests } = get();
        if (!user) return;
        
        const newRequest: Request = {
          ...requestData,
          id: `req_${Date.now()}`,
          createdAt: new Date(),
          participants: [],
          userId: user.id,
          userName: user.firstName,
          userTrust: user.trustLevel,
          userAvatar: user.avatar,
        };
        
        set({
          myRequests: [newRequest, ...myRequests],
          requests: [newRequest, ...requests],
        });
      },
      
      joinRequest: (requestId, note) => {
        const { user, requests, joinedRequests, chatMessages } = get();
        if (!user) return;
        
        const participant: Participant = {
          id: user.id,
          name: user.firstName,
          avatar: user.avatar,
          note,
          joinedAt: new Date(),
        };
        
        const updatedRequests = requests.map(r => 
          r.id === requestId 
            ? { ...r, seatsTaken: r.seatsTaken + 1, participants: [...r.participants, participant] }
            : r
        );
        
        // Initialize chat with a welcome message
        const welcomeMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          senderId: 'system',
          senderName: 'AnyBuddy',
          message: `${user.firstName} joined! Say hi 👋`,
          timestamp: new Date(),
        };
        
        set({
          requests: updatedRequests,
          joinedRequests: [...joinedRequests, requestId],
          chatMessages: {
            ...chatMessages,
            [requestId]: [...(chatMessages[requestId] || []), welcomeMessage],
          },
        });
      },
      
      leaveRequest: (requestId) => {
        const { user, requests, joinedRequests } = get();
        if (!user) return;
        
        const updatedRequests = requests.map(r => 
          r.id === requestId 
            ? { 
                ...r, 
                seatsTaken: Math.max(0, r.seatsTaken - 1), 
                participants: r.participants.filter(p => p.id !== user.id) 
              }
            : r
        );
        
        set({
          requests: updatedRequests,
          joinedRequests: joinedRequests.filter(id => id !== requestId),
        });
      },
      
      sendMessage: (requestId, message) => {
        const { user, chatMessages } = get();
        if (!user) return;
        
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          senderId: user.id,
          senderName: user.firstName,
          message,
          timestamp: new Date(),
        };
        
        set({
          chatMessages: {
            ...chatMessages,
            [requestId]: [...(chatMessages[requestId] || []), newMessage],
          },
        });
        
        // Simulate response after delay
        setTimeout(() => {
          const { chatMessages: currentMessages, requests } = get();
          const request = requests.find(r => r.id === requestId);
          if (!request) return;
          
          const responses = [
            "On my way! 🏃",
            "Sounds great!",
            "Can't wait!",
            "See you there 😊",
            "Perfect timing!",
          ];
          
          const fakeResponse: ChatMessage = {
            id: `msg_${Date.now()}_fake`,
            senderId: request.userId,
            senderName: request.userName,
            message: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
          };
          
          set({
            chatMessages: {
              ...currentMessages,
              [requestId]: [...(currentMessages[requestId] || []), fakeResponse],
            },
          });
        }, 2000 + Math.random() * 3000);
      },
      
      refreshFeed: () => {
        const { requests } = get();
        const now = new Date();
        
        // Remove expired requests
        let filtered = requests.filter(r => new Date(r.expiresAt) > now);
        
        // Add new random requests occasionally
        if (Math.random() > 0.5) {
          const newRequest = generateFakeRequest();
          filtered = [newRequest, ...filtered];
        }
        
        // Keep max 15 requests
        set({ requests: filtered.slice(0, 15) });
      },
      
      addNotification: (notification) => {
        const { notifications } = get();
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}`,
          timestamp: new Date(),
          read: false,
        };
        set({ notifications: [newNotification, ...notifications] });
      },
      
      markNotificationRead: (id) => {
        const { notifications } = get();
        set({
          notifications: notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },
      
      reset: () => set({ ...initialState, requests: generateInitialRequests(8) }),
    }),
    {
      name: 'anybuddy-storage',
      partialize: (state) => ({
        user: state.user,
        isOnboarded: state.isOnboarded,
        creditHistory: state.creditHistory,
        joinedRequests: state.joinedRequests,
      }),
    }
  )
);
