export type Cycle = 'weekly' | 'monthly' | 'yearly';
export type Category = 'Entertainment' | 'Productivity' | 'Health' | 'Cloud' | 'Education' | 'Finance' | 'Other';
export type UsageRating = 'High' | 'Medium' | 'Low' | 'Unused';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  cycle: Cycle;
  category: Category;
  startDate: string; // ISO date string
  nextRenewal: string; // ISO date string
  paymentMethod: string;
  usageRating: UsageRating;
  isShared: boolean;
  sharedWith: number;
  yourShare: number;
  notes: string;
  color: string;
  isActive: boolean;
}

export interface AppSettings {
  defaultCurrency: string;
  totalSaved: number;
}

export interface User {
  name: string;
  email: string;
}
