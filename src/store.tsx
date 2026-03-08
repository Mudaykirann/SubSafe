import React, { createContext, useContext, useEffect, useState } from 'react';
import { Subscription, AppSettings, User } from './types';
import { calculateNextRenewal, CATEGORY_COLORS } from './utils';

const SAMPLE_DATA: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    cost: 649,
    currency: '₹',
    cycle: 'monthly',
    category: 'Entertainment',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    nextRenewal: calculateNextRenewal(new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), 'monthly'),
    paymentMethod: 'HDFC Credit Card',
    usageRating: 'High',
    isShared: false,
    sharedWith: 1,
    yourShare: 649,
    notes: 'Premium plan',
    color: CATEGORY_COLORS['Entertainment'],
    isActive: true,
  },
  // {
  //   id: '2',
  //   name: 'Spotify',
  //   cost: 119,
  //   currency: '₹',
  //   cycle: 'monthly',
  //   category: 'Entertainment',
  //   startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
  //   nextRenewal: calculateNextRenewal(new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(), 'monthly'),
  //   paymentMethod: 'UPI',
  //   usageRating: 'High',
  //   isShared: false,
  //   sharedWith: 1,
  //   yourShare: 119,
  //   notes: 'Individual plan',
  //   color: CATEGORY_COLORS['Entertainment'],
  //   isActive: true,
  // },
  // {
  //   id: '3',
  //   name: 'iCloud',
  //   cost: 75,
  //   currency: '₹',
  //   cycle: 'monthly',
  //   category: 'Cloud',
  //   startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
  //   nextRenewal: calculateNextRenewal(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(), 'monthly'),
  //   paymentMethod: 'Apple Pay',
  //   usageRating: 'Medium',
  //   isShared: false,
  //   sharedWith: 1,
  //   yourShare: 75,
  //   notes: '50GB storage',
  //   color: CATEGORY_COLORS['Cloud'],
  //   isActive: true,
  // },
  // {
  //   id: '4',
  //   name: 'Adobe Creative Cloud',
  //   cost: 1675,
  //   currency: '₹',
  //   cycle: 'monthly',
  //   category: 'Productivity',
  //   startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
  //   nextRenewal: calculateNextRenewal(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), 'monthly'),
  //   paymentMethod: 'HDFC Credit Card',
  //   usageRating: 'Low',
  //   isShared: false,
  //   sharedWith: 1,
  //   yourShare: 1675,
  //   notes: 'All apps plan',
  //   color: CATEGORY_COLORS['Productivity'],
  //   isActive: true,
  // },
];

interface StoreContextType {
  subscriptions: Subscription[];
  settings: AppSettings;
  isLoading: boolean;
  addSubscription: (sub: Omit<Subscription, 'id' | 'nextRenewal' | 'color' | 'yourShare'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
  importData: (data: any) => void;
  selectedSubscriptionId: string | null;
  setSelectedSubscriptionId: (id: string | null) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ defaultCurrency: '₹', totalSaved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const storedSubs = localStorage.getItem('subsafe_subs');
      const storedSettings = localStorage.getItem('subsafe_settings');

      if (storedSubs) {
        setSubscriptions(JSON.parse(storedSubs));
      } else {
        setSubscriptions(SAMPLE_DATA);
        localStorage.setItem('subsafe_subs', JSON.stringify(SAMPLE_DATA));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        localStorage.setItem('subsafe_settings', JSON.stringify({ defaultCurrency: '₹', totalSaved: 0 }));
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('subsafe_subs', JSON.stringify(subscriptions));
      localStorage.setItem('subsafe_settings', JSON.stringify(settings));
    }
  }, [subscriptions, settings, isLoading]);

  const addSubscription = (subData: Omit<Subscription, 'id' | 'nextRenewal' | 'color' | 'yourShare'>) => {
    const newSub: Subscription = {
      ...subData,
      id: Math.random().toString(36).substr(2, 9),
      nextRenewal: calculateNextRenewal(subData.startDate, subData.cycle),
      color: CATEGORY_COLORS[subData.category],
      yourShare: subData.isShared ? subData.cost / subData.sharedWith : subData.cost,
    };
    setSubscriptions(prev => [...prev, newSub]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === id) {
        const updated = { ...sub, ...updates };
        if (updates.startDate || updates.cycle) {
          updated.nextRenewal = calculateNextRenewal(updated.startDate, updated.cycle);
        }
        if (updates.category) {
          updated.color = CATEGORY_COLORS[updated.category];
        }
        if (updates.cost !== undefined || updates.isShared !== undefined || updates.sharedWith !== undefined) {
          updated.yourShare = updated.isShared ? updated.cost / updated.sharedWith : updated.cost;
        }
        return updated;
      }
      return sub;
    }));
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearAllData = () => {
    setSubscriptions([]);
    setSettings({ defaultCurrency: '₹', totalSaved: 0 });
  };

  const importData = (data: any) => {
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      setSubscriptions(data.subscriptions);
    }
    if (data.settings) {
      setSettings(data.settings);
    }
  };

  return (
    <StoreContext.Provider value={{
      subscriptions,
      settings,
      isLoading,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      updateSettings,
      clearAllData,
      importData,
      selectedSubscriptionId,
      setSelectedSubscriptionId,
      currentUser,
      setCurrentUser
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
