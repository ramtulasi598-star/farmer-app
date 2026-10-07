import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  Mic,
  ArrowLeft,
  FileText,
  Search,
  Bot,
  User,
  Building2,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';

interface CommunicationPageProps {
  initialConversationId?: string;
  onViewDealSlip: (dealId: string) => void;
  onViewCrop: (cropId: string) => void;
}

export const CommunicationPage: React.FC<CommunicationPageProps> = ({
  initialConversationId,
  onViewDealSlip,
  onViewCrop,
}) => {
  const {
    currentUser,
    conversations,
    messages,
    sendMessage,
    crops,
    deals,
    t,
    language,
    speakText,
  } = useApp();

  // If initialConversationId is passed, open that chat directly, otherwise show inbox
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState<'ALL' | 'BUYERS' | 'BOT'>('ALL');
  const [inputText, setInputText] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConvId);
  const activeMessages = messages.filter(m => m.conversationId === activeConvId);

  // Filter conversations for the inbox
  const filteredConversations = conversations.filter(c => {
    const isBot = c.buyerId === 'bot_kisan_mitra';
    const matchesSearch =
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cropName && c.cropName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (chatFilter === 'BOT') return isBot;
    if (chatFilter === 'BUYERS') return !isBot;
    return true;
  });

  // Attached crop and deal for current open conversation
  const attachedCrop = activeConversation?.cropId
    ? crops.find(c => c.id === activeConversation.cropId)
    : undefined;
  const attachedDeal = deals.find(d => d.cropId === activeConversation?.cropId);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId) return;

    sendMessage(
      activeConvId,
      text,
      activeConversation?.cropId,
      attachedDeal?.id
    );
    setInputText('');
  };

  const handleSendVoiceNote = () => {
    setIsRecordingAudio(true);
    setTimeout(() => {
      setIsRecordingAudio(false);
      sendMessage(
        activeConvId || 'conv_1',
        '🎤 Voice Message (0:14s): "Namaste, vehicle will arrive at farm gate around 6:30 AM."',
        activeConversation?.cropId,
        undefined,
        true
      );
    }, 1100);
  };

  const isBotChat = activeConversation?.buyerId === 'bot_kisan_mitra';

  const BOT_SUGGESTIONS = [
    language === 'te' ? 'నేటి టమాటా & మిర్చి ధరలు' : "Today's Mandi Rates",
    language === 'te' ? 'గ్రేడ్ A నాణ్యత ఎలా పొందాలి?' : 'Grade A Quality Tips',
    language === 'te' ? 'ప్రీ-బుకింగ్ నిబంధనలు' : 'Pre-booking Guidelines',
    language === 'te' ? 'రవాణా వాహన సలహాలు' : 'Transport & Cold Storage',
  ];

  const BUYER_PHRASES = [
    t('phraseNegotiable'),
    t('phraseInspection'),
    t('phraseTransport'),
    t('phraseMoisture'),
  ];

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* =========================================================================
          VIEW A: CHATS INBOX / LIST OF CHATS (When no conversation is open)
          ========================================================================= */}
      {!activeConversation ? (
        <div className="flex-1 flex flex-col space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>💬</span>
                <span>{language === 'te' ? 'సంభాషణలు & సహాయకుడు' : 'Messages & Chatbot'}</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {language === 'te'
                  ? 'కొనుగోలుదారులతో చాట్ చేయండి మరియు కిసాన్ మిత్ర AI ని అడగండి'
                  : 'Select any chat to view full conversation history'}
              </p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              {conversations.length} Active
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'te' ? 'చాట్‌లు లేదా కొనుగోలుదారులలో వెతకండి...' : 'Search chats, buyers, or crops...'}
              className="w-full pl-10 pr-9 py-2.5 bg-stone-900 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setChatFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                chatFilter === 'ALL'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              All Chats ({conversations.length})
            </button>
            <button
              onClick={() => setChatFilter('BUYERS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                chatFilter === 'BUYERS'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              🏢 Buyers & Mandis ({conversations.filter(c => c.buyerId !== 'bot_kisan_mitra').length})
            </button>
            <button
              onClick={() => setChatFilter('BOT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                chatFilter === 'BOT'
                  ? 'bg-amber-400 text-stone-950 shadow-md'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              🤖 Kisan AI Bot (1)
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
            {filteredConversations.length === 0 ? (
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-stone-500 mx-auto" />
                <p className="text-xs text-stone-400">No chats found matching your search.</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isBot = conv.buyerId === 'bot_kisan_mitra';
                const unread = currentUser?.role === 'FARMER' ? conv.unreadCountFarmer : conv.unreadCountBuyer;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3.5 rounded-3xl border transition cursor-pointer flex items-center justify-between gap-3 shadow-md ${
                      isBot
                        ? 'bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border-amber-500/50 hover:border-amber-400'
                        : 'bg-stone-900 border-stone-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                          isBot
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isBot ? '🤖' : '🏢'}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs truncate">
                            {currentUser?.role === 'FARMER' ? conv.buyerName : conv.farmerName}
                          </h4>
                          {isBot && (
                            <span className="bg-amber-400 text-stone-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                              AI BOT
                            </span>
                          )}
                        </div>

                        {/* Crop Tag Pill */}
                        {conv.cropName && (
                          <span className="text-[10px] text-emerald-400 font-semibold truncate block mt-0.5">
                            🏷️ {conv.cropName}
                          </span>
                        )}

                        {/* Latest Message Preview */}
                        <p className="text-[11px] text-stone-400 truncate mt-0.5 line-clamp-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp & Unread Badge */}
                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[10px] text-stone-500 font-mono block">
                        {conv.lastMessageTime}
                      </span>
                      {unread > 0 && (
                        <span className="inline-flex items-center justify-center bg-emerald-500 text-stone-950 font-bold text-[10px] w-4 h-4 rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW B: OPEN CHAT CONVERSATION DETAIL & HISTORY
           ========================================================================= */
        <div className="flex-1 flex flex-col bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* 1. DETAIL HEADER */}
          <div className="p-3 border-b border-stone-800 bg-stone-950/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Back to Inbox Button */}
                <button
                  onClick={() => setActiveConvId(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
                  title="Back to all chats"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Chats</span>
                </button>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold border ${
                      isBotChat
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isBotChat ? '🤖' : '🏢'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-none">
                      {currentUser?.role === 'FARMER'
                        ? activeConversation.buyerName
                        : activeConversation.farmerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{isBotChat ? 'Automated Mandi Bot' : 'Direct Trader Chat'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {!isBotChat && (
                  <button
                    onClick={() => alert(`Connecting phone call to ${activeConversation.buyerName}...`)}
                    className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700"
                    title="Call"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Attached Crop Reference Pill */}
            {attachedCrop && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px]">
                <div
                  onClick={() => onViewCrop(attachedCrop.id)}
                  className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition"
                >
                  <img
                    src={attachedCrop.photos[0]}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-bold text-white truncate block">{attachedCrop.cropName}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Grade {attachedCrop.grade} • ₹{attachedCrop.expectedPrice}/kg • {attachedCrop.remainingQuantity} kg available
                    </span>
                  </div>
                </div>

                {attachedDeal && (
                  <button
                    onClick={() => onViewDealSlip(attachedDeal.id)}
                    className="py-1 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1 shrink-0 ml-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Deal Slip</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. MESSAGES HISTORY STREAM */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {activeMessages.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-1">
                <p>No messages in this chat yet.</p>
                <p className="text-[11px]">Send a message below to start chatting!</p>
              </div>
            ) : (
              activeMessages.map(msg => {
                const isMine = msg.senderId === currentUser?.id;
                const isBot = msg.senderId === 'bot_kisan_mitra';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 space-y-1 shadow-md ${
                        isMine
                          ? 'bg-emerald-700 text-white rounded-br-none'
                          : isBot
                          ? 'bg-stone-800 text-amber-200 rounded-bl-none border border-amber-500/30'
                          : 'bg-stone-800 text-stone-200 rounded-bl-none border border-stone-700'
                      }`}
                    >
                      {/* Deal Reference inside message */}
                      {msg.dealReferenceId && (
                        <div className="p-2 rounded-xl bg-black/30 border border-white/20 text-[10px] mb-1">
                          <span className="font-bold text-amber-300 block">🤝 Contract Generated</span>
                          <span className="opacity-90">Agricultural deal recorded in system.</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                      <div className="flex items-center justify-between text-[9px] pt-0.5 opacity-80 font-mono">
                        <span>{isMine ? 'You' : isBot ? '🤖 Kisan Bot' : 'Buyer'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. QUICK CHAT PHRASES & BOT SUGGESTIONS */}
          <div className="px-3 py-1.5 bg-stone-950/80 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(isBotChat ? BOT_SUGGESTIONS : BUYER_PHRASES).map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(phrase)}
                className="px-2.5 py-1 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-750 text-[10px] whitespace-nowrap transition cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* 4. MESSAGE INPUT BAR */}
          <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
            <button
              onClick={handleSendVoiceNote}
              disabled={isRecordingAudio}
              className={`p-2.5 rounded-2xl transition ${
                isRecordingAudio
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-stone-850 text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="Send Voice Message"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={isBotChat ? 'Ask Kisan Bot about prices or crops...' : t('typeMessage')}
              className="flex-1 px-3.5 py-2.5 bg-stone-850 border border-stone-750 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-stone-950 font-bold transition shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
