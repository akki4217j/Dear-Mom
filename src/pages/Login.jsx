import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      navigate(userData.role === 'partner' ? '/partner/dashboard' : '/mom/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <span className="text-4xl">👶</span>
          <h1 className="font-display text-3xl font-bold text-gray-800 mt-2">Welcome Back</h1>
          <p className="text-gray-400 mt-1">Continue your beautiful journey</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-rose-100/50 p-8 animate-slide-up">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-500 text-sm p-3 rounded-xl border border-rose-100">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                  placeholder="your@email.com"
                  required
                  id="login-email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition text-gray-700"
                  placeholder="••••••••"
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-rose-400 hover:text-rose-500 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Log In 💕'
              )}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-rose-500 hover:text-rose-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
