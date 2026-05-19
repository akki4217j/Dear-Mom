import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Smile, CheckSquare, Gamepad2, Wind, BookHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Check if already logged in
    if (user) {
      navigate(user.role === 'partner' ? '/partner/dashboard' : '/mom/dashboard');
      return;
    }

    // Create floating hearts
    const newHearts = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 14 + Math.random() * 18,
      emoji: ['💕', '💗', '💖', '🌸', '✨', '💝'][i % 6],
    }));
    setHearts(newHearts);
  }, [navigate, user]);

  const handleRoleSelect = (role) => {
    sessionStorage.setItem('tempRole', role);
    navigate('/signup');
  };

  const features = [
    { icon: Smile, title: 'Mood Tracking', desc: 'Track and understand your emotional journey', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: CheckSquare, title: 'Daily Tips', desc: 'Personalized tips for each trimester', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Gamepad2, title: 'Couple Games', desc: 'Fun activities to bond together', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Wind, title: 'Relax Space', desc: 'Breathing exercises & meditation', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: BookHeart, title: 'Memory Book', desc: 'Capture your precious moments', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: Heart, title: 'Partner Support', desc: 'Tools for the supportive partner', color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 relative overflow-hidden">
      {/* Floating Hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            fontSize: `${h.size}px`,
          }}
        >
          {h.emoji}
        </span>
      ))}

      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-6 animate-fade-in">
            <span className="text-5xl">👶</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-800 mb-4 animate-fade-in leading-tight">
            Every moment of your journey,{' '}
            <span className="text-rose-500">together</span> 💕
          </h1>
          
          <p className="text-gray-500 text-lg mb-10 animate-fade-in font-light max-w-md mx-auto" style={{ animationDelay: '0.2s' }}>
            DearMom is your pregnancy companion for both of you — track moods, stay healthy, and bond as a couple.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => handleRoleSelect('mom')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
              id="btn-expecting"
            >
              I'm Expecting 🤰
            </button>
            <button
              onClick={() => handleRoleSelect('partner')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-rose-500 border-2 border-rose-200 rounded-2xl font-semibold text-lg hover:bg-rose-50 hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 shadow-md"
              id="btn-partner"
            >
              I'm the Partner 💑
            </button>
          </div>

          {/* Already have account */}
          <p className="mt-6 text-gray-400 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-rose-500 hover:text-rose-600 font-medium underline underline-offset-2">
              Log in
            </button>
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center text-gray-800 mb-8">
            Everything you need 🌟
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover animate-fade-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className={`${feat.bg} w-11 h-11 rounded-xl flex items-center justify-center mb-3`}>
                  <feat.icon size={22} className={feat.color} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 text-center">
        <p className="text-gray-300 text-sm">Made with 💕 for growing families</p>
      </div>
    </div>
  );
};

export default Landing;
