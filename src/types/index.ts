export type Role = 'FARMER' | 'BUYER';

export type Language = 'en' | 'te';

export type CropGrade = 'A' | 'B' | 'C';

export type CropStatus =
  | 'ACTIVE'
  | 'REQUEST RECEIVED'
  | 'PRE-BOOKED'
  | 'DEAL CONFIRMED'
  | 'SOLD'
  | 'CANCELLED'
  | 'COMPLETED';

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED';

export type DealStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  state: string;
  district: string;
  area: string;
  profilePhoto?: string;
  marketName?: string; // For buyers
  companyName?: string;
  verified: boolean;
  followedMarketIds: string[];
}

export interface CropEditAudit {
  id: string;
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
}

export interface Crop {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  cropCategory: string;
  totalQuantity: number; // in kg
  preBookedQuantity: number; // in kg
  soldQuantity: number; // in kg
  remainingQuantity: number; // in kg
  unit: string; // 'kg', 'quintal', 'crates'
  grade: CropGrade;
  expectedPrice: number; // ₹ per kg
  location: string;
  district: string;
  state: string;
  photos: string[];
  videoUrl?: string;
  description: string;
  harvestDate: string;
  status: CropStatus;
  createdAt: string;
  updatedAt: string;
  editHistory: CropEditAudit[];
  cancellationHistory?: CancellationRecord[];
}

export interface MarketRequirement {
  id: string;
  cropName: string;
  requiredQuantity: number; // in kg
  preBookedQuantity: number; // in kg
  remainingQuantity: number; // in kg
  buyingPrice: number; // ₹ per kg
  grade: CropGrade;
  demand: 'HIGH' | 'MODERATE' | 'LOW';
  updatedAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  arrivalsQty: number; // in kg
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface MarketUpdatePost {
  id: string;
  marketId: string;
  marketName: string;
  authorName: string;
  title: string;
  content: string;
  cropTag?: string;
  type: 'PRICE_UPDATE' | 'NEW_REQUIREMENT' | 'DEMAND_ALERT' | 'GENERAL_ANNOUNCEMENT';
  timestamp: string;
  likes: number;
}

export interface Market {
  id: string;
  name: string;
  teluguName: string;
  district: string;
  state: string;
  address: string;
  operatingHours: string;
  contactNumber: string;
  verifiedBuyerIds: string[];
  bannerImage: string;
  cropsRequired: MarketRequirement[];
  priceHistory: {
    today: PriceHistoryPoint[];
    week: PriceHistoryPoint[];
    month: PriceHistoryPoint[];
  };
  recentUpdates: MarketUpdatePost[];
  followerCount: number;
}

export interface CropRequest {
  id: string;
  cropId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerMarketName: string;
  requestedQuantity: number; // in kg
  offeredPrice: number; // ₹ per kg
  notes?: string;
  createdAt: string;
  expiresAt: string; // 1-hour expiry
  status: RequestStatus;
  rejectionReason?: string;
}

export interface Deal {
  id: string;
  dealNumber: string;
  cropId: string;
  cropName: string;
  grade: CropGrade;
  quantity: number; // in kg
  agreedPrice: number; // ₹ per kg
  totalAmount: number;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerMarket: string;
  requestId: string;
  createdAt: string;
  status: DealStatus;
  cancellationId?: string;
}

export interface CancellationRecord {
  id: string;
  dealOrRequestId: string;
  cropId: string;
  cropName: string;
  quantityRestored: number;
  initiatedByUserId: string;
  initiatedByRole: Role;
  reason: string;
  otpCode: string;
  otpVerified: boolean;
  confirmedByOtherParty: boolean;
  requestedAt: string;
  cancelledAt?: string;
  status: 'PENDING_APPROVAL' | 'AWAITING_OTP' | 'COMPLETED' | 'REJECTED';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: Role;
  text: string;
  timestamp: string;
  cropReferenceId?: string;
  dealReferenceId?: string;
  isAudio?: boolean;
}

export interface Conversation {
  id: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  cropId?: string;
  cropName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountFarmer: number;
  unreadCountBuyer: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  titleTelugu?: string;
  message: string;
  messageTelugu?: string;
  type:
    | 'NEW_REQUEST'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_REJECTED'
    | 'PRE_BOOKED'
    | 'DEAL_CONFIRMED'
    | 'CANCELLATION_REQUEST'
    | 'CANCELLATION_CONFIRMED'
    | 'PRICE_UPDATE'
    | 'MARKET_ALERT'
    | 'NEW_MESSAGE'
    | 'REQUEST_EXPIRED';
  timestamp: string;
  read: boolean;
  relatedId?: string; // cropId, requestId, dealId, etc.
}
