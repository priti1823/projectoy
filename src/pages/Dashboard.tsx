import React, { useEffect, useState } from 'react';
import { BalanceCard } from '../components/BalanceCard';
import { QuickActions } from '../components/QuickActions';
import { TransactionTable } from '../components/TransactionTable';
import type { Account, Transaction } from '../types/bank';
import type { TabKey } from '../components/Sidebar';
import { api } from '../services/api';

interface DashboardProps {
  account: Account;
  onRefreshAccount: () => Promise<void>;
  onNavigate: (tab: TabKey) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  account,
  onRefreshAccount,
  onNavigate
}) => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const res = await api.getTransactions(account.account_no, 5);
      if (res.success && res.transactions) {
        setRecentTransactions(res.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch recent transactions:', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [account.account_no]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([onRefreshAccount(), fetchTransactions()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Good day, {account.Name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome to your NovaBank Private Banking Portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('scanpay')}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-850 active:scale-95 transition"
          >
            Scan & Pay
          </button>
          <button
            type="button"
            onClick={() => onNavigate('transfer')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            Transfer Funds
          </button>
        </div>
      </div>

      {/* Main Balance Card */}
      <BalanceCard
        account={account}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onNavigate={onNavigate}
      />

      {/* Quick Banking Actions Grid */}
      <QuickActions
        onNavigate={onNavigate}
        onRefreshBalance={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Recent 5 Transactions */}
      <TransactionTable
        transactions={recentTransactions}
        isLoading={isLoadingTx}
        showViewAllButton={true}
        onViewAll={() => onNavigate('transactions')}
        title="Recent Account Activity"
      />
    </div>
  );
};
