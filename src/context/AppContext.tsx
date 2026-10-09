import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Role,
  Language,
  Crop,
  Market,
  CropRequest,
  Deal,
  Conversation,
  ChatMessage,
  AppNotification,
  CancellationRecord,
  MarketRequirement,
  CropGrade,
  MarketArrivalImport,
  MarketCycleEvent,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MARKETS,
  INITIAL_CROPS,
  INITIAL_REQUESTS,
  INITIAL_DEALS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  MARKET_CYCLE_DURATION_SECONDS,
  INITIAL_INWARD_ARRIVALS,
  INITIAL_CYCLE_EVENTS,
  execute8MinuteMarketCycle,
} from '../utils/marketCycleEngine';
import { translations } from '../i18n/translations';

interface AppContextType {
  // Auth & User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasDownloadedApp: boolean;
  loginUser: (
    phone: string,
    role: Role,
    name: string,
    state: string,
    district: string,
    area: string,
    pincode?: string,
    firstName?: string
  ) => void;
  logoutUser: () => void;
  resetDownloadOnboarding: () => void;
  switchRole: (role: Role) => void;
  
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Crops
  crops: Crop[];
  addCrop: (cropData: Omit<Crop, 'id' | 'createdAt' | 'updatedAt' | 'remainingQuantity' | 'preBookedQuantity' | 'soldQuantity' | 'editHistory'>) => Crop;
  updateCrop: (cropId: string, updates: Partial<Crop>, changerName?: string) => { success: boolean; error?: string };
  deleteCrop: (cropId: string) => { success: boolean; error?: string };
  markCropSold: (cropId: string) => void;
  getCropById: (cropId: string) => Crop | undefined;
  
  // Markets
  markets: Market[];
  getMarketById: (marketId: string) => Market | undefined;
  toggleFollowMarket: (marketId: string) => void;
  addMarketRequirement: (marketId: string, requirement: Omit<MarketRequirement, 'id' | 'updatedAt' | 'remainingQuantity' | 'preBookedQuantity'>) => void;
  
  // Requests
  requests: CropRequest[];
  createCropRequest: (data: { cropId: string; requestedQuantity: number; offeredPrice: number; notes?: string }) => { success: boolean; error?: string; request?: CropRequest };
  submitMarketSupplyRequest: (data: {
    marketId: string;
    marketName: string;
    farmerName: string;
    cropName: string;
    quantity: number;
    grade: CropGrade;
    location: string;
    expectedPrice: number;
    cropId?: string;
    notes?: string;
    phone?: string;
  }) => { success: boolean; error?: string; request?: CropRequest };
  acceptCropRequest: (requestId: string) => { success: boolean; error?: string; deal?: Deal };
  rejectCropRequest: (requestId: string, reason?: string) => void;
  expireCropRequest: (requestId: string) => void;
  resendCropRequest: (requestId: string) => { success: boolean; error?: string };
  
  // Deals
  deals: Deal[];
  getDealById: (dealId: string) => Deal | undefined;
  
  // Cancellation Workflow
  cancellations: CancellationRecord[];
  initiateCancellation: (dealId: string, reason: string) => { success: boolean; cancellationId?: string; otp: string };
  confirmCancellationApproval: (cancellationId: string) => void;
  verifyCancellationOtp: (cancellationId: string, otp: string) => { success: boolean; message: string };
  
  // Chat
  conversations: Conversation[];
  messages: ChatMessage[];
  sendMessage: (conversationId: string, text: string, cropReferenceId?: string, dealReferenceId?: string, isAudio?: boolean) => void;
  getOrCreateConversation: (farmerId: string, buyerId: string, cropId?: string) => string;
  
  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // 8-Minute Market Timer & Cycle System (Requirement 3)
  marketTimerSecondsLeft: number;
  marketTimerTotalSeconds: number;
  isMarketTimerActive: boolean;
  toggleMarketTimer: () => void;
  marketCycleCount: number;
  lastMarketCycleAt: string;
  marketCycleEvents: MarketCycleEvent[];
  inwardArrivals: MarketArrivalImport[];
  triggerMarketCycleUpdate: () => void;

