import { useState, useEffect } from 'react';
import { getTodayKey, getDayName } from '../utils/pregnancyUtils';
import { Flame } from 'lucide-react';
import { moodAPI } from '../api/api';

const moodOptions = [
  { emoji: '😄', label: 'Great', value: 5, color: 'border-green-300 bg-green-50', activeColor: 'border-green-500 bg-green-100 shadow-green-200' },
  { emoji: '🙂', label: 'Good', value: 4, color: 'border-lime-300 bg-lime-50', activeColor: 'border-lime-500 bg-lime-100 shadow-lime-200' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'border-yellow-300 bg-yellow-50', activeColor: 'border-yellow-500 bg-yellow-100 shadow-yellow-200' },
  { emoji: '😔', label: 'Low', value: 2, color: 'border-orange-300 bg-orange-50', activeColor: 'border-orange-500 bg-orange-100 shadow-orange-200' },
  { emoji: '😢', label: 'Tough Day', value: 1, color: 'border-rose-300 bg-rose-50', activeColor: 'border-rose-500 bg-rose-100 shadow-rose-200' },
];

const supportMessages = {
  5: "You're glowing! Keep embracing this beautiful journey 🌸",
  4: "You're glowing! Keep embracing this beautiful journey 🌸",
  3: "Some days are just okay, and that's perfectly fine 💕",
  2: "It's okay to have hard days. You're stronger than you know 💪",
  1: "It's okay to have hard days. You're stronger than you know 💪",
};

const MoodTracker = () => {
  const todayKey = getTodayKey();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const res = await moodAPI.getAll();
        const moodData = res.data;
        setMoods(moodData);
        const todayMood = moodData.find((m) => m.date === todayKey);
        if (todayMood) {
          setSelectedMood(moodOptions.find((m) => m.value === todayMood.value) || null);
          setNote(todayMood.note || '');
          setSaved(true);
        }
      } catch (err) { console.error('Failed to fetch moods:', err); }
    };
    fetchMoods();
  }, [todayKey]);

  const handleSave = async () => {
    if (!selectedMood) return;
    try {
      await moodAPI.save({ date: todayKey, value: selectedMood.value, label: selectedMood.label, emoji: selectedMood.emoji, note });
      const res = await moodAPI.getAll();
      setMoods(res.data);
      setSaved(true);
    } catch (err) { console.error('Failed to save mood:', err); }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const mood = moods.find((m) => m.date === key);
      days.push({ key, dayName: getDayName(key), mood: mood || null });
    }
    return days;
  };

  const getStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i <= 365; i++) {
      const date = new Date(today); date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      if (moods.some((m) => m.date === key)) { streak++; } else { break; }
    }
    return streak;
  };

  const last7 = getLast7Days();
  const streak = getStreak();

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-gray-800">Mood Tracker 💕</h1>
          <p className="text-gray-400 text-sm mt-1">How are you feeling today?</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-gray-700 text-sm mb-4">Select your mood</h3>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => {
              const isSelected = selectedMood?.value === mood.value;
              return (
                <button key={mood.value} onClick={() => { setSelectedMood(mood); setSaved(false); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 ${isSelected ? `${mood.activeColor} shadow-md scale-110` : `${mood.color} hover:scale-105`}`}
                  id={`mood-${mood.value}`}>
                  <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600">{mood.label}</span>
                </button>
              );
            })}
          </div>
          {selectedMood && (
            <div className="mt-5 animate-fade-in space-y-3">
              <textarea value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }}
                placeholder="Want to add a note? (optional)"
                className="w-full p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                rows={3} id="mood-note" />
              <button onClick={handleSave} disabled={saved}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-green-100 text-green-600' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:shadow-xl'}`}
                id="save-mood">
                {saved ? '✓ Mood Saved!' : 'Save Mood 💕'}
              </button>
            </div>
          )}
        </div>
        {selectedMood && saved && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 text-center animate-slide-up">
            <p className="text-gray-700 font-medium text-sm">{supportMessages[selectedMood.value]}</p>
          </div>
        )}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Last 7 Days</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {last7.map((day) => (
              <div key={day.key} className={`flex-shrink-0 flex flex-col items-center gap-1.5 rounded-xl p-3 min-w-[60px] ${day.key === todayKey ? 'bg-rose-100 border-2 border-rose-300' : 'bg-white border border-gray-100'}`}>
                <span className="text-[10px] font-medium text-gray-400 uppercase">{day.dayName}</span>
                <span className="text-xl">{day.mood ? day.mood.emoji : '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Flame size={24} className="text-orange-500" />
          <div>
            <p className="font-bold text-orange-600 text-lg">{streak} day streak!</p>
            <p className="text-gray-500 text-xs">Keep checking in 💕</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
