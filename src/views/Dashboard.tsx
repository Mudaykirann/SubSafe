import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { getMonthlyEquivalent, formatCurrency, getDaysUntilRenewal } from '../utils';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Calendar, CheckCircle2, PieChart } from 'lucide-react';
import { cn } from '../components/Sidebar';

export function Dashboard() {
  const { subscriptions, settings, setSelectedSubscriptionId } = useStore();
  const [animatedMonthly, setAnimatedMonthly] = useState(0);
  const [animatedYearly, setAnimatedYearly] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);

  const activeSubs = subscriptions.filter(s => s.isActive);
  const monthlyBurn = activeSubs.reduce((acc, sub) => acc + getMonthlyEquivalent(sub.yourShare, sub.cycle), 0);
  const yearlyBurn = monthlyBurn * 12;

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedMonthly(monthlyBurn * easeOutQuart);
      setAnimatedYearly(yearlyBurn * easeOutQuart);
      setAnimatedCount(Math.round(activeSubs.length * easeOutQuart));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMonthly(monthlyBurn);
        setAnimatedYearly(yearlyBurn);
        setAnimatedCount(activeSubs.length);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [monthlyBurn, yearlyBurn, activeSubs.length]);

  const upcoming = [...activeSubs]
    .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime())
    .slice(0, 5);

  const categorySpend = activeSubs.reduce((acc, sub) => {
    const monthly = getMonthlyEquivalent(sub.yourShare, sub.cycle);
    acc[sub.category] = (acc[sub.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categorySpend).sort((a, b) => (b[1] as number) - (a[1] as number));

  const wasteSubs = activeSubs.filter(s => s.usageRating === 'Low' || s.usageRating === 'Unused');
  const wasteAmount = wasteSubs.reduce((acc, sub) => acc + getMonthlyEquivalent(sub.yourShare, sub.cycle), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-400">Here's your subscription overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Monthly Burn" value={animatedMonthly} currency={settings.defaultCurrency} icon={TrendingUp} color="primary" />
        <StatCard title="Yearly Burn" value={animatedYearly} currency={settings.defaultCurrency} icon={Calendar} color="secondary" />
        <StatCard title="Active Subs" value={animatedCount} icon={CheckCircle2} color="safe" isCount />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-sans font-semibold mb-6 flex items-center gap-2">
            <Calendar className="text-primary" size={20} /> Upcoming Renewals
          </h2>
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-slate-400 text-sm">No upcoming renewals.</p>
            ) : (
              upcoming.map(sub => {
                const days = getDaysUntilRenewal(sub.nextRenewal);
                const badgeColor = days <= 3 ? 'bg-danger/20 text-danger border-danger/50' : days <= 7 ? 'bg-warning/20 text-warning border-warning/50' : 'bg-safe/20 text-safe border-safe/50';
                return (
                  <div 
                    key={sub.id} 
                    onClick={() => setSelectedSubscriptionId(sub.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: `${sub.color}20`, color: sub.color }}>
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{sub.name}</h3>
                        <p className="text-xs text-slate-400">{formatCurrency(sub.yourShare, sub.currency)} / {sub.cycle}</p>
                      </div>
                    </div>
                    <div className={cn("px-3 py-1 rounded-full border text-xs font-medium", badgeColor, days <= 1 && "animate-pulse")}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-sans font-semibold mb-6 flex items-center gap-2">
            <PieChart className="text-secondary" size={20} /> Spending by Category
          </h2>
          <div className="space-y-4">
            {sortedCategories.length === 0 ? (
              <p className="text-slate-400 text-sm">No active subscriptions.</p>
            ) : (
              sortedCategories.map(([category, amount]) => {
                const numAmount = amount as number;
                const percentage = (numAmount / monthlyBurn) * 100;
                const color = activeSubs.find(s => s.category === category)?.color || '#fff';
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="font-mono text-slate-400">{formatCurrency(numAmount, settings.defaultCurrency)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {wasteSubs.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 border-warning/30 bg-warning/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <h2 className="text-xl font-sans font-semibold text-warning flex items-center gap-2 mb-2">
                <AlertTriangle size={20} /> Waste Detector
              </h2>
              <p className="text-sm text-slate-300">
                You have {wasteSubs.length} low-usage subscriptions. Cancelling them could save you <strong className="text-white">{formatCurrency(wasteAmount, settings.defaultCurrency)}/mo</strong>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {wasteSubs.slice(0, 3).map(sub => (
                <div key={sub.id} className="px-3 py-1.5 rounded-lg bg-card border border-warning/20 text-xs flex items-center gap-2">
                  <span>{sub.name}</span>
                  <span className="text-slate-400">{formatCurrency(sub.yourShare, sub.currency)}</span>
                </div>
              ))}
              {wasteSubs.length > 3 && <div className="px-3 py-1.5 rounded-lg bg-card border border-white/10 text-xs text-slate-400">+{wasteSubs.length - 3} more</div>}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, currency, icon: Icon, color, isCount }: any) {
  const colorMap: Record<string, { bg: string, text: string, glow: string }> = {
    primary: { bg: 'bg-primary/20', text: 'text-primary', glow: 'bg-primary' },
    secondary: { bg: 'bg-secondary/20', text: 'text-secondary', glow: 'bg-secondary' },
    safe: { bg: 'bg-safe/20', text: 'text-safe', glow: 'bg-safe' },
  };
  const c = colorMap[color];

  return (
    <div className="glass glass-hover rounded-2xl p-6 relative overflow-hidden group">
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 blur-2xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity", c.glow)}></div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={cn("p-3 rounded-xl", c.bg, c.text)}>
          <Icon size={24} />
        </div>
        <h3 className="text-slate-400 font-medium">{title}</h3>
      </div>
      <div className="text-4xl font-mono font-bold tracking-tight relative z-10">
        {isCount ? value : formatCurrency(value, currency)}
      </div>
    </div>
  );
}
