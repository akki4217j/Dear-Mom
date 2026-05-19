import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Calendar, Heart, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    dueDate: '',
    partnerCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tempRole = sessionStorage.getItem('tempRole');
    if (tempRole) {
      setForm((prev) => ({ ...prev, role: tempRole }));
      sessionStorage.removeItem('tempRole');
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.role === 'mom' && !form.dueDate) {
      setError('Please enter your due date.');
      return;
    }

    setLoading(true);

    try {
      const userData = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        dueDate: form.role === 'mom' ? form.dueDate : undefined,
        partnerCode: form.partnerCode || undefined,
      });

      navigate(userData.role === 'partner' ? '/partner/dashboard' : '/mom/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-in">
          <span className="text-4xl">👶</span>
          <h1 className="font-display text-3xl font-bold text-gray-800 mt-2">Join DearMom</h1>
          <p className="text-gray-400 mt-1">Start your journey together</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-rose-100/50 p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-500 text-sm p-3 rounded-xl border border-rose-100">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                  placeholder="Your name"
                  required
                  id="signup-name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                  placeholder="your@email.com"
                  required
                  id="signup-email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                  placeholder="••••••••"
                  required
                  id="signup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">I am</label>
              <div className="relative">
                <Heart size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700 appearance-none"
                  required
                  id="signup-role"
                >
                  <option value="">Select your role</option>
                  <option value="mom">I'm the Mom 🤰</option>
                  <option value="partner">I'm the Partner 💑</option>
                </select>
              </div>
            </div>

            {/* Due Date (only for mom) */}
            {form.role === 'mom' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Due Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                    required
                    id="signup-duedate"
                  />
                </div>
              </div>
            )}

            {/* Partner Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Partner Code <span className="text-gray-300">(optional)</span>
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  name="partnerCode"
                  value={form.partnerCode}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                  placeholder="Enter partner's code to link"
                  id="signup-partnercode"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {form.role === 'partner' 
                  ? "Ask mom for her 6-digit partner code to link accounts" 
                  : "You'll get a partner code after signing up"}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              id="signup-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account 💕'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
