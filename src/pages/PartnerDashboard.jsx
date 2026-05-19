import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDueDateInfo, getBabySize, getGreeting } from '../utils/pregnancyUtils';
import partnerTips from '../data/partnerTips';
import { Star, Heart, Baby, Timer, Gamepad2, BookHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moodAPI } from '../api/api';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = user?.name || 'Partner';
  const { currentWeek, weeksLeft, trimester, daysLeft } = getDueDateInfo(user?.dueDate);
  const babySize = getBabySize(currentWeek);
  const [latestMood, setLatestMood] = useState(null);

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todayTip = partnerTips[dayOfYear % partnerTips.length];

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const res = await moodAPI.getPartnerMoods();
        if (res.data.length > 0) setLatestMood(res.data[0]);
      } catch (err) { console.error(err); }
    };
    fetchMoods();
  }, []);

  const getMoodSuggestion = (mood) => {
    if (!mood) return 'Check in with her today 💕';
    if (mood.value <= 2) return "Maybe give her extra love today 💕";
    if (mood.value >= 4) return "She's having a good day! Share in her joy 🌟";
    return "Be there for her, every day counts 💕";
  };

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 animate-fade-in">
          <p className="text-blue-100 text-sm font-medium">{getGreeting()}</p>
          <h1 className="font-display text-2xl font-bold mt-1">{name} 💪</h1>
          <p className="text-blue-100 text-sm mt-2">You're doing great supporting her</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2"><span className="text-sm font-medium">Week {currentWeek}</span></div>
            <span className="text-blue-100 text-sm">Trimester {trimester}</span>
          </div>
        </div>

        {!user?.linkedPartner && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 animate-fade-in">
            <p className="text-sm text-amber-700 font-medium">💡 Not linked yet</p>
            <p className="text-xs text-amber-600 mt-1">Ask mom for her partner code to link your accounts and share data!</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100 card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0"><Star size={20} className="text-amber-600" /></div>
            <div><h3 className="font-semibold text-gray-800 text-sm mb-1">Support Tip of the Day</h3><p className="text-gray-600 text-sm leading-relaxed">{todayTip}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-3"><Heart size={18} className="text-rose-500" /><h3 className="font-semibold text-gray-800 text-sm">Her Mood</h3></div>
            {latestMood ? (<><p className="text-3xl mb-1">{latestMood.emoji}</p><p className="text-sm text-gray-600">{latestMood.label}</p><p className="text-xs text-gray-400 mt-1">{getMoodSuggestion(latestMood)}</p></>) : (<p className="text-sm text-gray-400">No mood logged yet</p>)}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-3"><Baby size={18} className="text-green-500" /><h3 className="font-semibold text-gray-800 text-sm">Baby</h3></div>
            <p className="text-3xl mb-1">{babySize.emoji}</p>
            <p className="text-xs text-gray-600">{babySize.name}</p>
            <p className="text-xs text-gray-400 mt-1">Week {currentWeek}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 card-hover animate-fade-in text-center" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center gap-2 mb-3"><Timer size={20} className="text-purple-500" /><h3 className="font-semibold text-gray-800">Countdown</h3></div>
          <p className="text-5xl font-bold text-purple-600 animate-count">{daysLeft}</p>
          <p className="text-gray-500 text-sm mt-2">days until you meet your little one 👶</p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-semibold text-gray-700 text-sm mb-3 px-1">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/partner/games')} className="flex items-center gap-3 bg-orange-50 rounded-2xl p-4 hover:scale-[1.02] transition-transform">
              <div className="bg-orange-100 p-2.5 rounded-xl"><Gamepad2 size={20} className="text-orange-500" /></div>
              <div className="text-left"><p className="font-semibold text-sm text-gray-800">Games 🎮</p><p className="text-xs text-gray-400">Fun activities</p></div>
            </button>
            <button onClick={() => navigate('/partner/memory')} className="flex items-center gap-3 bg-pink-50 rounded-2xl p-4 hover:scale-[1.02] transition-transform">
              <div className="bg-pink-100 p-2.5 rounded-xl"><BookHeart size={20} className="text-pink-500" /></div>
              <div className="text-left"><p className="font-semibold text-sm text-gray-800">Memory 📖</p><p className="text-xs text-gray-400">Precious moments</p></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
