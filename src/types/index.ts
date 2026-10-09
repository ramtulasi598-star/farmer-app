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

export type DealWorkflowStatus =
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'ACCEPTED'
  | 'QUANTITY_RESERVED'
  | 'CONFIRMED'
  | 'DEAL_CONFIRMED'
  | 'PICKUP_SCHEDULED'
  | 'CROP_HANDED_OVER'
  | 'PAYMENT_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DemandStatus = 'HIGH' | 'NORMAL' | 'LOW' | 'ALMOST_FILLED' | 'MODERATE';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  phone: string;
  role: Role;
  state: string;
  district: string;
  area: string;
  pincode?: string;
  profilePhoto?: string;
  marketName?: string;
  companyName?: string;
  verified: boolean;
  reliabilityRating?: number; // e.g. 4.8
  completedTransactionsCount?: number;
  cancellationRatePercent?: number; // e.g. 2
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
  cropName: string; // Exact specific name: "Tomato", "Green Chilli", "Potato"
  variety?: string; // e.g., "Hybrid Sahu", "Kufri Jyoti", "Teja Super Hot"
  cropCategory: string;
  totalQuantity: number; // in kg
  preBookedQuantity: number; // in kg (also known as reserved)
  soldQuantity: number; // in kg
  remainingQuantity: number; // in kg (must never be negative)
  unit: string;
  grade: CropGrade;
  expectedPrice: number; // FARMER'S EXPECTED PRICE (₹/kg)
  currentMarketBuyingPrice?: number; // Reference APMC buying price for clear comparison
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
  updatedMinutesAgo?: number; // For relative time & out-of-date warning
  editHistory: CropEditAudit[];
  cancellationHistory?: CancellationRecord[];
}

export interface MarketRequirement {
  id: string;
  cropName: string; // Specific name: "Tomato", "Potato", "Red Chilli", "Rice / Paddy"
  variety?: string;
  requiredQuantity: number; // in kg
  preBookedQuantity: number; // in kg
  remainingQuantity: number; // in kg (e.g. 6,500 kg still required)
  buyingPrice: number; // MARKET BUYING PRICE (₹/kg)
  grade: CropGrade;
  demand: DemandStatus;
  updatedAt: string; // e.g. '8 min ago'
  updatedMinutesAgo?: number;
  isPriceOutdated?: boolean;
  priceSource?: 'APMC Market Official' | 'Verified Commission Agent' | 'Verified Buyer';
  priceHistory?: {
    today: PriceHistoryPoint[];
    week: PriceHistoryPoint[];
    month: PriceHistoryPoint[];
  };
}

export interface PriceHistoryPoint {
  date: string;
  time?: string;
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
  distanceKm?: number; // Distance from farmer's location (e.g. 18 km)
  operatingHours: string;
  contactNumber: string;
  verified?: boolean; // 🟢 Verified Market
  verifiedBuyerIds: string[];
  rating?: number; // e.g. 4.9
  bannerImage: string;
  lastUpdatedText?: string; // e.g. '8 min ago'
  lastUpdatedMinutesAgo?: number;
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
  variety?: string;
  grade?: CropGrade;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerLocation?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerMarketName: string;
  buyerVerified?: boolean; // 🟢 Verified Buyer
  buyerRating?: number;
  buyerCompletedDeals?: number;
  buyerCancellationRate?: number;
  requestedQuantity: number; // in kg
  offeredPrice: number; // OFFERED PRICE (₹/kg)
  pickupInfo?: string;
  notes?: string;
  createdAt: string;
  createdMinutesAgo?: number;
  expiresAt: string; // 1-hour expiry for Farmer-to-Market; 24-hour expiry for Farmer-to-Buyer
  status: RequestStatus;
  rejectionReason?: string;
  sourceType?: 'BUYER_BOOKING' | 'FARMER_SUPPLY_OFFER';
  marketId?: string;
}

export interface Deal {
  id: string;
  dealNumber: string;
  cropId: string;
  cropName: string;
  variety?: string;
  grade: CropGrade;
  quantity: number; // in kg
  agreedPrice: number; // AGREED / CONFIRMED PRICE (₹/kg)
  totalAmount: number;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerVerified?: boolean;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerMarket: string;
  buyerVerified?: boolean;
  buyerRating?: number;
  requestId: string;
  createdAt: string;
  status: DealWorkflowStatus;
  pickupScheduledDate?: string;
  transportEstimate?: {
    distanceKm: number;
    vehicleType: string;
    estimatedCost: number;
    netReturnPerKg: number;
  };
  cancellationId?: string;
  cancelledByRole?: Role;
  cancelledByName?: string;
  cancellationReason?: string;
  farmerRatingForBuyer?: number;
  buyerRatingForFarmer?: number;
  reviewComment?: string;
}

export interface CancellationRecord {
  id: string;
  dealOrRequestId: string;
  cropId: string;
  cropName: string;
  quantityRestored: number;
  initiatedByUserId: string;
  initiatedByName?: string;
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
  buyerVerified?: boolean;
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
    | 'REQUEST_EXPIRED'
    | 'STATUS_CHANGE';
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export interface MarketNetReturnEstimate {
  marketId: string;
  marketName: string;
  cropName: string;
  grade: CropGrade;
  marketBuyingPrice: number; // ₹/kg
  distanceKm: number;
  vehicleType: string;
  estimatedTransportCost: number; // Total ₹
  transportCostPerKg: number; // ₹/kg
  estimatedNetReturnPerKg: number; // ₹/kg = marketBuyingPrice - transportCostPerKg
  estimatedTotalNetReturn: number; // ₹ = quantity * netReturnPerKg
  quantityKg: number;
  isBestReturn: boolean;
  requiredQuantity: number;
}

export interface MarketArrivalImport {
  id: string;
  marketId: string;
  marketName: string;
  cropName: string;
  variety?: string;
  grade: CropGrade;
  importedQuantityKg: number;
  sourceRegion: string;
  arrivalVehicle: string;
  timestamp: string;
  updatedInCycle: number;
  marketBuyingPrice: number;
}

export interface MarketCycleEvent {
  id: string;
  timestamp: string;
  cycleNumber: number;
  marketId: string;
  marketName: string;
  type: 'PRICE_CHANGE' | 'IMPORT_ARRIVAL' | 'PREBOOK_UPDATE';
  cropName: string;
  title: string;
  titleTelugu?: string;
  description: string;
  descriptionTelugu?: string;
  oldPrice?: number;
  newPrice?: number;
  importedQuantityKg?: number;
  preBookedIncrementKg?: number;
  updatedBy: 'APMC Market Board';
}