  // UI Helpers
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAudioSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or use initial seed data
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('rythu_language') as Language) || 'en';
  });

  const [hasDownloadedApp, setHasDownloadedAppState] = useState<boolean>(() => {
    return localStorage.getItem('rythu_downloaded_app') === 'true';
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    // Check if app has been downloaded & registered before
    const isDownloaded = localStorage.getItem('rythu_downloaded_app') === 'true';
    const saved = localStorage.getItem('rythu_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return isDownloaded ? INITIAL_USERS[0] : null;
      }
    }
    // If user has not downloaded/registered on this device yet, start with null so the 1-time download onboarding screen appears
    if (!isDownloaded) {
      return null;
    }
    return INITIAL_USERS[0]; // Default logged-in as Farmer Ramesh Reddy once downloaded
  });

  const [crops, setCrops] = useState<Crop[]>(() => {
    const saved = localStorage.getItem('rythu_crops');
    if (saved) {
      try {
        const parsed: Crop[] = JSON.parse(saved);
        let merged = parsed;
        const missing = INITIAL_CROPS.filter(ic => !parsed.some(p => p.id === ic.id));
        if (missing.length > 0) {
          merged = [...parsed, ...missing];
        }
        const updated = merged.map(c => {
          const fresh = INITIAL_CROPS.find(ic => ic.id === c.id);
          return fresh && fresh.currentMarketBuyingPrice
            ? { ...c, currentMarketBuyingPrice: fresh.currentMarketBuyingPrice }
            : c;
        });
        localStorage.setItem('rythu_crops', JSON.stringify(updated));
        return updated;
      } catch {}
    }
    return INITIAL_CROPS;
  });

  const [markets, setMarkets] = useState<Market[]>(() => {
    const saved = localStorage.getItem('rythu_markets');
    if (saved) {
      try {
        const parsed: Market[] = JSON.parse(saved);
        const missing = INITIAL_MARKETS.filter(im => !parsed.some(p => p.id === im.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('rythu_markets', JSON.stringify(merged));
          return merged;
        }
        const updated = parsed.map(m => {
          const fresh = INITIAL_MARKETS.find(im => im.id === m.id);
          return fresh ? { ...m, cropsRequired: fresh.cropsRequired } : m;
        });
        return updated;
      } catch {}
    }
    return INITIAL_MARKETS;
  });

  const [requests, setRequests] = useState<CropRequest[]>(() => {
    const saved = localStorage.getItem('rythu_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_REQUESTS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('rythu_deals');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_DEALS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('rythu_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('rythu_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('rythu_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [cancellations, setCancellations] = useState<CancellationRecord[]>(() => {
    const saved = localStorage.getItem('rythu_cancellations');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<boolean>(false);

  // 8-Minute Market Timer & Cycle System State (Requirement 3)
  const [marketTimerSecondsLeft, setMarketTimerSecondsLeft] = useState<number>(() => {
    const saved = localStorage.getItem('rythu_market_timer');
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num > 0 && num <= MARKET_CYCLE_DURATION_SECONDS) return num;
    }
    return MARKET_CYCLE_DURATION_SECONDS; // 480 seconds (8 minutes)
  });

  const [isMarketTimerActive, setIsMarketTimerActive] = useState<boolean>(true);

  const [marketCycleCount, setMarketCycleCount] = useState<number>(() => {
    const saved = localStorage.getItem('rythu_market_cycle_count');
    return saved ? parseInt(saved, 10) || 1 : 1;
  });

  const [lastMarketCycleAt, setLastMarketCycleAt] = useState<string>(() => {
    return localStorage.getItem('rythu_last_market_cycle') || 'Just now (8-min cycle)';
  });

  const [marketCycleEvents, setMarketCycleEvents] = useState<MarketCycleEvent[]>(() => {
    const saved = localStorage.getItem('rythu_cycle_events');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CYCLE_EVENTS;
  });

  const [inwardArrivals, setInwardArrivals] = useState<MarketArrivalImport[]>(() => {
    const saved = localStorage.getItem('rythu_inward_arrivals');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_INWARD_ARRIVALS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rythu_language', language);
  }, [language]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rythu_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rythu_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rythu_crops', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('rythu_markets', JSON.stringify(markets));
  }, [markets]);

  useEffect(() => {
    localStorage.setItem('rythu_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('rythu_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('rythu_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('rythu_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('rythu_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('rythu_cancellations', JSON.stringify(cancellations));
  }, [cancellations]);

  useEffect(() => {
    localStorage.setItem('rythu_market_timer', marketTimerSecondsLeft.toString());
  }, [marketTimerSecondsLeft]);

  useEffect(() => {
    localStorage.setItem('rythu_market_cycle_count', marketCycleCount.toString());
  }, [marketCycleCount]);

  useEffect(() => {
    localStorage.setItem('rythu_last_market_cycle', lastMarketCycleAt);
  }, [lastMarketCycleAt]);

  useEffect(() => {
    localStorage.setItem('rythu_cycle_events', JSON.stringify(marketCycleEvents));
  }, [marketCycleEvents]);

  useEffect(() => {
    localStorage.setItem('rythu_inward_arrivals', JSON.stringify(inwardArrivals));
  }, [inwardArrivals]);

  // Translation helper
  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const loginUser = (
    phone: string,
    role: Role,
    name: string,
    state: string,
    district: string,
    area: string,
    pincode?: string,
    firstName?: string
  ) => {
    // Check if user exists in initial users
    const existing = INITIAL_USERS.find(u => u.phone === phone);
    if (existing) {
      const updatedExisting: User = {
        ...existing,
        role,
        name: name.trim() || existing.name,
        firstName: firstName?.trim() || existing.firstName || name.trim().split(' ')[0],
        state: state || existing.state,
        district: district || existing.district,
        area: area || existing.area,
        pincode: pincode || existing.pincode || '517325',
      };
      setCurrentUserState(updatedExisting);
      localStorage.setItem('rythu_user', JSON.stringify(updatedExisting));
      localStorage.setItem('rythu_downloaded_app', 'true');
      setHasDownloadedAppState(true);
      return;
    }
    const derivedFirstName = firstName?.trim() || name.trim().split(' ')[0] || (role === 'FARMER' ? 'Kisan' : 'Trader');
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim() || (role === 'FARMER' ? 'Kisan Bandhu' : 'Trader Partner'),
      firstName: derivedFirstName,
      phone,
      role,
      state: state || 'Andhra Pradesh',
      district: district || 'Chittoor',
      area: area || 'Market Area',
      pincode: pincode || '517325',
      verified: true,
      followedMarketIds: ['mkt_madanapalle'],
    };
    setCurrentUserState(newUser);
    localStorage.setItem('rythu_user', JSON.stringify(newUser));
    localStorage.setItem('rythu_downloaded_app', 'true');
    setHasDownloadedAppState(true);
  };

  const logoutUser = () => {
    setCurrentUserState(null);
  };

  const resetDownloadOnboarding = () => {
    localStorage.removeItem('rythu_downloaded_app');
    localStorage.removeItem('rythu_user');
    setHasDownloadedAppState(false);
    setCurrentUserState(null);
  };

  const switchRole = (role: Role) => {
    if (role === 'FARMER') {
      setCurrentUserState(INITIAL_USERS[0]); // Ramesh Reddy
    } else {
      setCurrentUserState(INITIAL_USERS[1]); // Venkateswara Traders
    }
  };

  // Crops management
  const addCrop = (cropData: Omit<Crop, 'id' | 'createdAt' | 'updatedAt' | 'remainingQuantity' | 'preBookedQuantity' | 'soldQuantity' | 'editHistory'>) => {
    const newCrop: Crop = {
      ...cropData,
      id: `crop_${Date.now()}`,
      preBookedQuantity: 0,
      soldQuantity: 0,
      remainingQuantity: cropData.totalQuantity,
      status: 'ACTIVE',
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      editHistory: [
        {
          id: `audit_${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          field: 'Listing Created',
          oldValue: 'New',
          newValue: `${cropData.totalQuantity} kg @ ₹${cropData.expectedPrice}/kg (Grade ${cropData.grade})`,
          changedBy: cropData.farmerName,
        },
      ],
    };

    setCrops(prev => [newCrop, ...prev]);

    // Send notification
    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        title: 'Crop Listed Successfully',
        titleTelugu: 'పంట విజయవంతంగా నమోదైంది',
        message: `Your listing for ${newCrop.cropName} (${newCrop.totalQuantity} kg) is now active and visible to buyers.`,
        messageTelugu: `మీ ${newCrop.cropName} (${newCrop.totalQuantity} కిలోలు) పోస్ట్ మార్కెట్లో ప్రత్యక్షమైంది.`,
        type: 'PRICE_UPDATE',
        relatedId: newCrop.id,
      });
    }

    return newCrop;
  };

  const updateCrop = (cropId: string, updates: Partial<Crop>, changerName?: string) => {
    const targetCrop = crops.find(c => c.id === cropId);
    if (!targetCrop) return { success: false, error: 'Crop not found' };

    // Security check: Only the farmer who owns the crop can edit
    if (currentUser && currentUser.role === 'BUYER') {
      return { success: false, error: 'Security violation: Buyers cannot edit farmer crops.' };
    }
    if (currentUser && currentUser.id !== targetCrop.farmerId) {
      return { success: false, error: 'Unauthorized: Only the creator farmer can edit this crop.' };
    }

    // Restriction if pre-booked
    if (targetCrop.preBookedQuantity > 0 && updates.totalQuantity !== undefined && updates.totalQuantity < targetCrop.preBookedQuantity) {
      return {
        success: false,
        error: `Cannot reduce total quantity below pre-booked amount (${targetCrop.preBookedQuantity} kg).`,
      };
    }

    const auditRecords = [...targetCrop.editHistory];
    const timestamp = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const actor = changerName || currentUser?.name || 'Farmer';

    if (updates.expectedPrice && updates.expectedPrice !== targetCrop.expectedPrice) {
      auditRecords.push({
        id: `audit_${Date.now()}_price`,
        timestamp,
        field: 'Expected Price',
        oldValue: `₹${targetCrop.expectedPrice}/kg`,
        newValue: `₹${updates.expectedPrice}/kg`,
        changedBy: actor,
      });
    }

    if (updates.totalQuantity && updates.totalQuantity !== targetCrop.totalQuantity) {
      auditRecords.push({
        id: `audit_${Date.now()}_qty`,
        timestamp,
        field: 'Total Quantity',
        oldValue: `${targetCrop.totalQuantity} kg`,
        newValue: `${updates.totalQuantity} kg`,
        changedBy: actor,
      });
    }

    if (updates.grade && updates.grade !== targetCrop.grade) {
      auditRecords.push({
        id: `audit_${Date.now()}_grade`,
        timestamp,
        field: 'Grade Quality',
        oldValue: `Grade ${targetCrop.grade}`,
        newValue: `Grade ${updates.grade}`,
        changedBy: actor,
      });
    }

    const newTotal = updates.totalQuantity ?? targetCrop.totalQuantity;
    const newRemaining = Math.max(0, newTotal - targetCrop.preBookedQuantity - targetCrop.soldQuantity);

    const updatedCrop: Crop = {
      ...targetCrop,
      ...updates,
      remainingQuantity: newRemaining,
      updatedAt: timestamp,
      editHistory: auditRecords,
    };

    setCrops(prev => prev.map(c => (c.id === cropId ? updatedCrop : c)));
    return { success: true };
  };

  const deleteCrop = (cropId: string) => {
    const target = crops.find(c => c.id === cropId);
    if (!target) return { success: false, error: 'Crop not found' };

    // Security check
    if (currentUser?.role === 'BUYER') {
      return { success: false, error: 'Buyers cannot delete farmer crops.' };
    }
    if (currentUser && currentUser.id !== target.farmerId) {
      return { success: false, error: 'Unauthorized: You can only delete your own crops.' };
    }
    if (target.preBookedQuantity > 0) {
      return { success: false, error: 'Cannot delete crop with active pre-bookings. Cancel bookings first.' };
    }

    setCrops(prev => prev.filter(c => c.id !== cropId));
    return { success: true };
  };

  const markCropSold = (cropId: string) => {
    setCrops(prev =>
      prev.map(c => {
        if (c.id === cropId) {
          return {
            ...c,
            status: 'SOLD',
            soldQuantity: c.totalQuantity,
            remainingQuantity: 0,
            updatedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return c;
      })
    );
  };

  const getCropById = (cropId: string) => crops.find(c => c.id === cropId);

  const getMarketById = (marketId: string) => markets.find(m => m.id === marketId);

  const toggleFollowMarket = (marketId: string) => {
    if (!currentUser) return;
    const isFollowed = currentUser.followedMarketIds.includes(marketId);
    const updatedIds = isFollowed
      ? currentUser.followedMarketIds.filter(id => id !== marketId)
      : [...currentUser.followedMarketIds, marketId];

    const updatedUser = { ...currentUser, followedMarketIds: updatedIds };
    setCurrentUserState(updatedUser);

    setMarkets(prev =>
      prev.map(m => {
        if (m.id === marketId) {
          return {
            ...m,
            followerCount: isFollowed ? m.followerCount - 1 : m.followerCount + 1,
          };
        }
        return m;
      })
    );
  };

  const addMarketRequirement = (
    marketId: string,
    req: Omit<MarketRequirement, 'id' | 'updatedAt' | 'remainingQuantity' | 'preBookedQuantity'>
  ) => {
    const newReq: MarketRequirement = {
      ...req,
      id: `req_${Date.now()}`,
      preBookedQuantity: 0,
      remainingQuantity: req.requiredQuantity,
      updatedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMarkets(prev =>
      prev.map(m => {
        if (m.id === marketId) {
          return {
            ...m,
            cropsRequired: [newReq, ...m.cropsRequired],
          };
        }
        return m;
      })
    );

    addNotification({
      userId: currentUser?.id || 'all',
      title: 'New Market Requirement Posted',
      titleTelugu: 'కొత్త కొనుగోలు అవసరం జోడించబడింది',
      message: `${req.cropName} (${req.requiredQuantity} kg @ ₹${req.buyingPrice}/kg) added to market.`,
      messageTelugu: `${req.cropName} (${req.requiredQuantity} కిలోలు @ ₹${req.buyingPrice}/కిలో) మార్కెట్ అవసరాలలో చేర్చబడింది.`,
      type: 'MARKET_ALERT',
      relatedId: marketId,
    });
  };

  // Request & Pre-Booking System
  const createCropRequest = ({
    cropId,
    requestedQuantity,
    offeredPrice,
    notes,
  }: {
    cropId: string;
    requestedQuantity: number;
    offeredPrice: number;
    notes?: string;
  }) => {
    const crop = crops.find(c => c.id === cropId);
    if (!crop) return { success: false, error: 'Crop not found' };

    // Quantity validation rule: Never allow overbooking or booking more than remaining
    if (requestedQuantity <= 0) {
      return { success: false, error: 'Requested quantity must be greater than 0 kg.' };
    }
    if (requestedQuantity > crop.remainingQuantity) {
      return {
        success: false,
        error: `Cannot book more than available quantity (${crop.remainingQuantity} kg available).`,
      };
    }

    const now = new Date();
    // Farmer to Buyer requests have a 24-hour response window; Farmer to Market requests have a 1-hour window
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24-hour response window

    const newRequest: CropRequest = {
      id: `req_${Date.now()}`,
      cropId,
      cropName: crop.cropName,
      farmerId: crop.farmerId,
      farmerName: crop.farmerName,
      buyerId: currentUser?.id || 'user_buyer_1',
      buyerName: currentUser?.name || 'Venkateswara Agro Traders',
      buyerPhone: currentUser?.phone || '9440167890',
      buyerMarketName: currentUser?.marketName || 'Madanapalle APMC',
      requestedQuantity,
      offeredPrice,
      notes,
      createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: expiry.toISOString(),
      status: 'PENDING',
    };

    setRequests(prev => [newRequest, ...prev]);

    // Update crop status to REQUEST RECEIVED if active
    setCrops(prev =>
      prev.map(c => {
        if (c.id === cropId && c.status === 'ACTIVE') {
          return { ...c, status: 'REQUEST RECEIVED' };
        }
        return c;
      })
    );

    // Notify farmer
    addNotification({
      userId: crop.farmerId,
      title: 'New Booking Request (24h Window)',
      titleTelugu: 'కొత్త కొనుగోలు అభ్యర్థన (24 గంటల గడువు)',
      message: `${newRequest.buyerName} requested ${requestedQuantity} kg of ${crop.cropName} @ ₹${offeredPrice}/kg. 24 hours response window!`,
      messageTelugu: `${newRequest.buyerName} ${requestedQuantity} కిలోల ${crop.cropName} @ ₹${offeredPrice}/కిలో అభ్యర్థించారు (24 గంటల గడువు).`,
      type: 'NEW_REQUEST',
      relatedId: newRequest.id,
    });

    // Create chat conversation
    getOrCreateConversation(crop.farmerId, newRequest.buyerId, cropId);

    return { success: true, request: newRequest };
  };

  const submitMarketSupplyRequest = (data: {
    marketId: string;
    marketName: string;
    farmerName: string;
    cropName: string;
    quantity: number;
    grade: CropGrade;
    location: string;
    expectedPrice: number;
    cropId?: string;
    notes?: string;
    phone?: string;
  }) => {
    if (!data.farmerName.trim()) {
      return { success: false, error: 'Farmer name is required.' };
    }
    if (!data.cropName.trim()) {
      return { success: false, error: 'Crop name is required.' };
    }
    if (data.quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than 0 kg.' };
    }
    if (data.expectedPrice <= 0) {
      return { success: false, error: 'Price must be greater than ₹0/kg.' };
    }
    if (!data.location.trim()) {
      return { success: false, error: 'Location is required.' };
    }

    let linkedCropId = data.cropId;
    let referencedCrop = linkedCropId ? crops.find(c => c.id === linkedCropId) : undefined;

    // If farmer selected an existing crop, validate available quantity
    if (referencedCrop) {
      if (data.quantity > referencedCrop.remainingQuantity) {
        return {
          success: false,
          error: `Cannot supply more than available quantity (${referencedCrop.remainingQuantity} kg available).`,
        };
      }
    } else {
      // If farmer is supplying a crop not yet in their listings, auto-create crop listing
      const newCropId = `crop_supply_${Date.now()}`;
      linkedCropId = newCropId;
      const createdCrop: Crop = {
        id: newCropId,
        farmerId: currentUser?.id || 'user_farmer_1',
        farmerName: data.farmerName,
        farmerPhone: data.phone || currentUser?.phone || '9848012345',
        cropName: data.cropName,
        variety: 'Local Farm Fresh',
        cropCategory: data.cropName.split(' ')[0],
        totalQuantity: data.quantity,
        preBookedQuantity: data.quantity,
        soldQuantity: 0,
        remainingQuantity: 0,
        unit: 'kg',
        grade: data.grade,
        expectedPrice: data.expectedPrice,
        location: data.location,
        district: currentUser?.district || 'Chittoor',
        state: currentUser?.state || 'Andhra Pradesh',
        photos: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        ],
        description: `Direct market supply offer for ${data.marketName}. Grade ${data.grade}. ${data.notes || ''}`,
        harvestDate: new Date().toISOString().split('T')[0],
        status: 'REQUEST RECEIVED',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        editHistory: [],
      };
      setCrops(prev => [createdCrop, ...prev]);
      referencedCrop = createdCrop;
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1-hour response rule

    const targetMarket = markets.find(m => m.id === data.marketId);
    const buyerId = targetMarket?.verifiedBuyerIds[0] || 'user_buyer_1';

    const newRequest: CropRequest = {
      id: `req_supply_${Date.now()}`,
      cropId: linkedCropId || 'crop_generic',
      cropName: data.cropName,
      grade: data.grade,
      farmerId: currentUser?.id || 'user_farmer_1',
      farmerName: data.farmerName,
      farmerPhone: data.phone || currentUser?.phone || '9848012345',
      farmerLocation: data.location,
      buyerId,
      buyerName: `${data.marketName} Procurement Desk`,
      buyerPhone: targetMarket?.contactNumber || '9440167890',
      buyerMarketName: data.marketName,
      buyerVerified: true,
      requestedQuantity: data.quantity,
      offeredPrice: data.expectedPrice,
      notes: data.notes,
      createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: expiry.toISOString(),
      status: 'PENDING',
      sourceType: 'FARMER_SUPPLY_OFFER',
      marketId: data.marketId,
    };

    setRequests(prev => [newRequest, ...prev]);

    // Send notification to farmer
    addNotification({
      userId: currentUser?.id || 'user_farmer_1',
      title: 'Supply Request Submitted',
      titleTelugu: 'మార్కెట్‌కు పంట సరఫరా అభ్యర్థన పంపబడింది',
      message: `Your supply request for ${data.quantity} kg of ${data.cropName} (Grade ${data.grade}) @ ₹${data.expectedPrice}/kg has been sent to ${data.marketName}. ⏱ Market should respond within 1 hour.`,
      messageTelugu: `${data.marketName} మార్కెట్‌కు ${data.quantity} కిలోల ${data.cropName} సరఫరా అభ్యర్థన పంపబడింది.`,
      type: 'NEW_REQUEST',
      relatedId: newRequest.id,
    });

    // Also send notification to buyer
    addNotification({
      userId: buyerId,
      title: 'New Farmer Supply Offer',
      titleTelugu: 'కొత్త రైతు పంట సరఫరా ప్రతిపాదన',
      message: `${data.farmerName} from ${data.location} offered to supply ${data.quantity} kg of ${data.cropName} (Grade ${data.grade}) @ ₹${data.expectedPrice}/kg.`,
      messageTelugu: `${data.farmerName} ${data.quantity} కిలోల ${data.cropName} సరఫరా చేయడానికి సిద్ధంగా ఉన్నారు.`,
      type: 'NEW_REQUEST',
      relatedId: newRequest.id,
    });

    // Create chat conversation
    getOrCreateConversation(currentUser?.id || 'user_farmer_1', buyerId, linkedCropId || 'crop_generic');

    return { success: true, request: newRequest };
  };

  const acceptCropRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const crop = crops.find(c => c.id === req.cropId);
    if (!crop) return { success: false, error: 'Referenced crop not found' };

    // Ensure available remaining quantity still exists
    if (req.requestedQuantity > crop.remainingQuantity) {
      return {
        success: false,
        error: `Insufficient remaining quantity. Available: ${crop.remainingQuantity} kg, Requested: ${req.requestedQuantity} kg.`,
      };
    }

    // Calculate new pre-booked and remaining quantities
    const newPreBooked = crop.preBookedQuantity + req.requestedQuantity;
    const newRemaining = Math.max(0, crop.totalQuantity - newPreBooked - crop.soldQuantity);
    const newStatus = newRemaining === 0 ? 'PRE-BOOKED' : 'PRE-BOOKED';

    // Update crop
    setCrops(prev =>
      prev.map(c => {
        if (c.id === crop.id) {
          return {
            ...c,
            preBookedQuantity: newPreBooked,
            remainingQuantity: newRemaining,
            status: newStatus,
            updatedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return c;
      })
    );

    // Update request
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'ACCEPTED' } : r))
    );

    // Create Deal
    const dealNumber = `RYS-DEAL-${Math.floor(10000 + Math.random() * 90000)}`;
    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      dealNumber,
      cropId: crop.id,
      cropName: crop.cropName,
      grade: crop.grade,
      quantity: req.requestedQuantity,
      agreedPrice: req.offeredPrice,
      totalAmount: req.requestedQuantity * req.offeredPrice,
      farmerId: crop.farmerId,
      farmerName: crop.farmerName,
      farmerPhone: crop.farmerPhone,
      farmerLocation: crop.location,
      buyerId: req.buyerId,
      buyerName: req.buyerName,
      buyerPhone: req.buyerPhone,
      buyerMarket: req.buyerMarketName,
      requestId: req.id,
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'CONFIRMED',
    };

    setDeals(prev => [newDeal, ...prev]);

    // Send chat confirmation message
    const convId = getOrCreateConversation(crop.farmerId, req.buyerId, crop.id);
    sendMessage(
      convId,
      `🤝 Deal Confirmed! Deal No: ${dealNumber}. Pre-booked ${req.requestedQuantity} kg @ ₹${req.offeredPrice}/kg. Total: ₹${newDeal.totalAmount.toLocaleString('en-IN')}.`,
      crop.id,
      newDeal.id
    );

    // Notify Buyer
    addNotification({
      userId: req.buyerId,
      title: 'Booking Request Accepted!',
      titleTelugu: 'కొనుగోలు అభ్యర్థన ఆమోదించబడింది!',
      message: `Farmer ${crop.farmerName} accepted your booking for ${req.requestedQuantity} kg of ${crop.cropName}. Deal confirmed!`,
      messageTelugu: `రైతు ${crop.farmerName} మీ ${req.requestedQuantity} కిలోల ${crop.cropName} బుకింగ్‌ను ఆమోదించారు. డీల్ ఖరారైంది!`,
      type: 'DEAL_CONFIRMED',
      relatedId: newDeal.id,
    });

    return { success: true, deal: newDeal };
  };

  const rejectCropRequest = (requestId: string, reason?: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r))
    );

    addNotification({
      userId: req.buyerId,
      title: 'Request Declined',
      titleTelugu: 'అభ్యర్థన తిరస్కరించబడింది',
      message: `Farmer declined the request for ${req.requestedQuantity} kg of ${req.cropName}. Reason: ${reason || 'Quantity or price unavailable'}`,
      messageTelugu: `రైతు మీ అభ్యర్థనను తిరస్కరించారు. కారణం: ${reason || 'ధర లేదా పరిమాణం సరిపోలలేదు'}`,
      type: 'REQUEST_REJECTED',
      relatedId: req.id,
    });
  };

  const expireCropRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || req.status !== 'PENDING') return;

    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'EXPIRED' } : r))
    );

    const isMarketSupply = req.sourceType === 'FARMER_SUPPLY_OFFER';

    addNotification({
      userId: req.farmerId,
      title: isMarketSupply ? 'Market Request Expired (1h)' : 'Booking Request Expired (24h)',
      titleTelugu: isMarketSupply ? 'మార్కెట్ అభ్యర్థన గడువు ముగిసింది (1 గంట)' : 'కొనుగోలు అభ్యర్థన గడువు ముగిసింది (24 గంటలు)',
      message: isMarketSupply
        ? `Supply request to ${req.buyerMarketName} has expired as the 1-hour market response window elapsed.`
        : `Booking request for ${req.cropName} has expired as the 24-hour response window elapsed.`,
      messageTelugu: isMarketSupply
        ? `${req.buyerMarketName} మార్కెట్ సరఫరా అభ్యర్థన 1 గంట గడువు ముగిసింది.`
        : `${req.cropName} కొనుగోలు అభ్యర్థన 24 గంటల గడువు ముగిసింది.`,
      type: 'REQUEST_EXPIRED',
      relatedId: req.id,
    });
  };

  const resendCropRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'PENDING',
              createdAt: 'Just now',
              createdMinutesAgo: 0,
              rejectionReason: undefined,
            }
          : r
      )
    );

    const isMarketSupply = req.sourceType === 'FARMER_SUPPLY_OFFER';

    addNotification({
      userId: req.farmerId,
      title: isMarketSupply ? 'Market Request Re-sent (1h Window Reset)' : 'Booking Request Re-sent (24h Window Reset)',
      titleTelugu: isMarketSupply ? 'మార్కెట్ అభ్యర్థన మళ్లీ పంపబడింది (1 గం.)' : 'కొనుగోలు అభ్యర్థన మళ్లీ పంపబడింది (24 గం.)',
      message: isMarketSupply
        ? `Supply request for ${req.cropName} re-sent to ${req.buyerMarketName}. 1-hour market response window active!`
        : `${req.buyerName} renewed booking request for ${req.requestedQuantity} kg ${req.cropName} @ ₹${req.offeredPrice}/kg. 24-hour response window active!`,
      messageTelugu: isMarketSupply
        ? `${req.buyerMarketName} మార్కెట్‌కు 1 గంట గడువుతో అభ్యర్థన మళ్లీ పంపబడింది.`
        : `${req.buyerName} ${req.requestedQuantity} కిలోల ${req.cropName} కోసం 24 గంటల గడువుతో అభ్యర్థనను మళ్లీ పంపారు.`,
      type: 'NEW_REQUEST',
      relatedId: req.id,
    });

    return { success: true };
  };

  const getDealById = (dealId: string) => deals.find(d => d.id === dealId);

  // Cancellation Workflow with OTP
  const initiateCancellation = (dealId: string, reason: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return { success: false, otp: '' };

    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const isInitiatorFarmer = currentUser?.role === 'FARMER';
    const otherPartyUserId = isInitiatorFarmer ? deal.buyerId : deal.farmerId;

    const cancellationRec: CancellationRecord = {
      id: `canc_${Date.now()}`,
      dealOrRequestId: dealId,
      cropId: deal.cropId,
      cropName: deal.cropName,
      quantityRestored: deal.quantity,
      initiatedByUserId: currentUser?.id || 'user_1',
      initiatedByRole: currentUser?.role || 'FARMER',
      reason,
      otpCode: generatedOtp,
      otpVerified: false,
      confirmedByOtherParty: false,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_APPROVAL',
    };

    setCancellations(prev => [cancellationRec, ...prev]);

    // Send notification to other party
    addNotification({
      userId: otherPartyUserId,
      title: 'Cancellation Request Initiated',
      titleTelugu: 'డీల్ రద్దు అభ్యర్థన వచ్చింది',
      message: `${currentUser?.name} requested to cancel Deal ${deal.dealNumber}. Reason: "${reason}". Mutual OTP verification required.`,
      messageTelugu: `${currentUser?.name} డీల్ ${deal.dealNumber} రద్దు చేయాలని కోరారు. కారణం: "${reason}". OTP ధృవీకరణ అవసరం.`,
      type: 'CANCELLATION_REQUEST',
      relatedId: cancellationRec.id,
    });

    return { success: true, cancellationId: cancellationRec.id, otp: generatedOtp };
  };

  const confirmCancellationApproval = (cancellationId: string) => {
    setCancellations(prev =>
      prev.map(c => {
        if (c.id === cancellationId) {
          return {
            ...c,
            confirmedByOtherParty: true,
            status: 'AWAITING_OTP',
          };
        }
        return c;
      })
    );
  };

  const verifyCancellationOtp = (cancellationId: string, inputOtp: string) => {
    const record = cancellations.find(c => c.id === cancellationId);
    if (!record) return { success: false, message: 'Cancellation record not found' };

    if (record.otpCode !== inputOtp.trim()) {
      return { success: false, message: 'Invalid OTP code. Please enter the correct 4-digit code.' };
    }

    // 1. Mark cancellation as completed
    const updatedRecord: CancellationRecord = {
      ...record,
      otpVerified: true,
      confirmedByOtherParty: true,
      status: 'COMPLETED',
      cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCancellations(prev => prev.map(c => (c.id === cancellationId ? updatedRecord : c)));

    // 2. Mark Deal as CANCELLED
    setDeals(prev =>
      prev.map(d => (d.id === record.dealOrRequestId ? { ...d, status: 'CANCELLED', cancellationId } : d))
    );

    // 3. RESTORE QUANTITY on the crop
    setCrops(prev =>
      prev.map(crop => {
        if (crop.id === record.cropId) {
          const restoredPreBooked = Math.max(0, crop.preBookedQuantity - record.quantityRestored);
          const restoredRemaining = Math.min(crop.totalQuantity, crop.remainingQuantity + record.quantityRestored);
          const auditHistory = [
            ...crop.editHistory,
            {
              id: `audit_canc_${Date.now()}`,
              timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              field: 'Cancellation Rollback',
              oldValue: `Pre-booked: ${crop.preBookedQuantity} kg`,
              newValue: `Restored ${record.quantityRestored} kg to available pool`,
              changedBy: 'System (Mutual OTP Verified)',
            },
          ];

          return {
            ...crop,
            preBookedQuantity: restoredPreBooked,
            remainingQuantity: restoredRemaining,
            status: restoredRemaining > 0 ? 'ACTIVE' : crop.status,
            editHistory: auditHistory,
          };
        }
        return crop;
      })
    );

    // 4. Send notifications
    addNotification({
      userId: record.initiatedByUserId,
      title: 'Deal Cancelled & Quantity Restored',
      titleTelugu: 'డీల్ రద్దు చేయబడింది & నిల్వ పునరుద్ధరించబడింది',
      message: `Cancellation finalized via OTP. ${record.quantityRestored} kg has been restored to the crop's available inventory.`,
      messageTelugu: `OTP ధృవీకరించబడింది. ${record.quantityRestored} కిలోల పంట తిరిగి అందుబాటులోకి వచ్చింది.`,
      type: 'CANCELLATION_CONFIRMED',
      relatedId: record.id,
    });

    return { success: true, message: 'Deal successfully cancelled and crop quantity restored!' };
  };

  // Chat & Messaging
  const getOrCreateConversation = (farmerId: string, buyerId: string, cropId?: string) => {
    const existing = conversations.find(c => c.farmerId === farmerId && c.buyerId === buyerId);
    if (existing) return existing.id;

    const farmer = INITIAL_USERS.find(u => u.id === farmerId) || { name: 'Farmer' };
    const buyer = INITIAL_USERS.find(u => u.id === buyerId) || { name: 'Buyer' };
    const crop = cropId ? crops.find(c => c.id === cropId) : undefined;

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      farmerId,
      farmerName: farmer.name,
      buyerId,
      buyerName: buyer.name,
      cropId,
      cropName: crop?.cropName,
      lastMessage: 'Conversation started',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCountFarmer: 0,
      unreadCountBuyer: 0,
    };

    setConversations(prev => [newConv, ...prev]);
    return newConv.id;
  };

  const sendMessage = (
    conversationId: string,
    text: string,
    cropReferenceId?: string,
    dealReferenceId?: string,
    isAudio?: boolean
  ) => {
    if (!text.trim() && !isAudio) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser?.id || 'user_1',
      senderRole: currentUser?.role || 'FARMER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cropReferenceId,
      dealReferenceId,
      isAudio,
    };

    setMessages(prev => [...prev, newMsg]);

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: isAudio ? '🎤 Voice message' : text,
            lastMessageTime: newMsg.timestamp,
          };
        }
        return c;
      })
    );

    // If conversation is with Kisan Mitra AI Bot, generate smart response
    if (conversationId === 'conv_ai_bot' && currentUser?.role === 'FARMER') {
      setTimeout(() => {
        let reply = '';
        const lower = text.toLowerCase();
        if (lower.includes('price') || lower.includes('rate') || lower.includes('ధర')) {
          reply = language === 'te' 
            ? '📊 నేటి మార్కెట్ ధరలు:\n• మదనపల్లె టమాటా గ్రేడ్ A: ₹34/కిలో (అధిక డిమాండ్ 🔥)\n• గుంటూరు తేజా ఎండుమిర్చి: ₹195/కిలో\n• వరంగల్ పత్తి: ₹76/కిలో\nకోలార్ మార్కెట్లో టమాటా ₹35/కిలో నడుస్తోంది.'
            : '📊 Today\'s Mandi Rates:\n• Madanapalle Tomato Grade A: ₹34/kg (High Demand 🔥)\n• Guntur Teja Chilli: ₹195/kg\n• Warangal Cotton: ₹76/kg\nKolar APMC is trading Tomato @ ₹35/kg.';
        } else if (lower.includes('grade') || lower.includes('quality') || lower.includes('నాణ్యత') || lower.includes('గ్రేడ్')) {
          reply = language === 'te'
            ? '⭐ గ్రేడ్ ప్రమాణాలు:\n• గ్రేడ్ A: ఎగుమతి నాణ్యత, ఏకరూప సైజు, దెబ్బతినని పండు, ఎక్కువ నిల్వ సామర్థ్యం.\n• గ్రేడ్ B: మంచి నాణ్యత, స్థానిక మార్కెట్లకు అనువైనది.\n• గ్రేడ్ C: సాధారణ నాణ్యత, గుజ్జు/ప్రాసెసింగ్ ఫ్యాక్టరీలకు కొనుగోలు చేస్తారు.'
            : '⭐ Crop Grade Standards:\n• Grade A: Premium export quality, uniform size, firm fruit, long shelf-life.\n• Grade B: Good standard quality for domestic retail.\n• Grade C: Standard processing quality for ketchup/puree factories.';
        } else if (lower.includes('book') || lower.includes('request') || lower.includes('బుకింగ్') || lower.includes('డీల్')) {
          reply = language === 'te'
            ? '🤝 ప్రీ-బుకింగ్ & సరఫరా నిబంధనలు:\n• రైతు నుండి మార్కెట్‌కు సరఫరా అభ్యర్థన: 1 గంట స్పందన సమయం (1-Hour Rule).\n• రైతు నుండి కొనుగోలుదారుకు బుకింగ్ డీల్: 24 గంటల స్పందన సమయం (24-Hour Rule).'
            : '🤝 Pre-Booking & Supply Guidelines:\n• Farmer to Market supply request has a 1-hour response window.\n• Farmer to Buyer booking request has a 24-hour response window.';
        } else {
          reply = language === 'te'
            ? `నమస్కారం ${currentUser.name} గారు! మీ సందేశం తెలిసింది. మీకు ఏ పంట మార్కెట్ సమాచారం లేదా గ్రేడింగ్ సలహా కావాలో అడగండి.`
            : `Namaste ${currentUser.name}! I am here to assist with daily APMC rates, crop grading standards, buyer negotiation tips, and transport.`;
        }

        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          conversationId: 'conv_ai_bot',
          senderId: 'bot_kisan_mitra',
          senderRole: 'BUYER',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cropReferenceId: 'crop_1',
        };

        setMessages(mPrev => [...mPrev, botMsg]);
        setConversations(cPrev =>
          cPrev.map(c =>
            c.id === 'conv_ai_bot'
              ? { ...c, lastMessage: reply, lastMessageTime: botMsg.timestamp }
              : c
          )
        );
      }, 700);
    }
  };

  // Notifications
  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(
    n => !n.read && (n.userId === currentUser?.id || n.userId === 'all')
  ).length;

  // Voice Assistant TTS
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsAudioSpeaking(true);
    utterance.onend = () => setIsAudioSpeaking(false);
    utterance.onerror = () => setIsAudioSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioSpeaking(false);
  };

  // 8-Minute Market Timer & Cycle System Engine (Requirement 3)
  const triggerMarketCycleUpdate = () => {
    const nextCycle = marketCycleCount + 1;
    setMarketCycleCount(nextCycle);
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastMarketCycleAt(nowTimeStr);
    setMarketTimerSecondsLeft(MARKET_CYCLE_DURATION_SECONDS);

    const result = execute8MinuteMarketCycle(markets, nextCycle, language);

    setMarkets(result.updatedMarkets);
    setInwardArrivals(prev => [...result.newArrivals, ...prev].slice(0, 20));
    setMarketCycleEvents(prev => [...result.newEvents, ...prev].slice(0, 30));

    // Synchronize farmer crops benchmark market buying price with updated market prices
    // NOTE: Strictly respect rule: "the prices only changed by only market not by farmer"
    // Farmer's own crop asking price (expectedPrice) is NEVER mutated!
    setCrops(prevCrops =>
      prevCrops.map(crop => {
        const matchingMkt = result.updatedMarkets.find(m =>
          m.cropsRequired.some(r => r.cropName.toLowerCase().includes(crop.cropCategory.toLowerCase()))
        );
        const req = matchingMkt?.cropsRequired.find(r =>
          r.cropName.toLowerCase().includes(crop.cropCategory.toLowerCase())
        );
        if (req) {
          return {
            ...crop,
            currentMarketBuyingPrice: req.buyingPrice,
          };
        }
        return crop;
      })
    );

    // Send in-app notification
    addNotification({
      userId: currentUser?.id || 'all',
      title: '⏱️ 8-Min Mandi Rate & Inward Refresh',
      titleTelugu: '⏱️ 8 నిమిషాల మార్కెట్ ధరలు & దిగుమతులు అప్‌డేట్',
      message: result.summaryMessage,
      messageTelugu: result.summaryMessageTelugu,
      type: 'MARKET_ALERT',
    });
  };

  const toggleMarketTimer = () => {
    setIsMarketTimerActive(prev => !prev);
  };

  // 1-Second Interval Ticker for 8-Minute Countdown
  useEffect(() => {
    if (!isMarketTimerActive) return;

    const interval = setInterval(() => {
      setMarketTimerSecondsLeft(prev => {
        if (prev <= 1) {
          // Timer reached 0: execute 8-minute cycle update!
          triggerMarketCycleUpdate();
          return MARKET_CYCLE_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMarketTimerActive, marketCycleCount, markets, language, currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        hasDownloadedApp,
        loginUser,
        logoutUser,
        resetDownloadOnboarding,
        switchRole,
        language,
        setLanguage,
        t,
        crops,
        addCrop,
        updateCrop,
        deleteCrop,
        markCropSold,
        getCropById,
        markets,
        getMarketById,
        toggleFollowMarket,
        addMarketRequirement,
        requests,
        createCropRequest,
        submitMarketSupplyRequest,
        acceptCropRequest,
        rejectCropRequest,
        expireCropRequest,
        resendCropRequest,
        deals,
        getDealById,
        cancellations,
        initiateCancellation,
        confirmCancellationApproval,
        verifyCancellationOtp,
        conversations,
        messages,
        sendMessage,
        getOrCreateConversation,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        marketTimerSecondsLeft,
        marketTimerTotalSeconds: MARKET_CYCLE_DURATION_SECONDS,
        isMarketTimerActive,
        toggleMarketTimer,
        marketCycleCount,
        lastMarketCycleAt,
        marketCycleEvents,
        inwardArrivals,
        triggerMarketCycleUpdate,
        activeTab,
        setActiveTab,
        isAudioSpeaking,
        speakText,
        stopSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
