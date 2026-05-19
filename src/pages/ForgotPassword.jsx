import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../api/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <span className="text-4xl">🔑</span>
          <h1 className="font-display text-3xl font-bold text-gray-800 mt-2">Reset Password</h1>
          <p className="text-gray-400 mt-1">We'll help you get back in</p>
        </div>
        <div className="bg-white rounded-3xl shadow-lg shadow-rose-100/50 p-8 animate-slide-up">
          {sent ? (
            <div className="text-center">
              <span className="text-4xl block mb-3">📧</span>
              <h3 className="font-display text-xl font-bold text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-gray-500 text-sm mb-6">If an account exists with that email, we've sent reset instructions.</p>
              <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium text-sm">← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-rose-50 text-rose-500 text-sm p-3 rounded-xl border border-rose-100">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 transition text-gray-700"
                    placeholder="your@email.com" required id="forgot-email" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 hover:shadow-xl transition-all disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Link 💕'}
              </button>
              <p className="text-center">
                <Link to="/login" className="text-gray-400 hover:text-rose-500 text-sm flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
