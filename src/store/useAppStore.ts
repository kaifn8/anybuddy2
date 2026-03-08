import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Request, Notification, CreditTransaction, Category, TrustLevel, Urgency, Participant, ChatMessage, MeetupReview, Badge } from '@/types/anybuddy';

const FAKE_NAMES = ['Priya', 'Arjun', 'Maya', 'Rohan', 'Zara', 'Aditya', 'Neha', 'Vikram', 'Ananya', 'Kabir', 'Riya', 'Dev', 'Simran', 'Rahul'];

const FAKE_REQUEST_TITLES = [
  'Anyone for chai at Carter Road?',
  'Need help moving a couch 🛋️',
  'Looking for a co-working buddy in Bandra',
  'Exploring Kala Ghoda art district',
  'Quick grocery run - need company!',
  'Study session at Asiatic Library?',
  'Morning walk at Marine Drive',
  'Anyone know good cafes in Versova?',
  'Trying a new restaurant in Colaba tonight',
  'Weekend trek to Karnala Fort',
  'Need a gym buddy in Andheri 💪',
  'Coffee and brainstorming at Prithvi Cafe',
  'Badminton at 6 PM in Powai?',
  'Street food crawl in Mohammad Ali Road',
  'Evening jog at Juhu Beach',
];

const LOCATIONS = [
  { name: 'Koramangala', distance: 0.5, coords: { lat: 12.9352, lng: 77.6245 } },
  { name: 'Indiranagar', distance: 1.2, coords: { lat: 12.9784, lng: 77.6408 } },
  { name: 'HSR Layout', distance: 0.8, coords: { lat: 12.9116, lng: 77.6389 } },
  { name: 'Whitefield', distance: 4.5, coords: { lat: 12.9698, lng: 77.7500 } },
  { name: 'MG Road', distance: 2.1, coords: { lat: 12.9756, lng: 77.6068 } },
  { name: 'JP Nagar', distance: 3.2, coords: { lat: 12.9063, lng: 77.5857 } },
  { name: 'Jayanagar', distance: 1.8, coords: { lat: 12.9308, lng: 77.5838 } },
  { name: 'Marathahalli', distance: 3.8, coords: { lat: 12.9591, lng: 77.6974 } },
];

const CATEGORIES: Category[] = ['chai', 'explore', 'shopping', 'work', 'help', 'casual', 'sports', 'food', 'walk'];
const URGENCIES: Urgency[] = ['now', 'today', 'week'];
const TRUST_LEVELS: TrustLevel[] = ['seed', 'solid', 'trusted', 'anchor'];

const BIOS = [
  'Coffee addict ☕ Love meeting new people',
  'Weekend explorer 🧭',
  'Fitness enthusiast & foodie',
  'Just moved to Bangalore, looking for buddies!',
  'Book nerd who also loves hiking',
  'Tech geek by day, badminton player by evening',
];

interface AppState {
  user: User | null;
  isOnboarded: boolean;
  requests: Request[];
  myRequests: Request[];
  joinedRequests: string[];
  chatMessages: Record<string, ChatMessage[]>;
  notifications: Notification[];
  creditHistory: CreditTransaction[];
  reviews: MeetupReview[];
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setOnboarded: (value: boolean) => void;
  updateCredits: (amount: number, reason: string) => void;
  updateTrust: (level: TrustLevel) => void;
  createRequest: (request: Omit<Request, 'id' | 'createdAt' | 'participants'>) => void;
  joinRequest: (requestId: string, note?: string) => void;
  leaveRequest: (requestId: string) => void;
  sendMessage: (requestId: string, message: string) => void;
  refreshFeed: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  savePlan: (requestId: string) => void;
  unsavePlan: (requestId: string) => void;
  submitReview: (review: Omit<MeetupReview, 'id' | 'timestamp'>) => void;
  completeMeetup: (requestId: string) => void;
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
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const reliability = Math.floor(Math.random() * 30) + 70;
  
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    userName: name,
    userTrust: TRUST_LEVELS[Math.floor(Math.random() * TRUST_LEVELS.length)],
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    userReliability: reliability,
    userHostRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    title: FAKE_REQUEST_TITLES[Math.floor(Math.random() * FAKE_REQUEST_TITLES.length)],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    urgency,
    when,
    location,
    seatsTotal,
    seatsTaken,
    expiresAt,
    createdAt: new Date(now.getTime() - Math.random() * 3600000),
    liveShare: Math.random() > 0.5,
    participants: [],
    status: 'active',
  };
};

const generateInitialRequests = (count: number): Request[] => {
  return Array.from({ length: count }, generateFakeRequest);
};

const createDefaultUser = (overrides: Partial<User>): User => ({
  id: '', firstName: '', phone: '', ageRange: '', city: 'Bangalore',
  interests: [], trustLevel: 'seed', credits: 3, completedJoins: 0,
  createdAt: new Date(), reliabilityScore: 100, joinRate: 100,
  hostRating: 0, meetupsHosted: 0, meetupsAttended: 0, noShows: 0,
  cancellations: 0, isVerified: false, badges: [], savedPlans: [],
  ...overrides,
});

