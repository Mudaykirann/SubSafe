import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, Users, Tag, AlertTriangle, CheckCircle2, Mail, Copy } from 'lucide-react';
import { Subscription } from '../types';
import { formatCurrency, getDaysUntilRenewal, getMonthlyEquivalent } from '../utils';
import { useStore } from '../store';
import { GoogleGenAI } from '@google/genai';
import { cn } from './Sidebar';
import { useToast } from './Toast';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export function DetailModal({ isOpen, onClose, subscription }: DetailModalProps) {
  const { settings } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'cancel'>('overview');
  const [cancelEmail, setCancelEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!subscription) return null;

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setCancelEmail('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Write a polite but firm email to cancel my ${subscription.name} subscription. 
      My name is [Your Name]. The subscription costs ${subscription.currency}${subscription.cost} per ${subscription.cycle}.
      I no longer need the service. Please confirm the cancellation and ensure no further charges are made.
      Keep it professional, concise, and ready to send. Do not include placeholders other than [Your Name].`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setCancelEmail(response.text || 'Failed to generate email.');
      toast('Email generated successfully', 'success');
    } catch (error) {
      console.error(error);
      setCancelEmail('Error generating email. Please check your API key or try again later.');
      toast('Failed to generate email', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cancelEmail);
    setCopied(true);
    toast('Copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const daysUntil = getDaysUntilRenewal(subscription.nextRenewal);
  const monthlyEq = getMonthlyEquivalent(subscription.yourShare, subscription.cycle);

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="relative h-32" style={{ backgroundColor: `${subscription.color}20` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-10">
                <X size={20} />
              </button>
              <div className="absolute -bottom-10 left-6 flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl border-4 border-card" style={{ backgroundColor: subscription.color, color: '#fff' }}>
                  {subscription.name.charAt(0)}
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-sans font-bold text-white leading-none">{subscription.name}</h2>
                  <span className="text-sm font-medium opacity-80" style={{ color: subscription.color }}>{subscription.category}</span>
                </div>
              </div>
            </div>

            <div className="pt-14 px-6 pb-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex border-b border-border mb-6">
                {['overview', 'history', 'cancel'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-colors relative",
                      activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-border">
                      <p className="text-sm text-slate-400 mb-1">Cost</p>
                      <div className="font-mono text-2xl font-bold">{formatCurrency(subscription.yourShare, subscription.currency)}<span className="text-sm text-slate-500 font-sans font-normal">/{subscription.cycle.charAt(0)}</span></div>
                      {subscription.isShared && <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency(subscription.cost, subscription.currency)}</p>}
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-border">
                      <p className="text-sm text-slate-400 mb-1">Next Renewal</p>
                      <div className="font-mono text-xl font-bold">{new Date(subscription.nextRenewal).toLocaleDateString()}</div>
                      <p className={cn("text-xs mt-1 font-medium", daysUntil <= 3 ? "text-danger" : daysUntil <= 7 ? "text-warning" : "text-safe")}>
                        {daysUntil === 0 ? 'Today' : `In ${daysUntil} days`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5">
                      <Calendar className="text-slate-400" size={18} />
                      <span className="text-slate-400 w-24">Started</span>
                      <span className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5">
                      <CreditCard className="text-slate-400" size={18} />
                      <span className="text-slate-400 w-24">Payment</span>
                      <span className="font-medium">{subscription.paymentMethod || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5">
                      <Tag className="text-slate-400" size={18} />
                      <span className="text-slate-400 w-24">Usage</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", 
                        subscription.usageRating === 'High' ? 'bg-safe/20 text-safe' : 
                        subscription.usageRating === 'Medium' ? 'bg-secondary/20 text-secondary' : 
                        'bg-warning/20 text-warning'
                      )}>{subscription.usageRating}</span>
                    </div>
                    {subscription.isShared && (
                      <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5">
                        <Users className="text-slate-400" size={18} />
                        <span className="text-slate-400 w-24">Shared With</span>
                        <span className="font-medium">{subscription.sharedWith} people</span>
                      </div>
                    )}
                  </div>

                  {subscription.notes && (
                    <div className="p-4 rounded-xl bg-white/5 border border-border">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Notes</h4>
                      <p className="text-sm whitespace-pre-wrap">{subscription.notes}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-sm text-slate-400 mb-4">Estimated past payments based on start date.</p>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const date = new Date(subscription.nextRenewal);
                      if (subscription.cycle === 'monthly') date.setMonth(date.getMonth() - (i + 1));
                      else if (subscription.cycle === 'yearly') date.setFullYear(date.getFullYear() - (i + 1));
                      else if (subscription.cycle === 'weekly') date.setDate(date.getDate() - ((i + 1) * 7));
                      
                      if (date.getTime() < new Date(subscription.startDate).getTime()) return null;

                      return (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-card text-slate-500 group-[.is-active]:text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-white/5 shadow">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-slate-200">{formatCurrency(subscription.yourShare, subscription.currency)}</div>
                              <time className="font-mono text-xs font-medium text-slate-500">{date.toLocaleDateString()}</time>
                            </div>
                            <div className="text-slate-400 text-xs">Payment processed</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'cancel' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="p-4 rounded-xl border border-warning/30 bg-warning/10">
                    <h3 className="text-warning font-medium flex items-center gap-2 mb-2">
                      <AlertTriangle size={18} /> Cancel Subscription
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                      Cancelling this subscription will save you <strong className="text-white">{formatCurrency(monthlyEq, settings.defaultCurrency)}/mo</strong>.
                    </p>
                    <button 
                      onClick={handleGenerateEmail}
                      disabled={isGenerating}
                      className="w-full bg-warning hover:bg-warning/90 disabled:opacity-50 text-bg font-semibold rounded-lg px-4 py-2.5 transition-all flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <><div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin"></div> Generating...</>
                      ) : (
                        <><Mail size={18} /> Generate Cancellation Email</>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {cancelEmail && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative overflow-hidden">
                        <textarea 
                          readOnly 
                          value={cancelEmail} 
                          className="w-full h-48 bg-bg border border-border rounded-xl p-4 text-sm font-sans resize-none focus:outline-none focus:border-warning/50"
                        />
                        <button 
                          onClick={copyToClipboard}
                          className="absolute top-2 right-2 p-2 bg-card border border-border rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Copy to clipboard"
                        >
                          {copied ? <CheckCircle2 size={16} className="text-safe" /> : <Copy size={16} />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
