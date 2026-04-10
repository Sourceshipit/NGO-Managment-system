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
  danger:  { bg: 'bg-red-600',    text: 'text-white',   hover: 'hover:bg-red-700',  iconBg: 'bg-red-100',   iconColor: 'text-red-600' },
  warning: { bg: 'bg-amber-500',  text: 'text-white',   hover: 'hover:bg-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  info:    { bg: 'bg-blue-600',   text: 'text-white',   hover: 'hover:bg-blue-700',  iconBg: 'bg-blue-100',  iconColor: 'text-blue-600' },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${v.iconBg} rounded-xl flex items-center justify-center`}>
                  <AlertTriangle size={20} className={v.iconColor} />
                </div>
                <h3 className="text-base font-semibold text-brand-text">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-4">
              <p className="text-sm text-brand-muted leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-brand-border">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 rounded-lg py-2.5 ${v.bg} ${v.text} text-sm font-semibold ${v.hover} transition-all duration-200 shadow-sm disabled:opacity-50`}
              >
                {loading ? 'Processing…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
