import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button
          onClick={() => {
            navigate(user?.role === 'partner' ? '/partner/dashboard' : '/mom/dashboard');
          }}
          className="font-display text-xl font-bold text-rose-500 hover:text-rose-600 transition-colors"
        >
          DearMom 💕
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium hidden sm:block">
            Hi, {user?.name || 'User'} 👋
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full"
            id="logout-button"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
