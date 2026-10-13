import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  KeyRound 
} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Welcome ${data.name || ''} (${data.role === 'admin' ? 'Admin' : 'Issuer'})`);
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07090e] bg-mesh-pattern relative flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm relative z-10">
        
        {/* Card */}
        <div className="rounded-2xl bg-[#0c121e] border border-amber-500/20 shadow-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-xl font-bold text-slate-100">
              Admin Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage academic credentials
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-amber-400/80" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@college.com"
                  className="w-full bg-[#080d16] text-slate-100 placeholder-slate-500 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-amber-400/80" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#080d16] text-slate-100 placeholder-slate-500 text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 active:scale-[0.99] text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Verification</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;