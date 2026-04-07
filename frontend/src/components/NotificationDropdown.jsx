import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { FiBell, FiCheck, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FiBell className="text-primary-600" /> Notifications
        </h3>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiBell className="text-slate-300" size={24} />
            </div>
            <p className="text-sm text-slate-400 font-medium">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-primary-50/30' : ''}`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                )}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'alert' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {notif.type === 'alert' ? <FiAlertCircle size={16} /> : <FiInfo size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <button 
          onClick={onClose}
          className="text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