const initialState = {
  user: null as User | null,
  isOnboarded: false,
  requests: generateInitialRequests(10),
  myRequests: [] as Request[],
  joinedRequests: [] as string[],
  chatMessages: {} as Record<string, ChatMessage[]>,
  notifications: [] as Notification[],
  creditHistory: [] as CreditTransaction[],
  reviews: [] as MeetupReview[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      
      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      updateCredits: (amount, reason) => {
        const { user, creditHistory } = get();
        if (!user) return;
        const txn: CreditTransaction = {
          id: `txn_${Date.now()}`, type: amount > 0 ? 'earn' : 'spend',
          amount: Math.abs(amount), reason, timestamp: new Date(),
        };
        set({
          user: { ...user, credits: Math.max(0, user.credits + amount) },
          creditHistory: [txn, ...creditHistory],
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
          ...requestData, id: `req_${Date.now()}`, createdAt: new Date(),
          participants: [], userId: user.id, userName: user.firstName,
          userTrust: user.trustLevel, userAvatar: user.avatar,
          userReliability: user.reliabilityScore, userHostRating: user.hostRating,
        };
        set({
          myRequests: [newRequest, ...myRequests],
          requests: [newRequest, ...requests],
          user: { ...user, meetupsHosted: user.meetupsHosted + 1 },
        });
      },
      
      joinRequest: (requestId, note) => {
        const { user, requests, joinedRequests, chatMessages } = get();
        if (!user) return;
        const participant: Participant = {
          id: user.id, name: user.firstName, avatar: user.avatar, note, joinedAt: new Date(),
        };
        const updatedRequests = requests.map(r => 
          r.id === requestId 
            ? { ...r, seatsTaken: r.seatsTaken + 1, participants: [...r.participants, participant] }
            : r
        );
        const welcomeMessage: ChatMessage = {
          id: `msg_${Date.now()}`, senderId: 'system', senderName: 'AnyBuddy',
          message: `${user.firstName} joined! Say hi 👋`, timestamp: new Date(),
        };
        set({
          requests: updatedRequests,
          joinedRequests: [...joinedRequests, requestId],
          chatMessages: { ...chatMessages, [requestId]: [...(chatMessages[requestId] || []), welcomeMessage] },
        });
      },
      
      leaveRequest: (requestId) => {
        const { user, requests, joinedRequests } = get();
        if (!user) return;
        const updatedRequests = requests.map(r => 
          r.id === requestId 
            ? { ...r, seatsTaken: Math.max(0, r.seatsTaken - 1), participants: r.participants.filter(p => p.id !== user.id) }
            : r
        );
        set({
          requests: updatedRequests,
          joinedRequests: joinedRequests.filter(id => id !== requestId),
          user: { ...user, cancellations: user.cancellations + 1 },
        });
      },
      
      sendMessage: (requestId, message) => {
        const { user, chatMessages } = get();
        if (!user) return;
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}`, senderId: user.id, senderName: user.firstName,
          message, timestamp: new Date(),
        };
        set({ chatMessages: { ...chatMessages, [requestId]: [...(chatMessages[requestId] || []), newMessage] } });
        
        setTimeout(() => {
          const { chatMessages: current, requests } = get();
          const request = requests.find(r => r.id === requestId);
          if (!request) return;
          const responses = ["On my way! 🏃", "Sounds great!", "Can't wait!", "See you there 😊", "Perfect timing!", "Almost there!"];
          const fake: ChatMessage = {
            id: `msg_${Date.now()}_fake`, senderId: request.userId, senderName: request.userName,
            message: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date(),
          };
          set({ chatMessages: { ...current, [requestId]: [...(current[requestId] || []), fake] } });
        }, 2000 + Math.random() * 3000);
      },
      
      refreshFeed: () => {
        const { requests } = get();
        const now = new Date();
        let filtered = requests.filter(r => new Date(r.expiresAt) > now && r.status === 'active');
        if (Math.random() > 0.4) filtered = [generateFakeRequest(), ...filtered];
        set({ requests: filtered.slice(0, 15) });
      },
      
      addNotification: (notification) => {
        const { notifications } = get();
        set({ notifications: [{ ...notification, id: `notif_${Date.now()}`, timestamp: new Date(), read: false }, ...notifications] });
      },
      
      markNotificationRead: (id) => {
        const { notifications } = get();
        set({ notifications: notifications.map(n => n.id === id ? { ...n, read: true } : n) });
      },
      
      savePlan: (requestId) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, savedPlans: [...user.savedPlans, requestId] } });
      },
      
      unsavePlan: (requestId) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, savedPlans: user.savedPlans.filter(id => id !== requestId) } });
      },
      
      submitReview: (review) => {
        const { reviews, user } = get();
        const newReview: MeetupReview = { ...review, id: `rev_${Date.now()}`, timestamp: new Date() };
        set({ reviews: [newReview, ...reviews] });
        if (user && review.didHappen === 'yes') {
          set({
            user: {
              ...user,
              meetupsAttended: user.meetupsAttended + 1,
              completedJoins: user.completedJoins + 1,
              reliabilityScore: Math.min(100, user.reliabilityScore + 1),
            },
          });
        }
      },
      
      completeMeetup: (requestId) => {
        const { requests } = get();
        set({ requests: requests.map(r => r.id === requestId ? { ...r, status: 'completed' as const } : r) });
      },
      
      reset: () => set({ ...initialState, requests: generateInitialRequests(10) }),
    }),
    {
      name: 'anybuddy-storage',
      partialize: (state) => ({
        user: state.user, isOnboarded: state.isOnboarded,
        creditHistory: state.creditHistory, joinedRequests: state.joinedRequests,
        reviews: state.reviews,
      }),
    }
  )
);

export { createDefaultUser };
