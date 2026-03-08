import React from 'react';
import { useStore } from '../store';
import { getMonthlyEquivalent, formatCurrency, CATEGORY_COLORS } from '../utils';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { PieChart, TrendingUp, Activity, Target } from 'lucide-react';

export function Analytics() {
  const { subscriptions, settings } = useStore();
  const activeSubs = subscriptions.filter(s => s.isActive);

  // Monthly spend trend (mocking historical data based on current subs and start dates)
  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = date.toLocaleString('default', { month: 'short' });
    
    // Calculate cost for this month (if sub started before or during this month)
    const cost = activeSubs.reduce((acc, sub) => {
      const start = new Date(sub.startDate);
      if (start.getTime() <= date.getTime()) {
        return acc + getMonthlyEquivalent(sub.yourShare, sub.cycle);
      }
      return acc;
    }, 0);

    return { name: monthStr, cost };
  });

  // Category breakdown
  const categoryData = Object.entries(activeSubs.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + getMonthlyEquivalent(sub.yourShare, sub.cycle);
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  // Most expensive
  const expensiveData = [...activeSubs]
    .sort((a, b) => getMonthlyEquivalent(b.yourShare, b.cycle) - getMonthlyEquivalent(a.yourShare, a.cycle))
    .slice(0, 5)
    .map(s => ({ name: s.name, cost: getMonthlyEquivalent(s.yourShare, s.cycle), color: s.color }));

  const totalSpent = activeSubs.reduce((acc, sub) => {
    const monthsActive = Math.max(1, (new Date().getTime() - new Date(sub.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return acc + (getMonthlyEquivalent(sub.yourShare, sub.cycle) * monthsActive);
  }, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-slate-400">Deep dive into your spending habits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 col-span-1 md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-sans font-semibold flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> 6-Month Trend
            </h2>
            <div className="text-left md:text-right">
              <p className="text-sm text-slate-400">Total Tracked Spend</p>
              <p className="text-2xl font-mono font-bold text-primary">{formatCurrency(totalSpent, settings.defaultCurrency)}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0f1e', borderColor: '#1a1d35', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#8b5cf6' }}
                  formatter={(value: number) => formatCurrency(value, settings.defaultCurrency)}
                />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#0d0f1e', stroke: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-sans font-semibold mb-6 flex items-center gap-2">
            <PieChart className="text-secondary" size={20} /> Category Breakdown
          </h2>
          <div className="h-[250px] w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0f1e', borderColor: '#1a1d35', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value, settings.defaultCurrency)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">No data available</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {categoryData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#64748b' }}></div>
                <span className="text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-sans font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-danger" size={20} /> Most Expensive
          </h2>
          <div className="h-[250px] w-full">
            {expensiveData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expensiveData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1d35" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0d0f1e', borderColor: '#1a1d35', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value, settings.defaultCurrency)}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={20}>
                    {expensiveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400">No data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 col-span-1 md:col-span-2">
          <h2 className="text-xl font-sans font-semibold mb-6 flex items-center gap-2">
            <Target className="text-safe" size={20} /> Usage Efficiency Matrix
          </h2>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[400px] relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-border absolute"></div>
              <div className="h-full w-px bg-border absolute"></div>
            </div>
            
            <div className="bg-safe/5 rounded-tl-2xl p-4 border-l border-t border-safe/20 relative">
              <span className="absolute top-2 left-2 text-xs font-bold text-safe/50 uppercase tracking-widest">Keep</span>
              <div className="flex flex-wrap gap-2 mt-6">
                {activeSubs.filter(s => (s.usageRating === 'High' || s.usageRating === 'Medium') && getMonthlyEquivalent(s.yourShare, s.cycle) < 500).map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg" style={{ backgroundColor: s.color, color: '#fff' }} title={s.name}>{s.name.charAt(0)}</div>
                ))}
              </div>
            </div>
            
            <div className="bg-warning/5 rounded-tr-2xl p-4 border-r border-t border-warning/20 relative">
              <span className="absolute top-2 right-2 text-xs font-bold text-warning/50 uppercase tracking-widest">Evaluate</span>
              <div className="flex flex-wrap gap-2 mt-6">
                {activeSubs.filter(s => (s.usageRating === 'High' || s.usageRating === 'Medium') && getMonthlyEquivalent(s.yourShare, s.cycle) >= 500).map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg" style={{ backgroundColor: s.color, color: '#fff' }} title={s.name}>{s.name.charAt(0)}</div>
                ))}
              </div>
            </div>
            
            <div className="bg-secondary/5 rounded-bl-2xl p-4 border-l border-b border-secondary/20 relative">
              <span className="absolute bottom-2 left-2 text-xs font-bold text-secondary/50 uppercase tracking-widest">Consider</span>
              <div className="flex flex-wrap gap-2 mt-6">
                {activeSubs.filter(s => (s.usageRating === 'Low' || s.usageRating === 'Unused') && getMonthlyEquivalent(s.yourShare, s.cycle) < 500).map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg" style={{ backgroundColor: s.color, color: '#fff' }} title={s.name}>{s.name.charAt(0)}</div>
                ))}
              </div>
            </div>
            
            <div className="bg-danger/5 rounded-br-2xl p-4 border-r border-b border-danger/20 relative">
              <span className="absolute bottom-2 right-2 text-xs font-bold text-danger/50 uppercase tracking-widest">Cancel</span>
              <div className="flex flex-wrap gap-2 mt-6">
                {activeSubs.filter(s => (s.usageRating === 'Low' || s.usageRating === 'Unused') && getMonthlyEquivalent(s.yourShare, s.cycle) >= 500).map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg" style={{ backgroundColor: s.color, color: '#fff' }} title={s.name}>{s.name.charAt(0)}</div>
                ))}
              </div>
            </div>
            
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500 font-medium tracking-widest uppercase">Usage</div>
            <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-xs text-slate-500 font-medium tracking-widest uppercase">Cost</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
