import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpCircle, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { Account, WithdrawResponse } from '../types/bank';

interface WithdrawProps {
  account: Account;
  onRefreshAccount: () => Promise<void>;
  onGoToTransactions: () => void;
}

export const Withdraw: React.FC<WithdrawProps> = ({
  account,
  onRefreshAccount,
  onGoToTransactions
}) => {
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<WithdrawResponse | null>(null);

  const numAmount = parseInt(amount, 10);

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    if (numAmount > account.balance) {
      setErrorMsg('Insufficient balance.');
      return;
    }
    setErrorMsg(null);
    setStep('confirm');
  };

  const handleConfirmWithdraw = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await api.withdraw(account.account_no, numAmount);
      if (res.success && res.new_balance !== undefined) {
        setResult(res);
        await onRefreshAccount();
        setStep('success');
      } else {
        setErrorMsg(res.error || 'Withdrawal failed');
        setStep('input');
      }
    } catch {
      setErrorMsg('Network error connecting to core');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setErrorMsg(null);
    setResult(null);
    setStep('input');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Withdraw Money
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Debit funds from your verified account ledger
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Amount Input */}
          {step === 'input' && (
            <motion.form
              key="step-input"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleProceedToConfirm}
              className="space-y-6"
            >
              <div>
                <label htmlFor="withdraw_amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Amount
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xl font-light text-slate-400">
                    ₹
                  </span>
                  <input
                    id="withdraw_amount"
                    type="number"
                    min="1"
                    step="1"
                    autoFocus
                    required
                    placeholder="2000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-3.5 text-2xl font-mono font-bold tabular-nums text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Available balance: <strong>₹{new Intl.NumberFormat('en-IN').format(account.balance)}</strong>
                  </span>
                  {account.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(account.balance))}
                      className="text-rose-900 font-bold hover:underline"
                    >
                      Withdraw All
                    </button>
                  )}
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000].map((preset) => (
                  <motion.button
                    key={preset}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    ₹{new Intl.NumberFormat('en-IN').format(preset)}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 px-4 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition"
              >
                <span>Withdraw</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.form>
          )}

          {/* STEP 2: Review / Confirm */}
          {step === 'confirm' && (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Withdrawal Summary
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-sm">
                  <span className="text-slate-600">From Account</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    •••• {account.account_no.slice(-4)} ({account.Name})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-sm">
                  <span className="text-slate-600">Withdrawal Amount</span>
                  <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                    ₹{new Intl.NumberFormat('en-IN').format(numAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-xs text-slate-500">
                  <span>Remaining Balance</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">
                    ₹{new Intl.NumberFormat('en-IN').format(account.balance - numAmount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setStep('input')}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleConfirmWithdraw}
                  disabled={isProcessing}
                  className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      <span>Processing withdrawal...</span>
                    </>
                  ) : (
                    <span>Confirm Withdrawal</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Result Success */}
          {step === 'success' && result && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="text-center py-4 space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  ✓ Withdrawal Successful
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cash disbursed and ledger balance updated
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 text-left border border-slate-100 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Updated Balance</span>
                  <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                    ₹{new Intl.NumberFormat('en-IN').format(result.new_balance || 0)}
                  </span>
                </div>
                {result.transaction && (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Transaction ID</span>
                      <span className="font-mono text-slate-700 tabular-nums">
                        {result.transaction.transaction_id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Timestamp</span>
                      <span className="font-mono text-slate-700 tabular-nums">
                        {result.transaction.time}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-2xl border border-slate-300 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  New Withdrawal
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onGoToTransactions}
                  className="flex-1 rounded-2xl bg-rose-900 py-3 text-xs font-semibold text-white hover:bg-rose-850 transition"
                >
                  View in Statement
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
