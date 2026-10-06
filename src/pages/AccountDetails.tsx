import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Account } from '../types/bank';

interface AccountDetailsProps {
  account: Account;
  onRefresh: () => Promise<void>;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ account, onRefresh }) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formattedBalance = new Intl.NumberFormat('en-IN').format(account.balance);
  const formattedAccountNo = account.account_no.replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleCopy = () => {
    navigator.clipboard.writeText(account.account_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Account Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified credentials recorded in account.csv
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Core</span>
        </motion.button>
      </div>

      {/* Main Account Certificate Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-900 border border-rose-100">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">
                NovaBank Account Record
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Active & Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Account Holder Name */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Account Holder Name
            </span>
            <div className="mt-1 text-base font-bold text-slate-900">
              {account.Name}
            </div>
          </div>

          {/* Account Number */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Account Number
              </span>
              <div className="mt-1 font-mono text-base font-bold tracking-wider text-slate-900 tabular-nums">
                {formattedAccountNo}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Current Balance */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Current Available Balance
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-serif text-lg text-slate-600">₹</span>
              <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {formattedBalance}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
