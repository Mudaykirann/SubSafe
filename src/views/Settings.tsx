import React, { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Download, Upload, Trash2, Mail, CheckCircle2, AlertTriangle, Copy, LogOut, User } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

export function Settings() {
  const { subscriptions, settings, updateSettings, clearAllData, importData, currentUser, setCurrentUser } = useStore();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [selectedSubForCancel, setSelectedSubForCancel] = useState('');
  const [cancelEmail, setCancelEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const data = { subscriptions, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subsafe-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported successfully', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
        toast('Data imported successfully!', 'success');
      } catch (error) {
        toast('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateEmail = async () => {
    if (!selectedSubForCancel) return;
    const sub = subscriptions.find(s => s.id === selectedSubForCancel);
    if (!sub) return;

    setIsGenerating(true);
    setCancelEmail('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Write a polite but firm email to cancel my ${sub.name} subscription. 
      My name is [Your Name]. The subscription costs ${sub.currency}${sub.cost} per ${sub.cycle}.
      I no longer need the service. Please confirm the cancellation and ensure no further charges are made.
      Keep it professional, concise, and ready to send. Do not include placeholders other than [Your Name].`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setCancelEmail(response.text || 'Failed to generate email.');
    } catch (error) {
      console.error(error);
      setCancelEmail('Error generating email. Please check your API key or try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cancelEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-slate-400">Manage your app preferences and data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-sans font-semibold flex items-center gap-2 border-b border-border pb-4">
            <SettingsIcon className="text-primary" size={20} /> Preferences
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Default Currency</label>
            <select 
              value={settings.defaultCurrency}
              onChange={(e) => updateSettings({ defaultCurrency: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 appearance-none"
            >
              <option value="₹">₹ (INR)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Account</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-border rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                </div>
              </div>
              <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center gap-2 text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-xl px-4 py-3 transition-colors">
                <LogOut size={18} /> Log out
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Data Management</h3>
            <div className="flex flex-col gap-3">
              <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-border rounded-xl px-4 py-3 transition-colors">
                <Download size={18} /> Export Data (JSON)
              </button>
              
              <label className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-border rounded-xl px-4 py-3 transition-colors cursor-pointer">
                <Upload size={18} /> Import Data
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <button onClick={() => setIsClearing(true)} className="w-full flex items-center justify-center gap-2 text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-xl px-4 py-3 transition-colors">
                <Trash2 size={18} /> Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-sans font-semibold flex items-center gap-2 border-b border-border pb-4">
            <Mail className="text-secondary" size={20} /> Cancel Helper
          </h2>
          <p className="text-sm text-slate-400">
            Select a subscription to generate a professional cancellation email using AI.
          </p>

          <div>
            <select 
              value={selectedSubForCancel}
              onChange={(e) => setSelectedSubForCancel(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-secondary/50 appearance-none mb-4"
            >
              <option value="">Select a subscription...</option>
              {subscriptions.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.currency}{s.cost}/{s.cycle})</option>
              ))}
            </select>

            <button 
              onClick={handleGenerateEmail}
              disabled={!selectedSubForCancel || isGenerating}
              className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-bg font-semibold rounded-xl px-4 py-3 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><div className="w-5 h-5 border-2 border-bg/30 border-t-bg rounded-full animate-spin"></div> Generating...</>
              ) : (
                <><Mail size={18} /> Generate Email</>
              )}
            </button>
          </div>

          <AnimatePresence>
            {cancelEmail && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-border overflow-hidden">
                <div className="relative">
                  <textarea 
                    readOnly 
                    value={cancelEmail} 
                    className="w-full h-48 bg-bg border border-border rounded-xl p-4 text-sm font-sans resize-none focus:outline-none focus:border-secondary/50"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-2 bg-card border border-border rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-safe" /> : <Copy size={16} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isClearing}
        onClose={() => setIsClearing(false)}
        onConfirm={() => {
          clearAllData();
          setIsClearing(false);
          toast('All data cleared', 'info');
        }}
        title="Clear All Data"
        message="Are you sure you want to delete all your subscriptions and settings? This action cannot be undone."
        confirmText="Yes, Delete All"
        cancelText="Cancel"
      />
    </motion.div>
  );
}
