import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CircleCheck, CircleX } from 'lucide-react';
import { api } from '../api/client';

const TYPE_ICON = {
  info: { Icon: Info, cls: 'text-sky-500 bg-sky-50' },
  success: { Icon: CircleCheck, cls: 'text-emerald-500 bg-emerald-50' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-500 bg-amber-50' },
  error: { Icon: CircleX, cls: 'text-rose-500 bg-rose-50' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d} j`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifs = useCallback(() => {
    api
      .get('/notifications')
      .then((res) => {
        setItems(res.data || []);
        setUnread(res.unreadCount || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      fetchNotifs();
    }
  };

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api.patch('/notifications/read-all');
    } catch {
      fetchNotifs();
    }
  };

  const handleClick = (n) => {
    if (!n.read) markRead(n._id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <div className="relative ml-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-odc-black" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-odc-orange rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-black text-sm text-odc-black">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="flex items-center gap-1 text-[11px] font-bold text-odc-orange hover:text-odc-black transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">Aucune notification</p>
              </div>
            ) : (
              items.map((n) => {
                const meta = TYPE_ICON[n.type] || TYPE_ICON.info;
                const { Icon } = meta;
                return (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      n.read ? '' : 'bg-orange-50/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.cls}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${n.read ? 'font-medium text-gray-600' : 'font-black text-odc-black'}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-odc-orange flex-shrink-0" />}
                      </div>
                      {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    {!n.read && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n._id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            markRead(n._id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-emerald-500 transition-colors self-start cursor-pointer"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
