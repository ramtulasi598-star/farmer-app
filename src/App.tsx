import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LanguageModal } from './components/LanguageModal';
import { DealSlipModal } from './components/DealSlipModal';
import { CancellationModal } from './components/CancellationModal';
import { CropVideoModal } from './components/CropVideoModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { FarmerHomePage } from './pages/FarmerHomePage';
import { BuyerHomePage } from './pages/BuyerHomePage';
import { MarketsPage } from './pages/MarketsPage';
import { MarketDetailPage } from './pages/MarketDetailPage';
import { AddCropPage } from './pages/AddCropPage';
import { CropDetailPage } from './pages/CropDetailPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { ProfilePage } from './pages/ProfilePage';
import { Smartphone, Monitor } from 'lucide-react';
import { Crop, Deal } from './types';

function MainApp() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    getDealById,
    crops,
    deals,
  } = useApp();

  // Navigation states
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(undefined);
  const [cancellationDealId, setCancellationDealId] = useState<string | null>(null);
  const [videoModalCrop, setVideoModalCrop] = useState<Crop | null>(null);

  // Drawers & Modals
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Desktop view toggle: mobile framed vs full-width
  const [isMobileFramed, setIsMobileFramed] = useState(true);

  // If user is not logged in, show Auth / Welcome flow
  if (!currentUser) {
    return <AuthPage onLoginSuccess={() => setActiveTab('home')} />;
  }

  const activeDeal = selectedDealId ? getDealById(selectedDealId) || null : null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-start antialiased selection:bg-emerald-500 selection:text-white">
      {/* Device Mode Switcher (Desktop utility banner) */}
      <aside aria-label="Device view options" className="hidden lg:flex w-full bg-stone-900 border-b border-stone-800 text-[11px] text-stone-400 py-1 px-4 items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-stone-300">RythuSetu Mobile Framework Active</span>
          <span>•</span>
          <span>Role: <strong className="text-white">{currentUser.role} ({currentUser.name})</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFramed(!isMobileFramed)}
            className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-2 py-0.5 rounded text-[11px] transition font-medium"
          >
            {isMobileFramed ? <Monitor className="w-3 h-3 text-emerald-400" /> : <Smartphone className="w-3 h-3 text-emerald-400" />}
            <span>{isMobileFramed ? 'Full Responsive View' : 'Mobile Frame Preview'}</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full min-h-screen flex flex-col relative transition-all duration-200 ${
          isMobileFramed
            ? 'max-w-md lg:my-4 lg:min-h-[92vh] lg:max-h-[95vh] lg:rounded-[40px] lg:border-[8px] lg:border-stone-800 lg:shadow-2xl lg:shadow-emerald-950/40 lg:overflow-y-auto no-scrollbar bg-stone-950'
            : 'max-w-2xl bg-stone-950'
        }`}
      >
        {/* Mobile Device Status Bar (When framed) */}
        {isMobileFramed && (
          <header className="hidden lg:flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-stone-400 select-none bg-stone-900/80">
            <span>09:41</span>
            <div className="w-24 h-4 bg-stone-950 rounded-full mx-auto"></div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </header>
        )}

        {/* Global Navbar */}
        <Navbar
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onSelectLanguage={() => setIsLanguageModalOpen(true)}
        />

        {/* Main Body Routing */}
        <main className="flex-1 overflow-x-hidden">
          {/* Detail Views Overlay precedence */}
          {selectedCropId ? (
            <CropDetailPage
              cropId={selectedCropId}
              onBack={() => setSelectedCropId(null)}
              onOpenVideoModal={() => {
                const c = crops.find(item => item.id === selectedCropId);
                if (c) setVideoModalCrop(c);
              }}
              onNavigateToChat={(buyerId) => {
                setSelectedCropId(null);
                setActiveTab('communication');
              }}
              onViewDeal={(dealId) => setSelectedDealId(dealId)}
            />
          ) : selectedMarketId ? (
            <MarketDetailPage
              marketId={selectedMarketId}
              onBack={() => setSelectedMarketId(null)}
              onSendCropToMarket={() => {
                setSelectedMarketId(null);
                setActiveTab('add_crop');
              }}
            />
          ) : (
            <>
              {/* Tab 1: HOME */}
              {activeTab === 'home' && (
                currentUser.role === 'FARMER' ? (
                  <FarmerHomePage
                    onNavigateToCrop={(id) => setSelectedCropId(id)}
                    onNavigateToMarket={(id) => setSelectedMarketId(id)}
                    onNavigateToAddCrop={() => setActiveTab('add_crop')}
                    onOpenVideoModal={(crop) => setVideoModalCrop(crop)}
                  />
                ) : (
                  <BuyerHomePage
                    onNavigateToCrop={(id) => setSelectedCropId(id)}
                    onNavigateToChatWithFarmer={(farmerId, cropId) => {
                      setActiveTab('communication');
                    }}
                    onOpenVideoModal={(crop) => setVideoModalCrop(crop)}
                  />
                )
              )}

              {/* Tab 2: MARKETS */}
              {activeTab === 'markets' && (
                <MarketsPage onSelectMarket={(id) => setSelectedMarketId(id)} />
              )}

              {/* Tab 3: ADD CROP (Farmer) or REQUIREMENTS (Buyer) */}
              {(activeTab === 'add_crop' || activeTab === 'requirements') && (
                currentUser.role === 'FARMER' ? (
                  <AddCropPage
                    onSuccess={(newId) => {
                      setSelectedCropId(newId);
                      setActiveTab('home');
                    }}
                    onCancel={() => setActiveTab('home')}
                  />
                ) : (
                  <BuyerHomePage
                    onNavigateToCrop={(id) => setSelectedCropId(id)}
                    onNavigateToChatWithFarmer={() => setActiveTab('communication')}
                    onOpenVideoModal={(crop) => setVideoModalCrop(crop)}
                  />
                )
              )}

              {/* Tab 4: COMMUNICATION / CHAT */}
              {activeTab === 'communication' && (
                <CommunicationPage
                  initialConversationId={selectedConvId}
                  onViewDealSlip={(dealId) => setSelectedDealId(dealId)}
                  onViewCrop={(cropId) => setSelectedCropId(cropId)}
                />
              )}

              {/* Tab 5: PROFILE */}
              {activeTab === 'profile' && (
                <ProfilePage
                  onSelectLanguage={() => setIsLanguageModalOpen(true)}
                  onNavigateToCrop={(id) => setSelectedCropId(id)}
                  onNavigateToMarket={(id) => setSelectedMarketId(id)}
                  onViewDealSlip={(id) => setSelectedDealId(id)}
                />
              )}
            </>
          )}
        </main>

        {/* Global Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={(tab) => {
          setSelectedCropId(null);
          setSelectedMarketId(null);
          setSelectedConvId(undefined);
          setActiveTab(tab);
        }} />

        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          onSelectRelated={(notif) => {
            setIsNotificationOpen(false);
            if (notif.relatedId?.startsWith('crop_')) {
              setSelectedCropId(notif.relatedId);
            } else if (notif.relatedId?.startsWith('mkt_')) {
              setSelectedMarketId(notif.relatedId);
            } else if (notif.relatedId?.startsWith('deal_')) {
              setSelectedDealId(notif.relatedId);
            }
          }}
        />

        {/* Language Modal */}
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />

        {/* Deal Slip Modal */}
        <DealSlipModal
          deal={activeDeal}
          onClose={() => setSelectedDealId(null)}
          onRequestCancellation={(dealId) => {
            setSelectedDealId(null);
            setCancellationDealId(dealId);
          }}
        />

        {/* Cancellation Flow Modal with OTP */}
        {cancellationDealId && (
          <CancellationModal
            dealId={cancellationDealId}
            onClose={() => setCancellationDealId(null)}
            onSuccess={() => {
              setCancellationDealId(null);
            }}
          />
        )}

        {/* Crop Video Inspection Modal */}
        <CropVideoModal
          crop={videoModalCrop}
          onClose={() => setVideoModalCrop(null)}
          onRequestClick={(c) => {
            setSelectedCropId(c.id);
            setVideoModalCrop(null);
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
