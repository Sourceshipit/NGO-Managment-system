import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/client';
import { Shield, Users, Hand, Heart, Eye, EyeOff, Loader2, X, Mail, ArrowLeft, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import GoogleButton from '../components/UI/GoogleButton';

const roleData = [
  { 
    key: 'ADMIN', 
    label: 'Administrator', 
    icon: Shield, 
    desc: 'Full system access & configuration', 
    color: 'bg-brand-primary-light text-brand-primary',
    email: 'admin@benetrack.org', 
    password: 'Admin@123', 
    route: '/dashboard',
  },
  { 
    key: 'NGO_STAFF', 
    label: 'NGO Staff', 
    icon: Users, 
    desc: 'Operations & compliance management', 
    color: 'bg-emerald-50 text-emerald-600',
    email: 'staff1@benetrack.org', 
    password: 'Staff@123', 
    route: '/staff/dashboard',
  },
  { 
    key: 'VOLUNTEER', 
    label: 'Volunteer', 
    icon: Hand, 
    desc: 'Scheduling & field activities', 
    color: 'bg-blue-50 text-blue-600',
    email: 'volunteer1@benetrack.org', 
    password: 'Vol@123', 
    route: '/volunteer/dashboard',
  },
  { 
    key: 'DONOR', 
    label: 'Donor', 
    icon: Heart, 
    desc: 'Donations & impact tracking', 
    color: 'bg-rose-50 text-rose-600',
    email: 'donor1@benetrack.org', 
    password: 'Donor@123', 
    route: '/donor/dashboard',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      const role = roleData.find(r => r.key === selectedRole);
      if (role) {
        setEmail(role.email);
        setPassword(role.password);
        setIsDemo(true);
        setErrors({});
        setError('');
      }
    }
  }, [selectedRole]);

  const validate = (): boolean => {
    const e: {email?: string; password?: string} = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await authAPI.login(email, password);
      login(res.access_token, res.user);
      const roleRoutes: Record<string, string> = {
        ADMIN: '/dashboard', NGO_STAFF: '/staff/dashboard',
        VOLUNTEER: '/volunteer/dashboard', DONOR: '/donor/dashboard'
      };
      navigate(roleRoutes[res.user.role] || '/dashboard');
      toast.success(`Welcome, ${res.user.full_name}`);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = () => {
    toast.success('Password reset link has been sent to your email');
    setShowForgot(false);
    setForgotEmail('');
  };

  const activeRoleData = roleData.find(r => r.key === selectedRole);
  const ActiveIcon = activeRoleData?.icon || Shield;

  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex items-center justify-center">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-brand-text">BeneTrack</span>
        </div>
        <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-primary transition-all duration-200 group">
          <Home size={15} className="transition-transform duration-200 group-hover:scale-110" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg px-6">
        {!selectedRole ? (
          /* Role Selector */
          <div className="w-full">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-brand-text mb-2">
                Welcome to BeneTrack
              </h2>
              <p className="text-sm text-brand-muted">
                Select your role to continue
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleData.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className="group relative text-left bg-white rounded-xl border border-brand-border p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:shadow-sm"
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 ${role.color} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-text mb-0.5">
                      {role.label}
                    </h3>
                    <p className="text-xs text-brand-muted">{role.desc}</p>
                  </button>
                );
              })}
            </div>

            <p className="mt-8 text-center text-xs text-brand-muted">
              © {new Date().getFullYear()} BeneTrack — Secure NGO Management
            </p>
          </div>
        ) : (
          /* Login Form */
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-brand-border overflow-hidden">
              {/* Form Header */}
              <div className="p-6 border-b border-brand-border">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeRoleData?.color}`}>
                    <ActiveIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-brand-text">
                      {activeRoleData?.label}
                    </h2>
                    <p className="text-xs text-brand-muted">{activeRoleData?.desc}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-5 flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-brand-text mb-1.5 block">Email</label>
                    <div className="relative">
                      <input type="email" value={email}
                        onChange={e => { setEmail(e.target.value); setIsDemo(false); setErrors(p => ({...p, email: undefined})); }}
                        className={`input-field ${errors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                        placeholder="you@example.com" />
                      {isDemo && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded-full">Demo</span>}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-brand-text mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); setIsDemo(false); setErrors(p => ({...p, password: undefined})); }}
                        className={`input-field pr-12 ${errors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-text transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                  </div>

                  <div className="relative flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-brand-border" />
                    <span className="text-xs text-brand-muted">or</span>
                    <div className="flex-1 h-px bg-brand-border" />
                  </div>

                  <GoogleButton />

                  <button type="submit" disabled={isLoading}
                    className="btn-primary w-full h-12 mt-2 text-sm">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-brand-border flex justify-between items-center">
                  <button type="button" onClick={() => setSelectedRole(null)} className="text-sm text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-brand-muted hover:text-brand-primary transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForgot(false)}>
          <div className="bg-white rounded-2xl shadow-xl border border-brand-border w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-brand-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-text">Reset Password</h3>
              <button onClick={() => setShowForgot(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-brand-muted mb-4">Enter your email address and we'll send you a reset link.</p>
              <div className="relative mb-4">
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com" />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <button onClick={handleForgotSubmit} className="btn-primary w-full">
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
