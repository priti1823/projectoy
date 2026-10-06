import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';
import { TransactionTable } from '../components/TransactionTable';
import { api } from '../services/api';
import type { Account, Transaction } from '../types/bank';

interface TransactionsPageProps {
  account: Account;
}

export const Transactions: React.FC<TransactionsPageProps> = ({ account }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'recent'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const limit = filterMode === 'recent' ? 5 : undefined;
      const res = await api.getTransactions(account.account_no, limit);
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
      } else {
        setErrorMsg(res.error || 'Failed to load transaction history');
      }
    } catch {
      setErrorMsg('Network error connecting to ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [account.account_no, filterMode]);

  // Compute Inflow vs Outflow from real transactions
  const totalInflow = transactions
    .filter((t) => {
      const type = t.type.toLowerCase();
      return type === 'deposit' || type === 'recieved' || type === 'received';
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalOutflow = transactions
    .filter((t) => {
      const type = t.type.toLowerCase();
      return type === 'withdraw' || type === 'transfer';
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit trail recorded in transaction.csv for Account {account.account_no}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('recent')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterMode === 'recent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recent 5
            </button>
          </div>

          <button
            type="button"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            title="Refresh transaction log"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards calculated from CSV */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inflows
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-xl font-bold tabular-nums text-emerald-700">
            +₹{new Intl.NumberFormat('en-IN').format(totalInflow)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Deposits & incoming transfers
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Outflows
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-xl font-bold tabular-nums text-rose-900">
            -₹{new Intl.NumberFormat('en-IN').format(totalOutflow)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Withdrawals & outgoing transfers
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Operations
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-xl font-bold tabular-nums text-slate-900">
            {transactions.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Recorded in transaction.csv
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          {errorMsg}
        </div>
      )}

      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        title={filterMode === 'all' ? 'All Account Records' : 'Latest 5 Transactions'}
        allowSearch={true}
      />
    </motion.div>
  );
};
