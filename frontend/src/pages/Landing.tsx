import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Link2, Users, ArrowRight, Activity, Globe, HeartHandshake, Key } from 'lucide-react';
import ScrambleText from '../components/UI/ScrambleText';

/* #5 Animated system logs component */
const logEntries = [
  { text: '> Block #49281 appended', color: 'text-brand-primary' },
  { text: '0x7F9A...D491 verified', color: 'text-slate-500' },
  { text: '> Auth request: VOLUNTEER_09', color: 'text-brand-primary' },
  { text: 'Granted: permissions_sync', color: 'text-slate-500' },
  { text: '> Donor [REDACTED] tx_clear', color: 'text-green-600' },
  { text: '0x1B84...A122 routing to FUND_A', color: 'text-slate-500' },
  { text: '> Pulse check: OK', color: 'text-brand-primary' },
  { text: '> Syncing node sequence', color: 'text-slate-500' },
  { text: 'Protocol matching... OK', color: 'text-green-600' }
];

const AnimatedSystemLogs = () => {
  const [logs, setLogs] = useState<{ text: string, color: string }[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setLogs(prev => {
        const next = logEntries[index % logEntries.length];
        const newLogs = [...prev, next];
        return newLogs.length > 7 ? newLogs.slice(newLogs.length - 7) : newLogs;
      });
      setIndex(idx => idx + 1);
    }, 1200);
    return () => clearInterval(t);
  }, [index]);

  return (
    <div className="p-6 space-y-4 font-mono text-xs overflow-hidden flex-1 relative opacity-80 flex flex-col justify-end">
      {logs.map((log, i) => (
        <div key={index - logs.length + i} className={`${log.color} truncate`} style={{ animation: `slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) both` }}>
          {log.text}
          {i === logs.length - 1 && <span className="animate-pulse">_</span>}
        </div>
      ))}
      {logs.length === 0 && <div className="text-brand-primary animate-pulse">_</div>}
    </div>
  );
};

