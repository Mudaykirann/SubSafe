import React, { useState } from 'react';
import { Home, Grid, PieChart, Calendar as CalendarIcon, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type ViewType = 'dashboard' | 'list' | 'analytics' | 'calendar' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const { currentUser, setCurrentUser } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'list', label: 'Subscriptions', icon: Grid },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="w-full md:w-64 bg-card border-t md:border-t-0 md:border-r border-border flex md:flex-col justify-around md:justify-start p-2 md:p-4 z-50 fixed bottom-0 md:relative md:h-screen">
      <div className="hidden md:flex items-center gap-3 mb-8 px-4 py-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <span className="font-sans font-bold text-white text-lg">S</span>
        </div>
        <span className="font-sans font-bold text-xl tracking-tight text-white">SubSafe</span>
      </div>
      
      <ul className="flex md:flex-col w-full gap-1 md:gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <li key={item.id} className="flex-1 md:flex-none">
              <button
                onClick={() => onChangeView(item.id)}
                className={cn(
                  "w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 text-primary md:shadow-[inset_2px_0_0_0_rgba(139,92,246,1)]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon size={20} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* User Profile Dropdown (Desktop) */}
      {currentUser && (
        <div className="hidden md:block relative mt-auto pt-4 border-t border-border px-2">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-2 right-2 mb-2 bg-[#0d0f1e] border border-[#1a1d35] rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-[#1a1d35]">
                  <p className="text-xs text-slate-400 mb-1">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{currentUser.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  );
}
