import React, { useMemo, useState } from 'react';
import {
  Bell,
  Truck,
  TrendingUp,
  Recycle,
  ShieldAlert,
  Settings as SettingsIcon,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import { AppNotification, Language } from '../../types';
import { makeL } from '../../utils/i18n';

interface NotificationsViewProps {
  language: Language;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const TYPE_META: Record<
  AppNotification['type'],
  { icon: React.ElementType; className: string }
> = {
  pickup: { icon: Truck, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  price: { icon: TrendingUp, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  recycler: { icon: Recycle, className: 'bg-teal-50 text-teal-700 border-teal-200' },
  safety: { icon: ShieldAlert, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  system: { icon: SettingsIcon, className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  language,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const L = makeL(language);
  const [filter, setFilter] = useState<'all' | 'unread' | AppNotification['type']>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'all', label: L('All', 'सभी', 'सर्व') },
    { id: 'unread', label: L('Unread', 'बिना पढ़े', 'न वाचलेले') },
    { id: 'pickup', label: L('Pickups', 'पिकअप', 'पिकअप') },
    { id: 'price', label: L('Prices', 'भाव', 'दर') },
    { id: 'recycler', label: L('Recycler', 'रीसाइक्लर', 'रीसायकलर') },
    { id: 'safety', label: L('Safety', 'सुरक्षा', 'सुरक्षा') },
  ];

  const textOf = (n: AppNotification) => ({
    title: language === 'en' ? n.title : n.titleHi,
    message: language === 'en' ? n.message : n.messageHi,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                {L('Notifications', 'सूचनाएं', 'सूचना')}
              </h1>
              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? L(
                      `${unreadCount} unread update(s)`,
                      `${unreadCount} नई सूचनाएं`,
                      `${unreadCount} नवीन सूचना`
                    )
                  : L('You are all caught up', 'सब पढ़ लिया गया है', 'सर्व वाचले आहे')}
              </p>
            </div>
          </div>

          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors self-start"
          >
            <CheckCheck className="w-4 h-4" />
            {L('Mark all read', 'सभी पढ़ा हुआ करें', 'सर्व वाचले म्हणून खूण करा')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                filter === f.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              {L('Nothing here yet', 'यहां अभी कुछ नहीं है', 'येथे अद्याप काही नाही')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {L(
                'New pickup, price and recycler alerts will appear here.',
                'नए पिकअप, भाव और रीसाइक्लर की सूचनाएं यहां दिखेंगी।',
                'नवीन पिकअप, दर व रीसायकलर सूचना येथे दिसतील.'
              )}
            </p>
          </div>
        )}

        {filtered.map((n) => {
          const meta = TYPE_META[n.type] || TYPE_META.system;
          const Icon = meta.icon;
          const { title, message } = textOf(n);
          return (
            <button
              key={n.id}
              onClick={() => onMarkAsRead(n.id)}
              className={`w-full text-left p-4 flex items-start gap-3.5 hover:bg-slate-50/80 transition-colors ${
                !n.read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.className}`}
              >
                <Icon className="w-4 h-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    {title}
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.timeAgo}</span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">{message}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
