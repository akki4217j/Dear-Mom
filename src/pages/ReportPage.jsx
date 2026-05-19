import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getDayName, getDueDateInfo } from '../utils/pregnancyUtils';
import tasksByTrimester from '../data/tasks';
import { TrendingUp, Target, Flame, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moodAPI, taskAPI } from '../api/api';

const MOOD_COLORS = ['#22C55E', '#84CC16', '#EAB308', '#F97316', '#F43F5E'];
const MOOD_LABELS = ['Great', 'Good', 'Okay', 'Low', 'Tough'];

const ReportPage = () => {
  const { user } = useAuth();
  const { trimester } = getDueDateInfo(user?.dueDate);
  const [moods, setMoods] = useState([]);
  const [weekTasks, setWeekTasks] = useState({});
  const [moodStats, setMoodStats] = useState({ totalDays: 0, avgMood: '0', bestStreak: 0, distribution: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, statsRes, taskRes] = await Promise.all([
          moodAPI.getAll(), moodAPI.getStats(), taskAPI.getWeeklyStats()
        ]);
        setMoods(moodRes.data);
        setMoodStats(statsRes.data);
        setWeekTasks(taskRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const getMoodChartData = () => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const mood = moods.find(m => m.date === key);
      data.push({ day: getDayName(key), date: key.slice(5), value: mood ? mood.value : null, emoji: mood ? mood.emoji : '' });
    }
    return data;
  };

  const getTaskChartData = () => {
    const tasks = tasksByTrimester[trimester] || tasksByTrimester[1];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const checked = weekTasks[key] || {};
      const done = tasks.filter(t => checked[t.id]).length;
      data.push({ day: getDayName(key), percent: Math.round((done / tasks.length) * 100) });
    }
    return data;
  };

  const getWeekTaskPercent = () => {
    const tasks = tasksByTrimester[trimester] || tasksByTrimester[1];
    let total = 0, done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const checked = weekTasks[key] || {};
      total += tasks.length;
      done += tasks.filter(t => checked[t.id]).length;
    }
    return total ? Math.round((done / total) * 100) : 0;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (<div className="bg-white px-3 py-2 rounded-lg shadow-md border border-rose-100 text-xs"><p className="text-gray-600">{payload[0].payload.emoji} Score: {payload[0].value}</p></div>);
    }
    return null;
  };

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="animate-fade-in"><h1 className="font-display text-2xl font-bold text-gray-800">Your Report 📊</h1><p className="text-gray-400 text-sm mt-1">Insights into your journey</p></div>

        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: TrendingUp, label: 'Days Tracked', value: moodStats.totalDays, color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Target, label: 'Avg Mood', value: `${moodStats.avgMood} 😊`, color: 'text-green-500', bg: 'bg-green-50' },
            { icon: Flame, label: 'Best Streak', value: `${moodStats.bestStreak} 🔥`, color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: BarChart3, label: 'Tasks This Week', value: `${getWeekTaskPercent()}%`, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 card-hover`}>
              <stat.icon size={20} className={`${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-display text-base font-semibold text-gray-800 mb-4">Your Mood Journey 💕</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={getMoodChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF1F2" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#9CA3AF' }} ticks={[1,2,3,4,5]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#F43F5E" strokeWidth={2.5} dot={{ fill: '#F43F5E', r: 4 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-display text-base font-semibold text-gray-800 mb-4">Daily Task Completion ✅</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getTaskChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF1F2" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Completed']} />
              <Bar dataKey="percent" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {moodStats.distribution?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-display text-base font-semibold text-gray-800 mb-4">Mood Distribution 🎯</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={moodStats.distribution} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {moodStats.distribution.map((entry, i) => <Cell key={i} fill={MOOD_COLORS[MOOD_LABELS.indexOf(entry.name)] || MOOD_COLORS[0]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-display text-base font-semibold text-gray-800 mb-3">Recent Entries</h3>
          {moods.length === 0 ? (<p className="text-gray-400 text-sm">No moods logged yet</p>) : (
            <div className="space-y-2">
              {[...moods].reverse().slice(0, 5).map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50/50">
                  <span className="text-xl">{m.emoji}</span>
                  <div className="flex-1"><p className="text-sm text-gray-700 font-medium">{m.label}</p>{m.note && <p className="text-xs text-gray-400 truncate">{m.note}</p>}</div>
                  <span className="text-xs text-gray-400">{m.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
