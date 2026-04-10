import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Link2, Users, ArrowRight, Globe, HeartHandshake, BarChart3, CheckCircle2 } from 'lucide-react';

/* Animated Count-up Component */
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
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(easeProgress * end);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    });
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, isZero]);
  
  if (isZero) return <span>Zero</span>;
  return <span ref={nodeRef}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-brand-text group-hover:text-brand-primary transition-colors duration-200">BeneTrack</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:flex items-center gap-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]">
                <HeartHandshake className="w-4 h-4" />
                Donate
              </Link>
              <Link to="/login" className="btn-primary text-sm group">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary-light rounded-full text-brand-primary text-xs font-medium mb-8 stagger-item">
              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse-dot" />
              Trusted by NGOs across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-brand-text stagger-item">
              Transparent NGO<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-teal-700">Management.</span>
            </h1>
            <p className="text-lg text-brand-muted max-w-xl leading-relaxed stagger-item">
              A secure platform for institutional philanthropy. Coordinate volunteers, manage donor funding, and track child-welfare outcomes — all with blockchain-backed transparency.
            </p>
            <div className="mt-10 flex gap-3 flex-col sm:flex-row stagger-item">
              <Link to="/login" className="btn-primary px-8 py-3.5 text-sm text-center">
                Get Started
              </Link>
              <a href="#features" className="btn-secondary px-8 py-3.5 text-sm text-center">
                Learn More
              </a>
            </div>
          </div>
          
          {/* Hero Visual — Trust Indicators */}
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-brand-primary/5 to-teal-50 rounded-2xl p-8 border border-brand-border">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: 'Blockchain Audit Trail', desc: 'Every action logged immutably' },
                  { icon: Users, label: 'Role-Based Access', desc: 'Admin, Staff, Volunteer, Donor' },
                  { icon: BarChart3, label: 'Real-Time Analytics', desc: 'Dashboards built for clarity' },
                  { icon: Globe, label: '80G Tax Certificates', desc: 'Instant digital generation' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-brand-border shadow-xs hover:shadow-card transition-all duration-300 group hover:-translate-y-1 stagger-item">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <item.icon size={20} className="text-brand-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-brand-text mb-1">{item.label}</h4>
                    <p className="text-xs text-brand-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { end: 99.9, decimals: 1, suffix: '%', label: 'Uptime' },
            { end: 100, decimals: 0, suffix: '+', label: 'Compliance Checks' },
            { end: 2, decimals: 0, suffix: 'M+', label: 'Verified Actions' },
            { isZero: true, label: 'Data Breaches' }
          ].map((stat, i) => (
            <div key={i} className="card text-center group stagger-item">
              <div className="text-3xl font-bold font-mono text-brand-text mb-1 group-hover:text-brand-primary transition-colors duration-200">
                {stat.isZero ? (
                   <CountUp end={0} isZero={true} />
                ) : (
                   <CountUp end={stat.end!} decimals={stat.decimals!} suffix={stat.suffix!} />
                )}
              </div>
              <p className="text-sm text-brand-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div id="features" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-text mb-3">Built for Trust</h2>
            <p className="text-brand-muted max-w-lg mx-auto">Core capabilities designed for NGO professionals who need clarity, compliance, and control.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Volunteer Coordination', desc: 'Schedule slots, track hours, and manage volunteer engagement with real-time dashboards.' },
              { icon: ShieldCheck, title: 'Donor Transparency', desc: 'Full fund-utilization tracking with blockchain-backed audit trails for every donation.' },
              { icon: Link2, title: 'Compliance Engine', desc: 'Automated policy enforcement, 80G certificate generation, and organizational reporting.' }
            ].map((feat, i) => (
              <div key={i} className="card hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 stagger-item">
                <div className="w-12 h-12 rounded-xl bg-brand-primary-light flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                  <feat.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-lg font-semibold text-brand-text mb-2">{feat.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Donation CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-brand-text mb-4 leading-tight">
                Every Rupee<br />
                <span className="text-rose-600">Is Tracked.</span>
              </h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-8">
                CareConnect Foundation operates with full fiscal transparency. 
                Every donation is cryptographically recorded on our immutable audit ledger. 
                You'll receive an <strong>80G tax exemption certificate</strong> instantly.
              </p>
              <div className="flex flex-wrap gap-3">
                {['80G Certified', 'Razorpay Secured', 'Blockchain Audit'].map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-brand-text border border-brand-border shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                    <CheckCircle2 size={12} className="text-green-600" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-10 md:p-14 flex flex-col justify-center items-center text-center bg-white/50">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-5">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <p className="text-sm text-brand-muted mb-5">Sign in as a donor to contribute</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {[500, 1000, 5000, 10000].map(a => (
                  <div key={a} className="px-4 py-2 border border-brand-border bg-white rounded-lg text-sm font-mono font-semibold text-brand-text hover:border-rose-300 hover:bg-rose-50 transition-all duration-200 cursor-default">
                    ₹{a.toLocaleString()}
                  </div>
                ))}
              </div>
              <Link
                to="/login"
                className="w-full max-w-xs rounded-xl py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] group"
              >
                <HeartHandshake size={18} className="group-hover:scale-110 transition-transform" />
                Donate Now
              </Link>
              <p className="text-xs text-brand-muted mt-4">UPI • Cards • Net Banking • Wallets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-brand-text">BeneTrack</span>
              </div>
              <p className="text-sm text-brand-muted max-w-sm leading-relaxed">
                Secure NGO management software with blockchain-backed transparency and compliance.
              </p>
           </div>
           
           <div className="text-sm flex flex-col gap-2">
              <strong className="text-brand-text mb-1">Quick Links</strong>
              <Link to="/login" className="text-brand-muted hover:text-brand-primary transition-colors">Staff Portal</Link>
              <Link to="/login" className="text-brand-muted hover:text-brand-primary transition-colors">Donor Portal</Link>
              <a href="#features" className="text-brand-muted hover:text-brand-primary transition-colors">Features</a>
           </div>

           <div className="text-sm text-brand-muted text-left md:text-right flex flex-col gap-1">
              <p>© {new Date().getFullYear()} BeneTrack</p>
              <p className="text-xs">Built with trust in mind.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
