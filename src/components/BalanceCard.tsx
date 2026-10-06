import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Copy, Check, RefreshCw, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, QrCode } from 'lucide-react';
import type { Account } from '../types/bank';
import type { TabKey } from './Sidebar';

interface BalanceCardProps {
  account: Account;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onNavigate: (tab: TabKey) => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  account,
  onRefresh,
  isRefreshing = false,
  onNavigate
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedBalance = new Intl.NumberFormat('en-IN').format(account.balance);
  const maskedAccount = `•••• ${account.account_no.slice(-4)}`;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(account.account_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#4C0519] p-6 sm:p-8 text-white shadow-2xl shadow-rose-950/20 border border-slate-800/80"
    >
      {/* Subtle luxury ambient glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-rose-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Decorative Guilloche Security Line */}
      <svg
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-10"
        viewBox="0 0 300 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 50 Q75 10, 150 50 T300 50 M0 100 Q75 60, 150 100 T300 100 M0 150 Q75 110, 150 150 T300 150"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Top row: Label & Refresh */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest text-rose-300 uppercase">
            Total Balance
          </span>
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="rounded p-1 text-slate-400 hover:text-white transition-colors"
            title={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50 border border-white/10"
          title="Sync latest balance from Python core"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Check Balance</span>
        </motion.button>
      </div>

      {/* Balance amount with smooth animated transition */}
      <div className="relative z-10 mt-4 flex items-baseline gap-2">
        <span className="font-serif text-2xl font-light text-rose-300">₹</span>
        <AnimatePresence mode="wait">
          {showBalance ? (
            <motion.span
              key="visible"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
              className="font-mono text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white"
            >
              {formattedBalance}
            </motion.span>
          ) : (
            <motion.span
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-slate-400 select-none"
            >
              ••••••••
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Middle row: Card chip & Account details */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Account Holder
          </div>
          <div className="text-sm font-semibold tracking-wide text-white mt-0.5">
            {account.Name}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Account Number
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-medium tabular-nums text-slate-200 mt-0.5">
            <span>{maskedAccount}</span>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy full account number"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/10">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide text-slate-300">
            Active · Core Synced
          </span>
        </div>
      </div>

      {/* Quick Access Action Bar with spring animations */}
      <div className="relative z-10 mt-6 grid grid-cols-4 gap-2 sm:gap-3 border-t border-white/10 pt-4">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onNavigate('deposit')}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/5 py-3 px-2 hover:bg-white/15 transition-all text-center group border border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 transition">
            <ArrowDownCircle className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Deposit</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onNavigate('withdraw')}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/5 py-3 px-2 hover:bg-white/15 transition-all text-center group border border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30 transition">
            <ArrowUpCircle className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Withdraw</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onNavigate('transfer')}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/5 py-3 px-2 hover:bg-white/15 transition-all text-center group border border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30 transition">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Transfer</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onNavigate('scanpay')}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/5 py-3 px-2 hover:bg-white/15 transition-all text-center group border border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 group-hover:bg-rose-500/30 transition">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Scan & Pay</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
