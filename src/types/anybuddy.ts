export type TrustLevel = 'seed' | 'solid' | 'trusted' | 'anchor';
export type Urgency = 'now' | 'today' | 'week';
export type Category = 'chai' | 'explore' | 'shopping' | 'work' | 'help' | 'casual';

export interface User {
  id: string;
  firstName: string;
  phone: string;
  ageRange: string;
  city: string;
  interests: Category[];
  trustLevel: TrustLevel;
  credits: number;
  completedJoins: number;
  createdAt: Date;
  avatar?: string;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userTrust: TrustLevel;
  userAvatar?: string;
  title: string;
  category: Category;
  urgency: Urgency;
  when: Date;
  location: {
    name: string;
    distance: number;
    coords?: { lat: number; lng: number };
  };
  seatsTotal: number;
  seatsTaken: number;
  expiresAt: Date;
  createdAt: Date;
  timer?: number; // minutes
  liveShare: boolean;
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  note?: string;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'nearby' | 'urgent' | 'join' | 'message' | 'credit' | 'trust';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  requestId?: string;
}

export interface CreditTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: Date;
}
