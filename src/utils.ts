import { addDays, addMonths, addYears, isBefore, isSameDay, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { Subscription, Cycle, Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#8b5cf6', // purple
  Productivity: '#06b6d4', // cyan
  Health: '#22c55e', // green
  Cloud: '#3b82f6', // blue
  Education: '#f59e0b', // amber
  Finance: '#10b981', // emerald
  Other: '#64748b', // slate
};

export function calculateNextRenewal(startDate: string, cycle: Cycle): string {
  let next = startOfDay(parseISO(startDate));
  const today = startOfDay(new Date());

  if (isBefore(today, next) || isSameDay(today, next)) {
    return next.toISOString();
  }

  while (isBefore(next, today)) {
    if (cycle === 'weekly') next = addDays(next, 7);
    else if (cycle === 'monthly') next = addMonths(next, 1);
    else if (cycle === 'yearly') next = addYears(next, 1);
  }

  return next.toISOString();
}

export function getMonthlyEquivalent(cost: number, cycle: Cycle): number {
  if (cycle === 'weekly') return cost * (52 / 12);
  if (cycle === 'yearly') return cost / 12;
  return cost;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(currency === '₹' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency === '₹' ? 'INR' : currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP',
    maximumFractionDigits: 0,
  }).format(amount).replace('INR', '₹');
}

export function getDaysUntilRenewal(nextRenewal: string): number {
  return differenceInDays(startOfDay(parseISO(nextRenewal)), startOfDay(new Date()));
}
