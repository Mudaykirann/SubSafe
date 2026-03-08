import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-sans font-bold mb-2">{title}</h2>
              <p className="text-slate-400 text-sm">{message}</p>
            </div>
            <div className="p-4 bg-white/5 border-t border-border flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
                {cancelText}
              </button>
              <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-lg font-medium text-sm bg-danger text-white hover:bg-danger/90 transition-colors">
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
