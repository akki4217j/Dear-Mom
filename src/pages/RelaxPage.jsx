import { useState, useEffect, useRef, useCallback } from 'react';
import affirmations from '../data/affirmations';
import { Wind, Sparkles, Timer } from 'lucide-react';

const tabs = [
  { id: 'breathing', label: 'Breathing', icon: Wind },
  { id: 'affirmations', label: 'Affirmations', icon: Sparkles },
  { id: 'meditation', label: 'Meditation', icon: Timer },
];

const RelaxPage = () => {
  const [activeTab, setActiveTab] = useState('breathing');

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-gray-800">Relax Space 🧘</h1>
          <p className="text-gray-400 text-sm mt-1">Take a moment for yourself</p>
        </div>

        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-rose-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              id={`tab-${tab.id}`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'breathing' && <BreathingExercise />}
        {activeTab === 'affirmations' && <AffirmationsTab />}
        {activeTab === 'meditation' && <MeditationTimer />}
      </div>
    </div>
  );
};

const BreathingExercise = () => {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [round, setRound] = useState(0);
  const totalRounds = 5;
  const timeoutRef = useRef(null);

  const phaseConfig = {
    inhale: { label: 'Inhale', color: 'from-blue-400 to-cyan-400' },
    hold: { label: 'Hold', color: 'from-purple-400 to-indigo-400' },
    exhale: { label: 'Exhale', color: 'from-green-400 to-emerald-400' },
    idle: { label: 'Ready?', color: 'from-gray-300 to-gray-400' },
  };

  const runCycle = useCallback((currentRound) => {
    if (currentRound > totalRounds) {
      setRunning(false);
      setPhase('idle');
      setRound(0);
      return;
    }
    setRound(currentRound);
    setPhase('inhale');
    timeoutRef.current = setTimeout(() => {
      setPhase('hold');
      timeoutRef.current = setTimeout(() => {
        setPhase('exhale');
        timeoutRef.current = setTimeout(() => {
          runCycle(currentRound + 1);
        }, 8000);
      }, 7000);
    }, 4000);
  }, [totalRounds]);

  const start = () => { setRunning(true); runCycle(1); };
  const stop = () => {
    setRunning(false); setPhase('idle'); setRound(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const config = phaseConfig[phase];
  const circleScale = phase === 'exhale' ? 'scale-[0.6]' : phase === 'idle' ? 'scale-[0.6]' : 'scale-100';
  const dur = phase === 'inhale' ? '4s' : phase === 'hold' ? '7s' : phase === 'exhale' ? '8s' : '0.3s';

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-purple-50 animate-fade-in text-center">
      <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">4-7-8 Breathing</h3>
      <p className="text-gray-400 text-xs mb-8">Inhale 4s → Hold 7s → Exhale 8s</p>
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-20 transition-transform ease-linear ${circleScale}`} style={{ transitionDuration: dur }} />
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${config.color} opacity-40 transition-transform ease-linear ${circleScale}`} style={{ transitionDuration: dur }} />
          <div className={`relative z-10 w-28 h-28 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center transition-transform ease-linear ${circleScale} shadow-lg`} style={{ transitionDuration: dur }}>
            <span className="text-white font-semibold text-lg">{config.label}</span>
          </div>
        </div>
      </div>
      {running && <p className="text-gray-500 text-sm mb-4">Round {round} of {totalRounds}</p>}
      <button onClick={running ? stop : start}
        className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${running ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200 hover:shadow-xl'}`}
        id="breathing-toggle">
        {running ? 'Stop' : 'Start Breathing'}
      </button>
    </div>
  );
};

const AffirmationsTab = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIndex((prev) => (prev + 1) % affirmations.length); setFade(true); }, 300);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const next = () => {
    setFade(false);
    setTimeout(() => { setIndex((prev) => (prev + 1) % affirmations.length); setFade(true); }, 300);
  };

  return (
    <div className="animate-fade-in">
      <div className={`bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 rounded-3xl p-10 shadow-sm border border-rose-100 text-center transition-opacity duration-300 min-h-[200px] flex flex-col items-center justify-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-4xl mb-4 block">✨</span>
        <p className="font-display text-xl sm:text-2xl font-semibold text-gray-800 leading-relaxed">{affirmations[index]}</p>
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={next} className="px-6 py-2.5 bg-white border border-rose-200 text-rose-500 rounded-xl font-medium text-sm hover:bg-rose-50 transition" id="next-affirmation">
          Next Affirmation ✨
        </button>
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {affirmations.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-rose-400 w-5' : 'bg-rose-200'}`} />
        ))}
      </div>
    </div>
  );
};

const MeditationTimer = () => {
  const [duration, setDuration] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const durations = [
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
  ];

  const playBell = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 528; osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 3);
    } catch (e) { /* Audio not supported */ }
  };

  const start = (secs) => { setDuration(secs); setRemaining(secs); setRunning(true); };

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); playBell(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const stop = () => { setRunning(false); setRemaining(0); setDuration(null); clearInterval(intervalRef.current); };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60); const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration ? ((duration - remaining) / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-purple-50 animate-fade-in text-center">
      <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">Meditation Timer</h3>
      <p className="text-gray-400 text-xs mb-6">Find your inner peace</p>

      {!running && remaining === 0 ? (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Choose your duration</p>
          <div className="flex gap-3 justify-center">
            {durations.map((d) => (
              <button key={d.value} onClick={() => start(d.value)}
                className="px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl font-medium text-purple-600 hover:from-purple-100 hover:to-indigo-100 transition text-sm"
                id={`meditation-${d.value}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="relative flex justify-center mb-6">
            <svg width="200" height="200" className="-rotate-90">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#F3E8FF" strokeWidth="8" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#timerGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-800">{formatTime(remaining)}</span>
            </div>
          </div>
          {remaining === 0 && !running ? (
            <div className="animate-slide-up">
              <p className="text-lg font-display font-semibold text-purple-600 mb-3">Session Complete 🙏</p>
              <button onClick={stop} className="px-6 py-2.5 bg-purple-100 text-purple-600 rounded-xl font-medium text-sm hover:bg-purple-200 transition">
                New Session
              </button>
            </div>
          ) : (
            <button onClick={stop} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition" id="meditation-stop">
              Stop
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RelaxPage;
