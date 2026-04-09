import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Loader2, CheckCircle, Sparkles, CreditCard, Zap } from 'lucide-react';
import { paymentsAPI } from '../../api/client';
import type { RazorpayPaymentSuccess } from '../../types';
import toast from 'react-hot-toast';

interface DonateNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PROJECTS = [
  'Education Initiative',
  'Healthcare Program',
  'Rural Development',
  'Women Empowerment',
  'Child Welfare',
  'Disaster Relief',
];

export default function DonateNowModal({ isOpen, onClose, onSuccess }: DonateNowModalProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [amount, setAmount] = useState('');
  const [project, setProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const presetAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const resetForm = () => {
    setStep('form');
    setAmount('');
    setProject('');
    setDonationId(null);
    setPaymentId(null);
  };

  const handleClose = () => {
    if (step === 'processing') return; // Don't close during payment
    resetForm();
    onClose();
  };

  const openRazorpayCheckout = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) { toast.error('Enter a valid amount'); return; }
    if (!project) { toast.error('Select a project'); return; }

    setLoading(true);

    try {
      // Step 1: Create Razorpay order via our backend
      const order = await paymentsAPI.createOrder({
        amount: numAmount,
        project,
      });

      setLoading(false);

      // Step 2: Check if Razorpay SDK is loaded
      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment SDK not loaded. Please refresh the page.');
        return;
      }

      // Step 3: Open Razorpay Checkout popup
      setStep('processing');

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'CareConnect Foundation',
        description: `Donation to ${project}`,
        order_id: order.order_id,
        prefill: {
          name: order.donor_name,
          email: order.donor_email,
          contact: order.donor_phone,
        },
        theme: {
          color: '#EC4899', // Pink to match the brutalist donation theme
        },
        handler: async (response: RazorpayPaymentSuccess) => {
          // Step 4: Verify payment on our backend
          try {
            const result = await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              project,
              amount: numAmount,
            });

            setDonationId(result.donation_id);
            setPaymentId(response.razorpay_payment_id);
            setStep('success');
            onSuccess?.();
            toast.success('Payment successful!');
          } catch (err: any) {
            toast.error(err?.response?.data?.detail ?? 'Payment verification failed');
            setStep('form');
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay popup without paying
            setStep('form');
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      });

      rzp.open();
    } catch (err: any) {
      setLoading(false);
      setStep('form');
      toast.error(err?.response?.data?.detail ?? 'Failed to create payment order');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white border-2 border-black shadow-[12px_12px_0_rgba(0,0,0,0.15)] w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="p-2.5 border-b-2 border-black bg-pink-500 flex justify-between items-center">
          <span className="text-xs font-bold text-white uppercase tracking-widest pl-2 flex items-center gap-2 font-mono">
            <Heart size={14} /> {step === 'form' ? 'DONATE_NOW' : step === 'processing' ? 'PROCESSING_PAYMENT' : 'DONATION_CONFIRMED'}
          </span>
          <button
            onClick={handleClose}
            disabled={step === 'processing'}
            className="w-7 h-7 flex items-center justify-center text-black hover:bg-black hover:text-white border border-black bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {step === 'form' ? (
          <div className="p-8 space-y-6">
            {/* Razorpay badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-2 border-black">
              <Zap size={14} className="text-blue-600" />
              <span className="text-[10px] font-bold tracking-widest text-black uppercase font-mono">
                SECURED BY RAZORPAY — UPI • CARDS • NETBANKING • WALLETS
              </span>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] font-bold tracking-widest text-black uppercase mb-2 block font-mono">AMOUNT (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border-2 border-black text-black text-lg font-mono font-bold placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter amount"
                min="1"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {presetAmounts.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase font-mono border-2 border-black transition-all ${
                      amount === String(a)
                        ? 'bg-pink-500 text-white shadow-[2px_2px_0_#000]'
                        : 'bg-white text-black hover:bg-pink-50'
                    }`}
                  >
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="text-[10px] font-bold tracking-widest text-black uppercase mb-2 block font-mono">PROJECT</label>
              <select
                value={project}
                onChange={e => setProject(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border-2 border-black text-sm font-mono font-bold focus:outline-none focus:border-pink-500 transition-colors cursor-pointer uppercase"
              >
                <option value="">Select a project</option>
                {PROJECTS.map(p => (<option key={p} value={p}>{p.toUpperCase()}</option>))}
              </select>
            </div>

            {/* Pay with Razorpay Button */}
            <button
              onClick={openRazorpayCheckout}
              disabled={loading}
              className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-60 border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] font-mono group"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> CREATING ORDER...</>
              ) : (
                <><CreditCard size={18} className="group-hover:scale-110 transition-transform" /> PAY ₹{amount ? parseFloat(amount).toLocaleString() : '...'} WITH RAZORPAY</>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">🔒 256-BIT SSL</span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">✓ PCI DSS</span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">⚡ INSTANT</span>
            </div>
          </div>
        ) : step === 'processing' ? (
          /* ── Processing Step ── */
          <div className="p-12 text-center">
            <div className="w-20 h-20 border-2 border-black mx-auto flex items-center justify-center mb-6 bg-pink-50 relative">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
              {/* Pulse ring */}
              <div className="absolute inset-0 border-2 border-pink-400 animate-ping opacity-30" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-black mb-2 font-mono">
              PROCESSING PAYMENT
            </h3>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              Complete payment in the Razorpay window.
              <br />Do not close this page.
            </p>
          </div>
        ) : (
          /* ── Success Step ── */
          <div className="p-8 text-center relative overflow-hidden">
            {/* CSS Confetti animation */}
            <div className="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    '--x': `${Math.random() * 100}%`,
                    '--delay': `${Math.random() * 2}s`,
                    '--color': ['#F97316', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i % 6],
                    '--size': `${4 + Math.random() * 6}px`,
                    '--rotation': `${Math.random() * 360}deg`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-green-100 border-2 border-black mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-black mb-2 font-mono">
                THANK YOU!
              </h3>
              <p className="text-sm font-mono text-slate-500 uppercase tracking-wide mb-4">
                Your donation of <span className="text-pink-600 font-black">₹{parseFloat(amount).toLocaleString()}</span> to{' '}
                <span className="text-black font-bold">{project}</span> is confirmed.
              </p>

              {paymentId && (
                <div className="inline-block px-4 py-2 bg-slate-50 border-2 border-black font-mono text-xs font-bold tracking-widest uppercase mb-2">
                  <Zap size={12} className="inline mr-2 text-blue-500" />
                  RAZORPAY_ID: {paymentId.slice(0, 18)}...
                </div>
              )}

              {donationId && (
                <div className="inline-block px-4 py-2 bg-slate-50 border-2 border-black font-mono text-xs font-bold tracking-widest uppercase mb-6 ml-2">
                  <Sparkles size={12} className="inline mr-2 text-pink-500" />
                  TXN_ID: DON-{donationId.toString().padStart(6, '0')}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full h-11 bg-black hover:bg-pink-500 text-white font-bold tracking-widest text-xs uppercase transition-all border-2 border-black font-mono mt-4"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline confetti styles */}
      <style>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          left: var(--x);
          width: var(--size);
          height: var(--size);
          background-color: var(--color);
          animation: confettiFall 3s var(--delay) ease-in forwards;
          transform: rotate(var(--rotation));
        }
        @keyframes confettiFall {
          0% { top: -10px; opacity: 1; transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(90deg) translateX(15px); }
          50% { transform: rotate(180deg) translateX(-15px); opacity: 1; }
          75% { transform: rotate(270deg) translateX(10px); }
          100% { top: 100%; opacity: 0; transform: rotate(360deg) translateX(-5px); }
        }
      `}</style>
    </div>,
    document.body
  );
}
