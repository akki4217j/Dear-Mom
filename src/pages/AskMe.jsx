import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const responses = {
  nausea: "Morning sickness is very common, especially in the first trimester. Try eating small meals frequently, avoid spicy food, and keep crackers nearby. Ginger tea can help! Always consult your doctor if it's severe 💕",
  sleep: "Sleeping on your left side improves blood flow to baby. Use a pregnancy pillow for support. Avoid screens 1 hour before bed. A warm (not hot) bath can help relax you 🌙",
  exercise: "Gentle exercise is great during pregnancy! Walking, swimming, and prenatal yoga are excellent choices. Aim for 20-30 minutes daily. Always listen to your body and stop if anything feels wrong 🧘‍♀️",
  pain: "Back pain is very common. Try gentle stretches, use a warm compress, and maintain good posture. If pain is severe or sudden, please contact your doctor immediately 🌿",
  food: "Focus on iron-rich foods (spinach, lentils), calcium (dairy, almonds), folic acid (leafy greens), and stay well hydrated. Avoid raw fish, unpasteurized cheese, and excessive caffeine ☀️",
  mood: "Mood swings are completely normal during pregnancy due to hormonal changes. Be kind to yourself. Talk to your partner, journal your feelings, and don't hesitate to seek emotional support 💕",
  default: "That's a great question! I'd recommend discussing this with your healthcare provider who knows your specific situation best. In the meantime, is there something else I can help with? 🌸"
};

const keywordMap = {
  nausea: ['nausea', 'vomit', 'sick', 'morning sickness', 'throw up', 'puke'],
  sleep: ['sleep', 'insomnia', 'tired', 'rest', 'fatigue', 'exhausted'],
  exercise: ['exercise', 'walk', 'yoga', 'workout', 'active', 'fitness'],
  pain: ['pain', 'ache', 'back', 'cramp', 'hurt', 'sore'],
  food: ['food', 'eat', 'diet', 'nutrition', 'vitamin', 'meal', 'hungry'],
  mood: ['mood', 'sad', 'cry', 'emotional', 'anxious', 'stress', 'worried', 'happy'],
};

const quickQuestions = ['Tips for nausea', 'Sleep better', 'Safe exercises', 'What to eat'];

const AskMe = () => {
  const { user } = useAuth();
  const name = user?.name || 'Mom';
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: `Hi ${name}! 🌸 I'm here to help with any pregnancy questions. What's on your mind today?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const getResponse = (text) => {
    const lower = text.toLowerCase();
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(kw => lower.includes(kw))) return responses[key];
    }
    return responses.default;
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const botMsg = { id: Date.now() + 1, from: 'bot', text: getResponse(text) };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  return (
    <div className="pb-bottom-nav">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
        <div className="px-4 py-3 bg-white border-b border-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-lg">🤰</div>
            <div><p className="font-semibold text-gray-800 text-sm">DearMom Assistant</p><p className="text-xs text-green-500">Online</p></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-rose-50/30">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.from === 'bot' && (<div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">🤰</div>)}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.from === 'user' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md'}`}>{msg.text}</div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center text-xs mr-2 mt-1">🤰</div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="px-4 py-2 bg-white border-t border-rose-50 flex gap-2 overflow-x-auto">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => sendMessage(q)} className="flex-shrink-0 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-full text-xs font-medium hover:bg-rose-100 transition">{q}</button>
          ))}
        </div>
        <div className="px-4 py-3 bg-white border-t border-rose-50">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your question..."
              className="flex-1 px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" id="askme-input" />
            <button type="submit" className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition" id="askme-send"><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskMe;
