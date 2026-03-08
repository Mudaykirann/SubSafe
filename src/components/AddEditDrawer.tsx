import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Subscription, Cycle, Category, UsageRating } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, IndianRupee, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils';
import { cn } from './Sidebar';
import { useToast } from './Toast';

interface AddEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: Subscription;
}

export function AddEditDrawer({ isOpen, onClose, subscriptionToEdit }: AddEditDrawerProps) {
  const { addSubscription, updateSubscription, settings } = useStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    cost: 0,
    currency: settings.defaultCurrency,
    cycle: 'monthly',
    category: 'Other',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    usageRating: 'Medium',
    isShared: false,
    sharedWith: 1,
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (subscriptionToEdit) {
      setFormData({
        ...subscriptionToEdit,
        startDate: subscriptionToEdit.startDate.split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        cost: 0,
        currency: settings.defaultCurrency,
        cycle: 'monthly',
        category: 'Other',
        startDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        usageRating: 'Medium',
        isShared: false,
        sharedWith: 1,
        notes: '',
        isActive: true,
      });
    }
  }, [subscriptionToEdit, isOpen, settings.defaultCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      startDate: new Date(formData.startDate as string).toISOString(),
    } as Omit<Subscription, 'id' | 'nextRenewal' | 'color' | 'yourShare'>;

    if (subscriptionToEdit) {
      updateSubscription(subscriptionToEdit.id, dataToSave);
      toast('Subscription updated successfully', 'success');
    } else {
      addSubscription(dataToSave);
      toast('Subscription added successfully', 'success');
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-sans font-bold tracking-tight">
                {subscriptionToEdit ? 'Edit Subscription' : 'Add Subscription'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="sub-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Netflix"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>

                {/* Cost & Currency */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Cost</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                        {formData.currency}
                      </span>
                      <input
                        required
                        type="number"
                        name="cost"
                        min="0"
                        step="0.01"
                        value={formData.cost !== undefined ? formData.cost : ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 font-mono"
                      />
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 appearance-none text-center"
                    >
                      <option value="₹">₹</option>
                      <option value="$">$</option>
                      <option value="€">€</option>
                      <option value="£">£</option>
                    </select>
                  </div>
                </div>

                {/* Cycle & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Billing Cycle</label>
                    <select
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleChange}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 appearance-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 appearance-none"
                    >
                      {Object.keys(CATEGORY_COLORS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start Date & Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="date"
                        name="startDate"
                        value={formData.startDate as string}
                        onChange={handleChange}
                        className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Payment Method</label>
                    <input
                      type="text"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      placeholder="e.g. Credit Card"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-sm"
                    />
                  </div>
                </div>

                {/* Usage Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Usage Rating</label>
                  <div className="flex bg-bg rounded-xl p-1 border border-border">
                    {['High', 'Medium', 'Low', 'Unused'].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, usageRating: rating as UsageRating }))}
                        className={cn(
                          "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                          formData.usageRating === rating 
                            ? "bg-card text-primary shadow-sm border border-border" 
                            : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shared Subscription */}
                <div className="p-4 rounded-xl border border-border bg-bg/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Shared Subscription</h4>
                      <p className="text-xs text-slate-400">Split the cost with others</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="isShared" 
                        checked={formData.isShared} 
                        onChange={handleChange} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <AnimatePresence>
                    {formData.isShared && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-border flex items-center gap-4 overflow-hidden">
                        <div className="flex-1">
                          <label className="block text-xs text-slate-400 mb-1">Split with (total people)</label>
                          <input
                            type="number"
                            name="sharedWith"
                            min="2"
                            value={formData.sharedWith}
                            onChange={handleChange}
                            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <label className="block text-xs text-slate-400 mb-1">Your Share</label>
                          <div className="font-mono font-bold text-primary text-lg">
                            {formData.currency}{((formData.cost || 0) / (formData.sharedWith || 1)).toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional details..."
                    rows={3}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 resize-none text-sm"
                  />
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-border bg-card">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-medium border border-border hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="sub-form"
                  className="flex-1 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
