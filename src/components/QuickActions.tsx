import React from 'react';
import { motion } from 'motion/react';
import {
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  QrCode,
  History,
  KeyRound,
  CreditCard,
  QrCode as QrIcon
} from 'lucide-react';
import type { TabKey } from './Sidebar';

interface QuickActionsProps {
  onNavigate: (tab: TabKey) => void;
  onRefreshBalance: () => void;
  isRefreshing?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNavigate,
  onRefreshBalance,
  isRefreshing = false
}) => {
  const actions = [
    {
      title: 'Check Balance',
      description: 'Fetch real-time ledger balance',
      icon: RefreshCw,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100/60',
      spin: isRefreshing,
      onClick: onRefreshBalance,
    },
    {
      title: 'Deposit Money',
      description: 'Add funds directly to your account',
      icon: ArrowDownCircle,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100/60',
      onClick: () => onNavigate('deposit'),
    },
    {
      title: 'Withdraw Money',
      description: 'Instant cash withdrawal from balance',
      icon: ArrowUpCircle,
      color: 'text-amber-700 bg-amber-50 border-amber-200/60 hover:bg-amber-100/60',
      onClick: () => onNavigate('withdraw'),
    },
    {
      title: 'Transfer Money',
      description: 'Send money to any bank account',
      icon: ArrowLeftRight,
      color: 'text-blue-700 bg-blue-50 border-blue-200/60 hover:bg-blue-100/60',
      onClick: () => onNavigate('transfer'),
    },
    {
      title: 'Scan & Pay',
      description: 'QR camera or recipient lookup payment',
      icon: QrCode,
      color: 'text-rose-800 bg-rose-50 border-rose-200/60 hover:bg-rose-100/60',
      onClick: () => onNavigate('scanpay'),
    },
    {
      title: 'Transaction History',
      description: 'View full audit log of transactions',
      icon: History,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200/60 hover:bg-indigo-100/60',
      onClick: () => onNavigate('transactions'),
    },
    {
      title: 'Change PIN',
      description: 'Update security PIN with verification',
      icon: KeyRound,
      color: 'text-purple-700 bg-purple-50 border-purple-200/60 hover:bg-purple-100/60',
      onClick: () => onNavigate('changepin'),
    },
    {
      title: 'Account Details',
      description: 'View verified account credentials',
      icon: CreditCard,
      color: 'text-slate-800 bg-slate-100 border-slate-200 hover:bg-slate-200/60',
      onClick: () => onNavigate('details'),
    },
    {
      title: 'My Account QR',
      description: 'Display and download your unique QR',
      icon: QrIcon,
      color: 'text-slate-900 bg-slate-50 border-slate-300 hover:bg-slate-100',
      onClick: () => onNavigate('myqr'),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          Banking Services
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          All operations verified by Core Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={act.title}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="button"
              onClick={act.onClick}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all hover:border-rose-200 hover:shadow-md group"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${act.color}`}
              >
                <Icon className={`h-5 w-5 ${act.spin ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 group-hover:text-rose-900 transition-colors truncate">
                  {act.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                  {act.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
