import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const VARIANT_MAP = {
  danger:  { bg: 'bg-red-500',    text: 'text-white',   hover: 'hover:bg-red-600' },
  warning: { bg: 'bg-amber-500',  text: 'text-black',   hover: 'hover:bg-amber-600' },
  info:    { bg: 'bg-blue-500',   text: 'text-white',   hover: 'hover:bg-blue-600' },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'CONFIRM_ACTION',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'CONFIRM',
  variant = 'danger',
  loading = false,
}) => {
  const v = VARIANT_MAP[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${v.bg} border-2 border-black flex items-center justify-center`}>
                  <AlertTriangle size={16} className={v.text} />
                </div>
                <h3 className="text-xs font-bold text-black uppercase tracking-widest font-mono">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 border-2 border-black flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-xs font-mono text-slate-600 leading-relaxed uppercase tracking-wider">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t-2 border-black bg-slate-50">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 border-2 border-black text-xs font-bold uppercase tracking-widest font-mono hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 border-2 border-black ${v.bg} ${v.text} text-xs font-bold uppercase tracking-widest font-mono ${v.hover} transition-colors shadow-[3px_3px_0_rgba(0,0,0,1)] disabled:opacity-50`}
              >
                {loading ? 'PROCESSING…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
