import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCheck, Bell, TrendingUp, AlertCircle, ShoppingCart, MessageSquare, ShieldAlert } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRelated?: (notif: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectRelated,
}) => {
  const {
    notifications,
    currentUser,
    language,
    markNotificationRead,
    markAllNotificationsRead,
    t,
  } = useApp();

  if (!isOpen) return null;

  const userNotifications = notifications.filter(
    n => n.userId === currentUser?.id || n.userId === 'all'
  );

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'NEW_REQUEST':
      case 'PRE_BOOKED':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'PRICE_UPDATE':
      case 'MARKET_ALERT':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case 'DEAL_CONFIRMED':
        return <CheckCheck className="w-4 h-4 text-emerald-300" />;
      case 'CANCELLATION_REQUEST':
      case 'CANCELLATION_CONFIRMED':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="bg-stone-900 border-l border-stone-800 w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-none">{t('notifications')}</h3>
              <span className="text-[11px] text-stone-400">
                {userNotifications.filter(n => !n.read).length} unread
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsRead}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs transition"
              title={t('markAllRead')}
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {userNotifications.length === 0 ? (
            <div className="py-16 text-center text-stone-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            userNotifications.map(notif => {
              const title = language === 'te' && notif.titleTelugu ? notif.titleTelugu : notif.title;
              const msg = language === 'te' && notif.messageTelugu ? notif.messageTelugu : notif.message;

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (onSelectRelated) onSelectRelated(notif);
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    notif.read
                      ? 'bg-stone-800/40 border-stone-800/80 text-stone-300'
                      : 'bg-stone-800 border-emerald-500/40 text-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{title}</h4>
                        <span className="text-[10px] text-stone-500 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                        {msg}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
