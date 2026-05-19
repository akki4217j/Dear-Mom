import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, Heart, CheckSquare, Wind, LayoutGrid, FileText, MapPin, MessageCircle, Gamepad2, BookHeart, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const [showMore, setShowMore] = useState(false);

  const isActive = (path) => location.pathname === path;

  const momTabs = [
    { icon: House, label: 'Home', path: '/mom/dashboard' },
    { icon: Heart, label: 'Mood', path: '/mom/mood' },
    { icon: CheckSquare, label: 'Tasks', path: '/mom/tasks' },
    { icon: Wind, label: 'Relax', path: '/mom/relax' },
    { icon: LayoutGrid, label: 'More', path: 'more' },
  ];

  const partnerTabs = [
    { icon: House, label: 'Home', path: '/partner/dashboard' },
    { icon: Gamepad2, label: 'Games', path: '/partner/games' },
    { icon: BookHeart, label: 'Memory', path: '/partner/memory' },
  ];

  const moreItems = [
    { icon: FileText, label: 'Report', path: '/mom/report', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: MapPin, label: 'Doctor', path: '/mom/doctor', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: MessageCircle, label: 'Ask Me', path: '/mom/askme', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Gamepad2, label: 'Games', path: '/mom/games', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: BookHeart, label: 'Memory', path: '/mom/memory', color: 'text-pink-500', bg: 'bg-pink-50' },
  ];

  const tabs = role === 'partner' ? partnerTabs : momTabs;

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-semibold text-gray-800">More Features</h3>
              <button onClick={() => setShowMore(false)} className="p-1 hover:bg-rose-50 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setShowMore(false);
                    navigate(item.path);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${item.bg} hover:scale-105 transition-transform`}
                >
                  <item.icon size={22} className={item.color} />
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-rose-100 shadow-[0_-4px_20px_rgba(244,63,94,0.06)]">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-2 px-2">
          {tabs.map((tab) => {
            const active = tab.path === 'more' ? showMore : isActive(tab.path);
            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.path === 'more') {
                    setShowMore(!showMore);
                  } else {
                    setShowMore(false);
                    navigate(tab.path);
                  }
                }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
                  active
                    ? 'text-rose-500 bg-rose-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                id={`nav-${tab.label.toLowerCase()}`}
              >
                <tab.icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${active ? 'text-rose-500' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area for iPhones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default BottomNav;
