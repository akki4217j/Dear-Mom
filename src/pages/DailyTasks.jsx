import { useState, useEffect } from 'react';
import { getDueDateInfo, getTodayKey } from '../utils/pregnancyUtils';
import tasksByTrimester, { categoryColors } from '../data/tasks';
import { CheckCircle2, Circle, Flame, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../api/api';

const DailyTasks = () => {
  const { user } = useAuth();
  const { trimester } = getDueDateInfo(user?.dueDate);
  const todayKey = getTodayKey();
  const tasks = tasksByTrimester[trimester] || tasksByTrimester[1];

  const [checked, setChecked] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskAPI.getByDate(todayKey);
        setChecked(res.data || {});
      } catch (err) { console.error('Failed to fetch tasks:', err); }
    };
    const fetchStreak = async () => {
      try {
        const res = await taskAPI.getStreak(tasks.length);
        setStreak(res.data.streak);
      } catch (err) { console.error('Failed to fetch streak:', err); }
    };
    fetchTasks();
    fetchStreak();
  }, [todayKey, tasks.length]);

  const toggleTask = async (taskId) => {
    const newChecked = { ...checked, [taskId]: !checked[taskId] };
    setChecked(newChecked);
    try {
      await taskAPI.saveByDate(todayKey, newChecked);
    } catch (err) { console.error('Failed to save task:', err); }
    const allDone = tasks.every((t) => newChecked[t.id]);
    if (allDone) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const completedCount = tasks.filter((t) => checked[t.id]).length;
  const taskPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-gray-800">Daily Tasks ✅</h1>
          <p className="text-gray-400 text-sm mt-1">Trimester {trimester} routine</p>
        </div>
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
            <p className="text-sm text-gray-500 mb-2">Today's Progress</p>
            <p className="text-2xl font-bold text-gray-800">{completedCount}<span className="text-gray-300 text-base">/{tasks.length}</span></p>
            <div className="w-full h-2.5 bg-rose-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500" style={{ width: `${taskPercent}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{taskPercent}% complete</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={18} className="text-orange-500" />
              <p className="text-sm text-gray-500">Streak</p>
            </div>
            <p className="text-3xl font-bold text-orange-500">{streak}</p>
            <p className="text-xs text-gray-400 mt-1">{streak > 0 ? 'day streak! Keep going!' : 'Complete all to start!'}</p>
          </div>
        </div>
        {showCelebration && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center animate-slide-up">
            <PartyPopper size={40} className="text-green-500 mx-auto mb-2" />
            <h3 className="font-display text-xl font-bold text-green-700">All Tasks Done! 🎉</h3>
            <p className="text-green-600 text-sm mt-1">You're doing amazing, mama!</p>
          </div>
        )}
        <div className="space-y-3">
          {tasks.map((task, i) => {
            const colors = categoryColors[task.category] || categoryColors.health;
            const isDone = checked[task.id];
            return (
              <button key={task.id} onClick={() => toggleTask(task.id)}
                className={`w-full flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border-l-4 ${colors.border} transition-all duration-300 hover:shadow-md text-left animate-fade-in ${isDone ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${0.05 * i}s` }} id={`task-${task.id}`}>
                {isDone ? <CheckCircle2 size={22} className="text-green-500 flex-shrink-0" /> : <Circle size={22} className="text-gray-300 flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.task}</p>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${colors.text} mt-0.5 inline-block`}>{task.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyTasks;
