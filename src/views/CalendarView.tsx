import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { cn } from '../components/Sidebar';

export function CalendarView() {
  const { subscriptions, settings, setSelectedSubscriptionId } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const activeSubs = subscriptions.filter(s => s.isActive);

  const getRenewalsForDay = (day: Date) => {
    return activeSubs.filter(sub => isSameDay(new Date(sub.nextRenewal), day));
  };

  const selectedRenewals = getRenewalsForDay(selectedDate);
  const selectedTotal = selectedRenewals.reduce((acc, sub) => acc + sub.yourShare, 0);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-4xl font-sans font-bold tracking-tight mb-2">Calendar</h1>
        <p className="text-slate-400">Track your upcoming billing dates.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-sans font-semibold">{format(currentDate, dateFormat)}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const renewals = getRenewalsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <div 
                  key={day.toString()} 
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[80px] p-2 rounded-xl border transition-all cursor-pointer relative group",
                    !isCurrentMonth ? "opacity-30 border-transparent" : "border-border/50 hover:border-primary/50",
                    isSelected ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]" : "bg-card/30",
                    isToday(day) && !isSelected && "border-secondary/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday(day) ? "bg-secondary text-bg" : isSelected ? "text-primary" : "text-slate-300"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {renewals.slice(0, 3).map(sub => (
                      <div 
                        key={sub.id} 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: sub.color, boxShadow: `0 0 5px ${sub.color}` }}
                        title={sub.name}
                      />
                    ))}
                    {renewals.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-medium leading-none">+{renewals.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-80 glass rounded-2xl p-6 flex flex-col h-[600px]">
          <h2 className="text-xl font-sans font-semibold mb-6 flex items-center gap-2">
            <CalendarIcon className="text-primary" size={20} /> 
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {selectedRenewals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <CalendarIcon size={40} className="mb-4 opacity-20" />
                <p>No renewals on this date.</p>
              </div>
            ) : (
              selectedRenewals.map(sub => (
                <div 
                  key={sub.id} 
                  onClick={() => setSelectedSubscriptionId(sub.id)}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${sub.color}20`, color: sub.color }}>
                    {sub.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{sub.name}</h3>
                    <p className="text-xs text-slate-400">{sub.cycle}</p>
                  </div>
                  <div className="font-mono font-bold">
                    {formatCurrency(sub.yourShare, sub.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {selectedRenewals.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
              <span className="text-slate-400">Total Due</span>
              <span className="text-2xl font-mono font-bold text-primary">{formatCurrency(selectedTotal, settings.defaultCurrency)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
