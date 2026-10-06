import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, QrCode } from 'lucide-react';
import { api } from '../services/api';
import type { Account, TransferResponse, Recipient } from '../types/bank';
import { QRScannerModal } from '../components/QRScannerModal';

interface TransferProps {
  account: Account;
  onRefreshAccount: () => Promise<void>;
  onGoToTransactions: () => void;
}

export const Transfer: React.FC<TransferProps> = ({
  account,
  onRefreshAccount,
  onGoToTransactions
}) => {
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [receiverAcc, setReceiverAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResponse | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    api.getRecipients()
      .then((res) => {
        if (res.success && res.recipients) {
          // Exclude self
          setRecipients(res.recipients.filter((r) => r.account_no !== account.account_no));
        }
      })
      .catch((err) => console.error('Failed to load recipients:', err));
  }, [account.account_no]);

  const numAmount = parseInt(amount, 10);
  const matchedRecipient = recipients.find((r) => r.account_no === receiverAcc.trim());

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAcc = receiverAcc.trim();

    if (!targetAcc) {
      setErrorMsg('Please enter a recipient account number');
      return;
    }
    if (targetAcc === account.account_no) {
      setErrorMsg('Cannot transfer to your own account');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    if (numAmount > account.balance) {
      setErrorMsg('Insufficient balance.');
      return;
    }

    setErrorMsg(null);
    setStep('confirm');
  };

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await api.transfer(account.account_no, receiverAcc.trim(), numAmount);
      if (res.success) {
        setResult(res);
        await onRefreshAccount();
        setStep('success');
      } else {
        setErrorMsg(res.error || 'enter valid account no');
        setStep('input');
      }
    } catch {
      setErrorMsg('Network failure during transfer');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setReceiverAcc('');
    setAmount('');
    setErrorMsg(null);
    setResult(null);
    setStep('input');
  };

  const handleQrScanned = (scannedAcc: string) => {
    setReceiverAcc(scannedAcc);
    setErrorMsg(null);
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
          Transfer Money
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Direct inter-account transfer powered by core banking
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
          {/* STEP 1: Input */}
          {step === 'input' && (
            <motion.form
              key="transfer-input"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleProceedToConfirm}
              className="space-y-5"
            >
              {/* From Account */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  From Account
                </label>
                <div className="mt-1.5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200">
                  <span className="font-semibold text-slate-900 text-sm">
                    {account.Name}
                  </span>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    •••• {account.account_no.slice(-4)} (Bal: ₹{new Intl.NumberFormat('en-IN').format(account.balance)})
                  </span>
                </div>
              </div>

              {/* To Account Number */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="receiver_acc" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    To Account Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-900 hover:text-rose-800 transition"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Scan Recipient QR</span>
                  </button>
                </div>

                <div className="relative mt-1.5">
                  <input
                    id="receiver_acc"
                    type="text"
                    required
                    placeholder="e.g. 100002"
                    value={receiverAcc}
                    onChange={(e) => setReceiverAcc(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
                  />
                </div>

                {matchedRecipient && (
                  <div className="mt-1.5 text-xs text-emerald-700 font-semibold">
                    Verified Recipient: {matchedRecipient.Name}
                  </div>
                )}
              </div>

              {/* Quick account suggestions */}
              {recipients.length > 0 && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Registered Accounts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipients.slice(0, 5).map((r) => (
                      <motion.button
                        key={r.account_no}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setReceiverAcc(r.account_no)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-900 transition"
                      >
                        {r.Name} ({r.account_no})
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label htmlFor="transfer_amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Amount
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xl font-light text-slate-400">
                    ₹
                  </span>
                  <input
                    id="transfer_amount"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-3 text-xl font-mono font-bold tabular-nums text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-900 to-rose-950 py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-rose-950/20 hover:from-rose-850 hover:to-rose-900 transition"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.form>
          )}

          {/* STEP 2: Review */}
          {step === 'confirm' && (
            <motion.div
              key="transfer-confirm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transfer Review
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-sm">
                  <span className="text-slate-600">From</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    •••• {account.account_no.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-sm">
                  <span className="text-slate-600">To</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    •••• {receiverAcc.slice(-4)} {matchedRecipient ? `(${matchedRecipient.Name})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 text-sm">
                  <span className="text-slate-600">Amount</span>
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
                  onClick={handleConfirmTransfer}
                  disabled={isProcessing}
                  className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-900 to-rose-950 py-3 text-sm font-semibold text-white shadow-md shadow-rose-950/20 hover:from-rose-850 hover:to-rose-900 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      <span>Processing transfer...</span>
                    </>
                  ) : (
                    <span>Confirm Transfer</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Result Success */}
          {step === 'success' && result && (
            <motion.div
              key="transfer-success"
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
                  ✓ Transfer Successful
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Real transfer confirmed and recorded for both accounts
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 text-left border border-slate-100 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                    ₹{new Intl.NumberFormat('en-IN').format(result.amount || numAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Recipient</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    •••• {receiverAcc.slice(-4)} {result.receiver_name ? `(${result.receiver_name})` : ''}
                  </span>
                </div>
                {result.sender_transaction_id && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Your Transaction ID</span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {result.sender_transaction_id}
                    </span>
                  </div>
                )}
                {result.time && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Timestamp</span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {result.time}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500">Updated Balance</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ₹{new Intl.NumberFormat('en-IN').format(result.new_balance || 0)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-2xl border border-slate-300 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Transfer More
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

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={handleQrScanned}
      />
    </motion.div>
  );
};
