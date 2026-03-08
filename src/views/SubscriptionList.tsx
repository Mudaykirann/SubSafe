import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { formatCurrency, getDaysUntilRenewal } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, LayoutGrid, List as ListIcon, MoreVertical, Edit2, Trash2, PauseCircle, PlayCircle, Grid } from 'lucide-react';
import { cn } from '../components/Sidebar';
import { AddEditDrawer } from '../components/AddEditDrawer';
import { Subscription } from '../types';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

export function SubscriptionList() {
  const { subscriptions, settings, deleteSubscription, updateSubscription, setSelectedSubscriptionId } = useStore();
  const { toast } = useToast();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'cost' | 'name' | 'date'>('date');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>(undefined);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setEditingSub(undefined);
        setIsDrawerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsDrawerOpen(true);
  };

  const filtered = subscriptions
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => categoryFilter === 'All' || s.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'cost') return b.yourShare - a.yourShare;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime();
    });

  const categories = ['All', ...Array.from(new Set(subscriptions.map(s => s.category)))];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Subscriptions</h1>
          <p className="text-slate-400">Manage your recurring expenses.</p>
        </div>
        <button 
          onClick={() => { setEditingSub(undefined); setIsDrawerOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          <Plus size={20} /> Add Subscription
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-2xl border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search subscriptions..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl p-1">
            <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-colors", view === 'grid' ? "bg-card text-primary" : "text-slate-400 hover:text-slate-200")}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView('table')} className={cn("p-2 rounded-lg transition-colors", view === 'table' ? "bg-card text-primary" : "text-slate-400 hover:text-slate-200")}>
              <ListIcon size={18} />
            </button>
          </div>
          
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-bg border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/50 appearance-none"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-bg border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/50 appearance-none"
          >
            <option value="date">Sort by Date</option>
            <option value="cost">Sort by Cost</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Grid size={40} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No subscriptions found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your filters or add a new one.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(sub => (
              <motion.div 
                layout 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                key={sub.id} 
                onClick={() => setSelectedSubscriptionId(sub.id)}
                className={cn("glass glass-hover rounded-2xl p-6 relative group cursor-pointer", !sub.isActive && "opacity-50 grayscale")}
              >
                {!sub.isActive && <div className="absolute top-4 right-4 bg-slate-800 text-xs px-2 py-1 rounded-md font-medium">Paused</div>}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg" style={{ backgroundColor: `${sub.color}20`, color: sub.color, boxShadow: `0 0 20px ${sub.color}20` }}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-lg">{sub.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: `${sub.color}50`, color: sub.color, backgroundColor: `${sub.color}10` }}>
                        {sub.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => updateSubscription(sub.id, { isActive: !sub.isActive })} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                      {sub.isActive ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                    </button>
                    <button onClick={() => handleEdit(sub)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => setDeletingSubId(sub.id)} className="p-1.5 hover:bg-danger/20 rounded-lg text-slate-400 hover:text-danger transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Cost</p>
                      <div className="font-mono text-2xl font-bold">{formatCurrency(sub.yourShare, sub.currency)}<span className="text-sm text-slate-500 font-sans font-normal">/{sub.cycle.charAt(0)}</span></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 mb-1">Next Bill</p>
                      <div className="font-mono">{new Date(sub.nextRenewal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
                    <span className={cn("px-2 py-1 rounded-md", 
                      sub.usageRating === 'High' ? 'bg-safe/10 text-safe' : 
                      sub.usageRating === 'Medium' ? 'bg-secondary/10 text-secondary' : 
                      'bg-warning/10 text-warning'
                    )}>
                      {sub.usageRating} Usage
                    </span>
                    {sub.isShared && <span className="text-slate-400">Shared ({sub.sharedWith})</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="p-4 font-medium text-slate-400">Name</th>
                <th className="p-4 font-medium text-slate-400">Cost</th>
                <th className="p-4 font-medium text-slate-400">Cycle</th>
                <th className="p-4 font-medium text-slate-400">Next Renewal</th>
                <th className="p-4 font-medium text-slate-400">Usage</th>
                <th className="p-4 font-medium text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => (
                <tr 
                  key={sub.id} 
                  onClick={() => setSelectedSubscriptionId(sub.id)}
                  className={cn("border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer", !sub.isActive && "opacity-50")}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: `${sub.color}20`, color: sub.color }}>
                        {sub.name.charAt(0)}
                      </div>
                      <span className="font-medium">{sub.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono">{formatCurrency(sub.yourShare, sub.currency)}</td>
                  <td className="p-4 capitalize">{sub.cycle}</td>
                  <td className="p-4 font-mono">{new Date(sub.nextRenewal).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-1 rounded-md text-xs", 
                      sub.usageRating === 'High' ? 'bg-safe/10 text-safe' : 
                      sub.usageRating === 'Medium' ? 'bg-secondary/10 text-secondary' : 
                      'bg-warning/10 text-warning'
                    )}>
                      {sub.usageRating}
                    </span>
                  </td>
                  <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateSubscription(sub.id, { isActive: !sub.isActive })} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        {sub.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                      </button>
                      <button onClick={() => handleEdit(sub)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeletingSubId(sub.id)} className="p-1.5 hover:bg-danger/20 rounded-lg text-slate-400 hover:text-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddEditDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        subscriptionToEdit={editingSub} 
      />

      <ConfirmModal 
        isOpen={!!deletingSubId}
        onClose={() => setDeletingSubId(null)}
        onConfirm={() => {
          if (deletingSubId) {
            deleteSubscription(deletingSubId);
            toast('Subscription deleted', 'info');
            setDeletingSubId(null);
          }
        }}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </motion.div>
  );
}
