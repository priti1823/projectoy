import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { Account } from '../types/bank';

interface ChangePinProps {
  account: Account;
}

export const ChangePin: React.FC<ChangePinProps> = ({ account }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPin.trim()) {
      setErrorMsg('Please enter your current PIN');
      return;
    }
    if (!newPin.trim()) {
      setErrorMsg('Please enter your new PIN');
      return;
    }
    if (newPin.length < 4) {
      setErrorMsg('New PIN should be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('New PIN and Confirm PIN do not match');
      return;
    }
    if (newPin === currentPin) {
      setErrorMsg('New PIN cannot be identical to current PIN');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await api.changePin(account.account_no, currentPin.trim(), newPin.trim());
      if (res.success) {
        setSuccessMsg('✓ PIN Updated Successfully');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setErrorMsg(res.error || 'Incorrect current PIN');
      }
    } catch {
      setErrorMsg('Failed to update PIN due to network failure');
    } finally {
      setIsProcessing(false);
    }
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
          Change PIN
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Update the secret passcode for your bank account
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950 flex items-start gap-2.5"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <span className="font-bold">{successMsg}</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Your new PIN is now active for future logins.
              </p>
            </div>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-start gap-2.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current PIN */}
          <div>
            <label htmlFor="current_pin" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Current PIN
            </label>
            <div className="relative mt-1.5">
              <input
                id="current_pin"
                type={showCurrentPin ? 'text' : 'password'}
                required
                maxLength={6}
                placeholder="••••"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New PIN */}
          <div>
            <label htmlFor="new_pin" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              New PIN
            </label>
            <div className="relative mt-1.5">
              <input
                id="new_pin"
                type={showNewPin ? 'text' : 'password'}
                required
                maxLength={6}
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              >
                {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New PIN */}
          <div>
            <label htmlFor="confirm_pin" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Confirm New PIN
            </label>
            <div className="relative mt-1.5">
              <input
                id="confirm_pin"
                type={showNewPin ? 'text' : 'password'}
                required
                maxLength={6}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-900 to-rose-950 py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-rose-950/20 hover:from-rose-850 hover:to-rose-900 disabled:opacity-50 transition"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  <span>Updating PIN...</span>
                </>
              ) : (
                <>
                  <span>Update PIN</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
