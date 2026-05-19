import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDueDateInfo, getBabySize, getGreeting, getTodayKey } from '../utils/pregnancyUtils';
import tips from '../data/tips';
import { Lightbulb, Heart, CheckCircle2, Wind, MapPin, MessageCircle, Gamepad2, BookHeart, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moodAPI, taskAPI } from '../api/api';

const MomDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = user?.name || 'Mom';
  const { currentWeek, weeksLeft, trimester } = getDueDateInfo(user?.dueDate);
  const babySize = getBabySize(currentWeek);
  const todayKey = getTodayKey();

  const [todayMood, setTodayMood] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const totalTasks = 7;

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todayTip = tips[dayOfYear % tips.length];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, taskRes] = await Promise.all([moodAPI.getAll(), taskAPI.getByDate(todayKey)]);
        const moods = moodRes.data;
        const latest = moods.find(m => m.date === todayKey);
        if (latest) setTodayMood(latest);
        const tasks = taskRes.data || {};
        setCompletedTasks(Object.values(tasks).filter(Boolean).length);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [todayKey]);

  const taskPercent = Math.round((completedTasks / totalTasks) * 100);

  const copyPartnerCode = () => {
    if (user?.partnerCode) {
      navigator.clipboard.writeText(user.partnerCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const quickLinks = [
    { icon: Wind, label: 'Relax', path: '/mom/relax', bg: 'bg-purple-50', emoji: '🧘' },
    { icon: MapPin, label: 'Doctor', path: '/mom/doctor', bg: 'bg-green-50', emoji: '🏥' },
    { icon: MessageCircle, label: 'Ask Me', path: '/mom/askme', bg: 'bg-blue-50', emoji: '🤖' },
    { icon: Gamepad2, label: 'Games', path: '/mom/games', bg: 'bg-orange-50', emoji: '🎮' },
    { icon: BookHeart, label: 'Memory', path: '/mom/memory', bg: 'bg-pink-50', emoji: '📖' },
  ];

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 animate-fade-in">
          <p className="text-rose-100 text-sm font-medium">{getGreeting()}</p>
          <h1 className="font-display text-2xl font-bold mt-1">{name} 🌸</h1>
          <div className="mt-3 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2"><span className="text-sm font-medium">Week {currentWeek}</span></div>
            <div className="text-rose-100 text-sm">Trimester {trimester} • {weeksLeft} weeks to go</div>
          </div>
        </div>

        {/* Partner Code */}
        {user?.partnerCode && !user?.linkedPartner && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100 animate-fade-in">
            <p className="text-xs text-gray-500 mb-2">Share this code with your partner to link accounts:</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-indigo-600 tracking-widest">{user.partnerCode}</span>
              <button onClick={copyPartnerCode} className="p-1.5 rounded-lg bg-white hover:bg-indigo-100 transition">
                {codeCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-indigo-400" />}
              </button>
            </div>
          </div>
        )}

        {user?.linkedPartner && (
          <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center animate-fade-in">
            <p className="text-sm text-green-700">💑 Linked with {user.partnerName || 'your partner'}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100 card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0"><Lightbulb size={20} className="text-amber-600" /></div>
            <div><h3 className="font-semibold text-gray-800 text-sm mb-1">Today's Tip</h3><p className="text-gray-600 text-sm leading-relaxed">{todayTip}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 card-hover cursor-pointer animate-fade-in" style={{ animationDelay: '0.2s' }} onClick={() => navigate('/mom/tasks')}>
            <div className="flex items-center gap-2 mb-3"><CheckCircle2 size={18} className="text-rose-500" /><h3 className="font-semibold text-gray-800 text-sm">Tasks</h3></div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{completedTasks}<span className="text-gray-300 text-lg">/{totalTasks}</span></p>
            <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full animate-progress" style={{ width: `${taskPercent}%` }} /></div>
            <p className="text-xs text-gray-400 mt-2">View Tasks →</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 card-hover cursor-pointer animate-fade-in" style={{ animationDelay: '0.3s' }} onClick={() => navigate('/mom/mood')}>
            <div className="flex items-center gap-2 mb-3"><Heart size={18} className="text-rose-500" /><h3 className="font-semibold text-gray-800 text-sm">Mood</h3></div>
            {todayMood ? (<><p className="text-3xl mb-1">{todayMood.emoji}</p><p className="text-sm text-gray-600">{todayMood.label}</p></>) : (<><p className="text-sm text-gray-400 leading-relaxed">How are you feeling today?</p><p className="text-xs text-rose-400 mt-2 font-medium">Log Mood →</p></>)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 card-hover animate-fade-in text-center" style={{ animationDelay: '0.4s' }}>
          <span className="text-5xl block mb-2">{babySize.emoji}</span>
          <h3 className="font-display text-lg font-semibold text-gray-800">Your baby is the size of a {babySize.name}!</h3>
          <p className="text-gray-500 text-sm mt-1">Week {currentWeek} of 40</p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-semibold text-gray-700 text-sm mb-3 px-1">Quick Access</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {quickLinks.map((link) => (
              <button key={link.label} onClick={() => navigate(link.path)} className={`flex-shrink-0 flex flex-col items-center gap-1.5 ${link.bg} rounded-2xl px-5 py-4 hover:scale-105 transition-transform`}>
                <span className="text-xl">{link.emoji}</span>
                <span className="text-xs font-medium text-gray-600">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomDashboard;
