import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/admin/login');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 bg-[#080d17]/90 backdrop-blur-md border-b border-amber-500/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wide text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                VERICRED
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300/80 bg-amber-400/10 border border-amber-400/20">
                Sepolia
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Verify
            </Link>

            {user ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === '/admin/dashboard'
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/admin/issue"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === '/admin/issue'
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Issue
                </Link>

                <Link
                  to="/admin/issuers"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === '/admin/issuers'
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Issuers
                </Link>

                <div className="h-4 w-px bg-slate-800 mx-2" />

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={`ml-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isAdminRoute
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-amber-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
                }`}
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d18] px-4 py-3 space-y-1 text-sm">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-lg ${
              location.pathname === '/' ? 'text-amber-300 bg-amber-400/10' : 'text-slate-300'
            }`}
          >
            Verify
          </Link>

          {user ? (
            <>
              <Link
                to="/admin/dashboard"
                className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/admin/dashboard' ? 'text-amber-300 bg-amber-400/10' : 'text-slate-300'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/issue"
                className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/admin/issue' ? 'text-amber-300 bg-amber-400/10' : 'text-slate-300'
                }`}
              >
                Issue Certificate
              </Link>
              <Link
                to="/admin/issuers"
                className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/admin/issuers' ? 'text-amber-300 bg-amber-400/10' : 'text-slate-300'
                }`}
              >
                Manage Issuers
              </Link>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-3">
                <span className="text-xs text-slate-400">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/admin/login"
                className="block text-center py-2 px-3 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs"
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;