/* #9 Count-up Metric Component */
const CountUp = ({ end, suffix = '', prefix = '', decimals = 0, isZero = false }: { end: number, suffix?: string, prefix?: string, decimals?: number, isZero?: boolean }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (isZero) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let startTime = performance.now();
        const duration = 1500;
        const animate = (time: number) => {
          const progress = Math.min((time - startTime) / duration, 1);
          // easeOutExpo
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(easeProgress * end);
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    });
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, isZero]);
  
  if (isZero) return <span>ZERO</span>;
  return <span ref={nodeRef}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-space selection:bg-brand-primary selection:text-white relative overflow-hidden">
      {/* Structural Background Grid Lines - Architectural Blueprint Style */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)', backgroundSize: '2rem 2rem' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '10rem 10rem' }}></div>

      {/* Persistent Technical Border Frame */}
      <div className="fixed inset-4 pointer-events-none border border-black/20 z-40 hidden md:block"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex justify-between items-stretch h-16">
            <div className="flex items-center gap-4 border-l border-r border-black px-4">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <Heart className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-xl font-bold font-mono tracking-tighter text-black uppercase">
                <ScrambleText text="CLARION_UI" duration={1200} />
              </span>
            </div>
            <div className="flex items-stretch border-l border-black">
              <div className="hidden lg:flex items-center px-6 border-r border-black">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">STS_ACTIVE: <span className="text-green-600">VERIFIED</span></span>
              </div>
              <Link to="/login" className="bg-pink-500 text-white px-6 flex items-center justify-center text-sm font-mono font-bold hover:bg-pink-600 transition-colors uppercase tracking-widest group border-r border-black">
                <HeartHandshake className="w-4 h-4 mr-2" />
                DONATE
              </Link>
              <Link to="/login" className="bg-brand-primary text-black px-8 flex items-center justify-center text-sm font-mono font-bold hover:bg-orange-600 transition-colors uppercase tracking-widest group">
                SIGN_IN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Layout Grid Wrapper */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 pt-32 pb-20 relative z-10">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-black bg-white">
          
          {/* Main Hero Plaque */}
          <div className="lg:col-span-8 p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-black relative">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-brand-primary/10 border border-brand-primary text-brand-primary font-mono text-xs mb-8 uppercase tracking-widest font-bold">
              <span className="w-2 h-2 bg-brand-primary animate-pulse"></span>
              Ledger Indexed
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-sora tracking-tighter mb-8 leading-[1.0] text-black uppercase">
              Transparent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-700">Infrastructure.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed font-space">
              A cryptographically secure ledger for institutional philanthropy. Coordinate field volunteers, secure high-volume donor capital, and track child-wellness metrics within an immutable compliance environment.
            </p>
            <div className="mt-12 flex gap-0 w-max border border-black flex-col sm:flex-row">
              <Link to="/login" className="bg-black text-white px-8 py-4 text-sm font-mono font-bold hover:bg-slate-800 transition-colors uppercase tracking-wider text-center">
                Access Node
              </Link>
              <a href="#architecture" className="bg-white text-black px-8 py-4 text-sm font-mono hover:bg-slate-100 transition-colors uppercase tracking-wider text-center sm:border-l border-t sm:border-t-0 border-black">
                View Specs
              </a>
            </div>
          </div>

          {/* Technical Aside / Ticker */}
          <div className="lg:col-span-4 bg-slate-50 relative overflow-hidden hidden md:flex flex-col justify-between">
            <div className="p-6 border-b border-black">
              <h4 className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-1">[ SYSTEM_LOGS ]</h4>
              <p className="font-mono text-[10px] text-slate-500 uppercase">Live Hash verification</p>
            </div>
            
            <AnimatedSystemLogs />

            <div className="p-6 border-t border-black bg-black text-white">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="uppercase tracking-widest text-slate-400">NETWORK CAP</span>
                <span className="font-bold text-brand-primary">12.4ms PING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Specifications */}
        <div id="architecture" className="mt-8 border border-black bg-white">
          <div className="border-b border-black p-4 flex justify-between items-center bg-slate-50">
            <h2 className="text-sm font-mono font-bold text-black tracking-widest uppercase">[ ARCHITECTURE_SCHEMATICS ]</h2>
            <Key className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
            {[
              { icon: Users, title: 'Operational HR', desc: 'Immutable scheduling, time-tracking, and geolocation-based volunteer verification logic.' },
              { icon: ShieldCheck, title: 'Donor Ledgers', desc: 'View granular fund utilization with zero-knowledge verifiable audits down to the last rupee.' },
              { icon: Link2, title: 'Crypto Routing', desc: 'Internal smart-contracts dictate policy enforcement. No unauthorized fund displacement possible.' }
            ].map((feat, i) => (
              <div key={i} className="p-8 hover:bg-slate-50 transition-colors relative group">
                <div className="absolute top-4 right-4 text-slate-300 font-mono text-sm group-hover:text-brand-primary transition-colors font-bold uppercase tracking-widest">SEC_0{i+1}</div>
                <feat.icon className="w-8 h-8 text-black mb-12" />
                <h3 className="text-xl font-bold font-sora mb-3 text-black uppercase tracking-tight">{feat.title}</h3>
                <p className="text-slate-600 text-sm font-space leading-relaxed">
                  {feat.desc}
                </p>
                {/* Decorative blueprint lines */}
                <div className="mt-8 pt-4 border-t border-black/10 flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                  <span>MODULE_ACTIVE</span>
                  <span>[ <span className="text-green-500">√</span> ]</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dense Metrix Ticker */}
        <div className="mt-8 border border-black bg-white grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-black text-center">
          {[
            { end: 99.9, decimals: 1, suffix: '%', label: 'UPTIME_RELIABILITY' },
            { end: 100, decimals: 0, suffix: '+', label: 'COMPLIANCE_ZONES' },
            { end: 2, decimals: 0, suffix: 'M+', label: 'VERIFIED_ACTIONS' },
            { isZero: true, label: 'DATA_BREACHES' }
          ].map((stat, i) => (
            <div key={i} className="p-6 md:p-8 bg-white flex flex-col justify-center items-center group relative overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out z-0" />
               <div className="text-3xl md:text-4xl font-bold font-mono text-black mb-2 relative z-10 w-full group-hover:text-brand-primary transition-colors">
                  {stat.isZero ? (
                     <CountUp end={0} isZero={true} />
                  ) : (
                     <CountUp end={stat.end!} decimals={stat.decimals!} suffix={stat.suffix!} />
                  )}
               </div>
               <div className="text-xs font-mono text-slate-500 uppercase tracking-widest relative z-10">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Donation CTA Section ── */}
        <div className="mt-8 border border-black bg-white overflow-hidden">
          <div className="border-b border-black p-4 bg-pink-500 flex justify-between items-center">
            <h2 className="text-sm font-mono font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" /> [ SUPPORT_THE_MISSION ]
            </h2>
            <Heart className="w-4 h-4 text-white animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black">
            {/* Left: Message */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl font-bold font-sora text-black uppercase tracking-tight mb-6 leading-tight">
                Every Rupee<br />
                <span className="text-pink-500">Is Tracked.</span>
              </h3>
              <p className="text-sm font-space text-slate-600 leading-relaxed mb-8">
                CareConnect Foundation operates with full fiscal transparency. 
                Every donation is cryptographically recorded on our immutable audit ledger. 
                You'll receive an <strong>80G tax exemption certificate</strong> instantly.
              </p>
              <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest">
                <span className="px-3 py-1.5 bg-green-50 border-2 border-black text-black font-bold">✓ 80G CERTIFIED</span>
                <span className="px-3 py-1.5 bg-blue-50 border-2 border-black text-black font-bold">🔒 RAZORPAY SECURED</span>
                <span className="px-3 py-1.5 bg-orange-50 border-2 border-black text-black font-bold">⛓ BLOCKCHAIN AUDIT</span>
              </div>
            </div>

            {/* Right: Donate CTA */}
            <div className="p-8 md:p-12 bg-slate-50 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-pink-100 border-2 border-black flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-6">Sign in as a donor to contribute</p>
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {[500, 1000, 5000, 10000].map(a => (
                  <div key={a} className="px-4 py-2 border-2 border-black bg-white font-mono text-sm font-bold text-black">
                    ₹{a.toLocaleString()}
                  </div>
                ))}
              </div>
              <Link
                to="/login"
                className="w-full max-w-xs h-14 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] font-mono group"
              >
                <HeartHandshake size={18} className="group-hover:scale-110 transition-transform" />
                DONATE NOW
              </Link>
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-4">UPI • CARDS • NETBANKING • WALLETS</p>
            </div>
          </div>
        </div>

      </div>

      {/* Technical Footer */}
      <footer className="border-t border-black bg-white relative z-10 mt-12 pb-8 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="md:col-span-2 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black flex items-center justify-center">
                  <Heart className="w-4 h-4 text-brand-primary" />
                </div>
                <span className="text-lg font-bold font-mono text-black tracking-tighter uppercase">CLARION_SYS</span>
              </div>
              <p className="font-mono text-xs text-slate-500 uppercase max-w-sm leading-relaxed">
                Cryptographic institutional coordination software. 
                Strictly for authorized nodal deployment.
              </p>
           </div>
           
           <div className="font-mono text-xs flex flex-col gap-2 uppercase tracking-widest mt-8 md:mt-0">
              <strong className="text-black mb-2">SYSTEM_LINKS</strong>
              <Link to="/login" className="text-slate-500 hover:text-brand-primary transition-colors">STAFF_AUTH</Link>
              <Link to="/login" className="text-slate-500 hover:text-brand-primary transition-colors">DONOR_LEDGER</Link>
              <a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">API_DOCS</a>
           </div>

           <div className="font-mono text-xs flex flex-col justify-end text-left md:text-right uppercase tracking-widest text-slate-400 mt-8 md:mt-0">
              <p>SYS.TIME: {new Date().getFullYear()}</p>
              <p>v2.4.01_BUILD_PROD</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
