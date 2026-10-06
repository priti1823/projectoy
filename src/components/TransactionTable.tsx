import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Download, Search, ArrowUpDown, Filter } from 'lucide-react';
import type { Transaction } from '../types/bank';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewAll?: () => void;
  showViewAllButton?: boolean;
  title?: string;
  allowSearch?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
  onViewAll,
  showViewAllButton = false,
  title = 'Recent Transactions',
  allowSearch = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdraw' | 'transfer' | 'recieved'>('all');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredTransactions = transactions
    .filter((tx) => {
      // Type filter
      if (typeFilter !== 'all') {
        const lowerType = tx.type.toLowerCase();
        if (typeFilter === 'recieved' && lowerType !== 'recieved' && lowerType !== 'received') return false;
        if (typeFilter !== 'recieved' && lowerType !== typeFilter) return false;
      }
      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.transaction_id.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        String(tx.amount).includes(q) ||
        tx.time.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortAsc) {
        return Number(a.amount) - Number(b.amount);
      }
      return 0; // Natural chronological order
    });

  const getTransactionBadge = (type: string) => {
    const lower = type.toLowerCase();
    if (lower === 'deposit') {
      return {
        label: 'Deposit',
        icon: ArrowDownLeft,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
        sign: '+',
        amountColor: 'text-emerald-700'
      };
    } else if (lower === 'recieved' || lower === 'received') {
      return {
        label: 'Received',
        icon: ArrowDownLeft,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
        sign: '+',
        amountColor: 'text-emerald-700'
      };
    } else if (lower === 'withdraw') {
      return {
        label: 'Withdraw',
        icon: ArrowUpRight,
        color: 'text-slate-700 bg-slate-100 border-slate-200',
        sign: '-',
        amountColor: 'text-slate-900'
      };
    } else if (lower === 'transfer') {
      return {
        label: 'Transfer',
        icon: ArrowLeftRight,
        color: 'text-rose-800 bg-rose-50 border-rose-200/60',
        sign: '-',
        amountColor: 'text-rose-900'
      };
    } else {
      return {
        label: type,
        icon: ArrowLeftRight,
        color: 'text-slate-700 bg-slate-100 border-slate-200',
        sign: '',
        amountColor: 'text-slate-900'
      };
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const header = ['account_no', 'transaction_id', 'type', 'amount', 'time'].join(',');
    const rows = transactions.map((t) =>
      [t.account_no, t.transaction_id, t.type, t.amount, `"${t.time}"`].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaBank_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-200/70">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Read from authentic transaction.csv records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allowSearch && (
            <>
              {/* Type Filter Select */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="h-8 pl-2.5 pr-7 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-900 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdraw">Withdrawals</option>
                  <option value="transfer">Transfers</option>
                  <option value="recieved">Received</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, time..."
                  className="h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800 w-36 sm:w-44"
                />
              </div>

              {/* Sort by Amount */}
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium transition ${
                  sortAsc
                    ? 'border-rose-300 bg-rose-50 text-rose-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Sort by amount"
              >
                <ArrowUpDown className="h-3 w-3" />
                <span className="hidden sm:inline">Amount</span>
              </button>
            </>
          )}

          {transactions.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              title="Download CSV statement"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          {showViewAllButton && onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="h-8 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-900 hover:bg-rose-100 transition whitespace-nowrap"
            >
              View All
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      {isLoading ? (
        <div className="p-10 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rose-900 border-r-transparent" />
          <p className="mt-2 text-xs text-slate-500">Loading ledger records...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <p className="text-sm font-semibold">No transactions match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or type filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Type</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx, idx) => {
                const badge = getTransactionBadge(tx.type);
                const Icon = badge.icon;
                const formattedAmt = new Intl.NumberFormat('en-IN').format(Number(tx.amount) || 0);

                return (
                  <tr key={`${tx.transaction_id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    {/* Type with Icon */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${badge.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-900 capitalize">
                          {badge.label}
                        </span>
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-600 tabular-nums">
                        {tx.transaction_id}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {tx.time}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${badge.amountColor}`}
                      >
                        {badge.sign} ₹{formattedAmt}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
