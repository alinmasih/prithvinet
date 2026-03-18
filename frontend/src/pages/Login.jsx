import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Building2,
  Users,
  Search,
  UserCheck
} from 'lucide-react';
import PageBranding from '../components/PageBranding';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Admin'); // Default for dev ease
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  const roles = [
    { id: 'Admin', label: 'Admin', icon: UserCheck, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'Regional Officer', label: 'Officer', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'Monitoring Team', label: 'Monitor', icon: Search, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'Industry User', label: 'Industry', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login({ email, password, role: selectedRole });
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <PageBranding title="Secure Access Gateway" />
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in px-4 sm:px-0">
        <div className="text-center mb-8 md:mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-white transition-colors mb-6 group">
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 transition-transform hover:scale-110 duration-500">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Prithvi<span className="text-primary">Net</span></h1>
            <p className="text-text-muted font-medium">Environmental Monitoring Portal</p>
          </div>
        </div>

        <div className="glass-morphism rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
          <div className="mb-10">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4 block ml-1 italic">Identify Operating Role</label>
            <div className="grid grid-cols-4 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                    selectedRole === role.id 
                      ? `${role.bg} ${role.border} scale-105 shadow-lg shadow-black/20` 
                      : 'bg-white/5 border-white/5 grayscale opacity-50 hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  <role.icon className={selectedRole === role.id ? role.color : 'text-white'} size={20} />
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${selectedRole === role.id ? 'text-white' : 'text-text-muted'}`}>
                    {role.label}
                  </span>
                </button>
              ))}
            </div>
          </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov.in"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm animate-shake">
                <AlertCircle size={18} />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
             <div className="flex items-center gap-2 text-xs text-primary font-bold italic uppercase tracking-widest justify-center">
               <Sparkles size={14} /> AI-Enhanced Verification Active
             </div>
             <p className="text-[10px] text-center text-text-muted uppercase tracking-[0.2em] font-bold">
               Authorized Personnel Only
             </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-text-muted font-medium">
          Need access? <span className="text-primary cursor-pointer hover:underline font-bold">Contact Administration</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
