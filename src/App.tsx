import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreProvider, useStore } from './store';
import { Sidebar, ViewType } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { SubscriptionList } from './views/SubscriptionList';
import { Analytics } from './views/Analytics';
import { CalendarView } from './views/CalendarView';
import { Settings } from './views/Settings';
import { DetailModal } from './components/DetailModal';
import { ToastProvider, useToast } from './components/Toast';
import { AuthScreen } from './views/AuthScreen';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { isLoading, selectedSubscriptionId, setSelectedSubscriptionId, subscriptions, currentUser } = useStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const { addToast } = useToast();

  const handleLoginSuccess = (isSignup: boolean) => {
    if (isSignup) {
      setShowWelcome(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center z-10"
        >
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 15px rgba(139,92,246,0.2)", "0 0 40px rgba(139,92,246,0.6)", "0 0 15px rgba(139,92,246,0.2)"] 
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8"
          >
            <span className="font-sans font-bold text-white text-5xl">S</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">SubSafe</h1>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-slate-400">Loading your subscriptions...</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedSub = subscriptions.find(s => s.id === selectedSubscriptionId) || null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg text-slate-200">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'list' && <SubscriptionList />}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'settings' && <Settings />}
        </div>
      </main>
      <DetailModal 
        isOpen={!!selectedSubscriptionId} 
        onClose={() => setSelectedSubscriptionId(null)} 
        subscription={selectedSub} 
      />

      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0f1e] border border-primary/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.2)] text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-4 font-['Bricolage_Grotesque']">
                Welcome aboard, {currentUser.name}!
              </h2>
              <p className="text-slate-400 mb-8">
                SubSafe is set up and ready. Your sample subscriptions have been loaded to get you started.
              </p>
              <button
                onClick={() => {
                  setShowWelcome(false);
                  addToast(`Welcome to SubSafe, ${currentUser.name}! 🎉`, 'success');
                }}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
              >
                Let's Go →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ToastProvider>
  );
}
