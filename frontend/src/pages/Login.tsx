import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/client';
import { Shield, Users, Hand, Heart, Eye, EyeOff, Loader2, X, Mail, Fingerprint, Terminal, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ScrambleText from '../components/UI/ScrambleText';
import GoogleButton from '../components/UI/GoogleButton';

const roleData = [
  { 
    key: 'ADMIN', 
    label: 'ADMIN_ACCESS', 
    icon: Shield, 
    desc: 'ROOT SYSTEM CONTROL', 
    tag: 'LVL_4',
    email: 'admin@clarion.org', 
    password: 'Admin@123', 
    route: '/dashboard',
  },
  { 
    key: 'NGO_STAFF', 
    label: 'STAFF_NODE', 
    icon: Users, 
    desc: 'OPERATIONS COMPLIANCE', 
    tag: 'LVL_3',
    email: 'staff1@clarion.org', 
    password: 'Staff@123', 
    route: '/staff/dashboard',
  },
  { 
    key: 'VOLUNTEER', 
    label: 'VOLUNTEER_NODE', 
    icon: Hand, 
    desc: 'FIELD SCHEDULING', 
    tag: 'LVL_2',
    email: 'volunteer1@clarion.org', 
    password: 'Vol@123', 
    route: '/volunteer/dashboard',
  },
  { 
    key: 'DONOR', 
    label: 'DONOR_NODE', 
    icon: Heart, 
    desc: 'LEDGER TRANSPARENCY', 
    tag: 'LVL_1',
    email: 'donor1@clarion.org', 
    password: 'Donor@123', 
    route: '/donor/dashboard',
  },
];

// Animated scan line component
function ScanLine() {
  return (
    <div className="absolute left-0 right-0 h-px bg-brand-primary/30 z-[1] pointer-events-none" 
      style={{ animation: 'scanMove 8s linear infinite' }} />
  );
}

// Floating hash strings for atmosphere
function FloatingHash({ delay, top, left }: { delay: number; top: string; left: string }) {
  const chars = '0123456789ABCDEF';
  const hash = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return (
    <div 
      className="absolute font-mono text-[10px] text-black/[0.06] tracking-widest uppercase pointer-events-none select-none"
      style={{ top, left, animation: `hashFade 6s ${delay}s ease-in-out infinite` }}
    >
      0x{hash}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
    if (!email.trim()) e.email = 'ERR_REQ_EMAIL';
    if (!password.trim()) e.password = 'ERR_REQ_PWD';
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
      toast.success(`AUTH_SUCCESS: ${res.user.full_name}`);
    } catch {
      setError('ERR_AUTH_FAIL: INVALID_CREDENTIALS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = () => {
    toast.success('SYS_MSG: RESET_LINK_DISPATCHED');
    setShowForgot(false);
    setForgotEmail('');
  };

  const activeRoleData = roleData.find(r => r.key === selectedRole);
  const ActiveIcon = activeRoleData?.icon || Shield;

  return (
    <div className="w-screen h-screen relative bg-[#FAFAFA] overflow-hidden font-mono">
      
      {/* === ANIMATED BACKGROUND LAYER === */}
      {/* Primary grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.08]" 
        style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }} />
      {/* Macro grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]" 
        style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,1) 2px, transparent 2px), linear-gradient(to bottom, rgba(0,0,0,1) 2px, transparent 2px)', backgroundSize: '16rem 16rem' }} />
      {/* Cross-hairs */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/[0.06] z-0 hidden md:block" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-black/[0.06] z-0 hidden md:block" />
      {/* Scan line */}
      <ScanLine />
      {/* Floating hashes */}
      <FloatingHash delay={0} top="15%" left="8%" />
      <FloatingHash delay={2} top="35%" left="75%" />
      <FloatingHash delay={4} top="70%" left="12%" />
      <FloatingHash delay={1} top="80%" left="85%" />
      <FloatingHash delay={3} top="25%" left="55%" />
      <FloatingHash delay={5} top="60%" left="40%" />

      {/* Corner registration marks */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-black/20 z-[1]" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-black/20 z-[1]" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-black/20 z-[1]" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-black/20 z-[1]" />

      {/* === HEADER BAR === */}
      <div className="absolute top-0 left-0 right-0 h-14 border-b-2 border-black bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center">
            <Terminal className="w-4 h-4 text-brand-primary" />
          </div>
          <h1 className="text-sm font-bold tracking-widest text-black uppercase">
            <ScrambleText text="CLARION_SYS" />
          </h1>
          <div className="hidden sm:block w-px h-6 bg-black/20 mx-2" />
          <span className="hidden sm:block text-[10px] text-slate-400 uppercase tracking-widest">AUTH_GATEWAY v2.1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 border border-black" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <span className="text-[10px] text-green-600 uppercase tracking-widest font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 pt-14">
        
        {!selectedRole ? (
          /* === ROLE SELECTOR VIEW === */
          <div className="w-full max-w-3xl">
            {/* Section stamp */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 border-2 border-black bg-brand-primary px-4 py-2 mb-4">
                <Fingerprint size={16} className="text-black" />
                <span className="text-xs font-bold text-black uppercase tracking-widest">IDENTITY_SELECTION</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight leading-none">
                SELECT_ACCESS_NODE
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-3">
                Choose authorization level to proceed with handshake protocol
              </p>
            </div>

            {/* Role Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleData.map((role, i) => {
                const Icon = role.icon;
                const isHovered = hoveredRole === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    onMouseEnter={() => setHoveredRole(role.key)}
                    onMouseLeave={() => setHoveredRole(null)}
                    className={`group relative text-left border-2 border-black bg-white p-6 transition-all duration-200 ${
                      isHovered 
                        ? 'bg-black text-white shadow-[8px_8px_0_rgba(249,115,22,1)] -translate-x-1 -translate-y-1' 
                        : 'shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0_rgba(249,115,22,1)]'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 border-2 border-current flex items-center justify-center transition-colors ${
                        isHovered ? 'bg-brand-primary text-black border-brand-primary' : 'bg-slate-50 text-black'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border transition-colors ${
                        isHovered ? 'border-brand-primary text-brand-primary' : 'border-black/20 text-slate-400'
                      }`}>
                        {role.tag}
                      </span>
                    </div>
                    
                    {/* Label */}
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-1 leading-tight">
                      {role.label}
                    </h3>
                    <p className={`text-[10px] uppercase tracking-widest mb-4 transition-colors ${
                      isHovered ? 'text-brand-primary' : 'text-slate-400'
                    }`}>
                      {role.desc}
                    </p>
                    
                    {/* Bottom action */}
                    <div className={`flex items-center justify-between pt-4 border-t transition-colors ${
                      isHovered ? 'border-white/20' : 'border-black/10'
                    }`}>
                      <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
                        isHovered ? 'text-brand-primary' : 'text-slate-300'
                      }`}>
                        INIT_AUTH →
                      </span>
                      <ChevronRight size={16} className={`transition-all ${
                        isHovered ? 'text-brand-primary translate-x-1' : 'text-slate-300'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer stamp */}
            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">
                0xBENE — DECENTRALISED_TRUST_PROTOCOL — {new Date().getFullYear()}
              </p>
            </div>
          </div>
        ) : (
          /* === LOGIN FORM VIEW === */
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="bg-white border-2 border-black shadow-[12px_12px_0_rgba(0,0,0,0.15)] relative">
              
              {/* Title bar */}
              <div className="p-2.5 border-b-2 border-black bg-brand-primary flex justify-between items-center">
                <span className="text-xs font-bold text-black uppercase tracking-widest pl-2 flex items-center gap-2">
                  <Fingerprint size={14} /> AUTHORIZATION_REQUIRED
                </span>
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="w-7 h-7 flex items-center justify-center text-black hover:bg-black hover:text-white border border-black bg-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-8">
                {/* Role header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-black border-dashed">
                  <div className="w-14 h-14 border-2 border-black flex items-center justify-center bg-slate-50">
                    <ActiveIcon className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black uppercase tracking-widest leading-none">
                      <ScrambleText text={activeRoleData?.label || ''} />
                    </h2>
                    <p className="text-brand-primary text-[10px] font-bold tracking-widest mt-1.5">
                      [{activeRoleData?.desc}]
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-500 text-red-600 text-[10px] font-bold tracking-widest uppercase p-3 mb-6 flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-black uppercase mb-1.5 block">IDENTIFIER_STRING</label>
                    <div className="relative">
                      <input type="email" value={email}
                        onChange={e => { setEmail(e.target.value); setIsDemo(false); setErrors(p => ({...p, email: undefined})); }}
                        className={`w-full h-11 px-4 bg-slate-50 border-2 text-black text-sm placeholder-gray-400 focus:outline-none focus:bg-brand-primary/10 transition-colors ${errors.email ? 'border-red-500' : 'border-black focus:border-brand-primary'}`}
                        placeholder="user@domain.com" />
                      {isDemo && <span className="absolute right-3 top-2.5 text-[9px] font-bold text-brand-primary uppercase tracking-widest bg-white px-1 border border-brand-primary">[DEMO]</span>}
                    </div>
                    {errors.email && <p className="text-red-600 text-[10px] mt-1.5 font-bold uppercase">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-black uppercase mb-1.5 block">SECURITY_HASH</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); setIsDemo(false); setErrors(p => ({...p, password: undefined})); }}
                        className={`w-full h-11 px-4 pr-12 bg-slate-50 border-2 text-black text-sm placeholder-gray-400 focus:outline-none focus:bg-brand-primary/10 transition-colors ${errors.password ? 'border-red-500' : 'border-black focus:border-brand-primary'}`}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-black transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-600 text-[10px] mt-1.5 font-bold uppercase">{errors.password}</p>}
                  </div>

                  <hr className="border-black my-4" />
                  <p className="text-center font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">
                    OR
                  </p>
                  <GoogleButton />

                  <button type="submit" disabled={isLoading}
                    className="w-full h-12 mt-4 bg-black hover:bg-brand-primary text-white hover:text-black font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-60 border-2 border-black">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> VERIFYING...</> : 'INITIATE_HANDSHAKE →'}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-black/10 flex justify-between items-center">
                  <button type="button" onClick={() => setSelectedRole(null)} className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-black transition-colors uppercase">
                    ← BACK
                  </button>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] font-bold tracking-widest text-slate-400 hover:text-black transition-colors uppercase">
                    RESYNC_CREDENTIALS
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
          <div className="bg-white border-2 border-black shadow-[12px_12px_0_rgba(0,0,0,0.15)] w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-brand-primary border-b-2 border-black p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-black uppercase tracking-widest pl-2">RECOVERY_PROTOCOL</span>
              <button onClick={() => setShowForgot(false)} className="w-7 h-7 flex items-center justify-center bg-white border border-black hover:bg-black hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-8">
              <h3 className="text-lg font-bold tracking-widest text-black uppercase mb-4"><ScrambleText text="RESET_CREDENTIALS" /></h3>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-6 border-l-2 border-brand-primary pl-3 py-1 bg-slate-50">Enter identifier. Reset protocol will be dispatched.</p>
              <div className="relative mb-6">
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border-2 border-black text-black text-sm focus:border-brand-primary focus:outline-none transition-colors placeholder-gray-400"
                  placeholder="user@domain.com" />
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              </div>
              <button onClick={handleForgotSubmit}
                className="w-full h-11 bg-black hover:bg-brand-primary text-white hover:text-black font-bold tracking-widest text-xs uppercase transition-all border-2 border-black">
                DISPATCH_LINK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes scanMove {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes hashFade {
          0%, 100% { opacity: 0; transform: translateY(4px); }
          50% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
