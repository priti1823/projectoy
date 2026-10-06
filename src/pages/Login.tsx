import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, User, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { Account } from '../types/bank';
import { BankLogo } from '../components/BankLogo';

interface LoginProps {
  onLoginSuccess: (account: Account) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [accountNo, setAccountNo] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Demo accounts helper for test evaluation
  const demoAccounts = [
    { name: 'Rahul', acc: '100001', pin: '4455', bal: '₹79' },
    { name: 'Priya', acc: '100002', pin: '2345', bal: '₹10,13,980' },
    { name: 'Aman', acc: '100003', pin: '3456', bal: '₹14,000' },
    { name: 'Arjun', acc: '100005', pin: '5678', bal: '₹15,000' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNo.trim()) {
      setErrorMsg('Please enter your account number');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Please enter your PIN');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setErrorCode(null);

    try {
      const res = await api.login(accountNo.trim(), pin.trim());

      if (res.success && res.account) {
        onLoginSuccess(res.account);
      } else {
        setErrorMsg(res.error || 'Authentication failed');
        setErrorCode(res.code || null);
        if (res.blocked || res.code === 'ACCOUNT_BLOCKED') {
          setIsBlocked(true);
        }
        if (res.remaining_attempts !== undefined) {
          setRemainingAttempts(res.remaining_attempts);
        }
      }
    } catch {
      setErrorMsg('Unable to connect to NovaBank core system. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (acc: string, demoPin: string) => {
    setAccountNo(acc);
    setPin(demoPin);
    setErrorMsg(null);
    setErrorCode(null);
    setIsBlocked(false);
    setRemainingAttempts(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-rose-900 selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        {/* Official Bank Logo */}
        <div className="flex justify-center mb-2">
          <BankLogo size="lg" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Secure banking, made simple.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0"
      >
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-900/5 rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Security Banner */}
          <AnimatePresence mode="wait">
            {isBlocked || errorCode === 'ACCOUNT_BLOCKED' ? (
              <motion.div
                key="blocked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-950"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">
                      Account Blocked
                    </h4>
                    <p className="mt-1 text-xs text-rose-800 font-medium">
                      ACCOUNT BLOCKED 3 WRONG ATTEMPTS--
                    </p>
                    <p className="mt-1.5 text-[11px] text-rose-700">
                      Security policy triggered after 3 incorrect attempts.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : errorMsg ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                      Authentication Notice
                    </h4>
                    <p className="mt-0.5 text-xs text-amber-800 font-medium">
                      {errorMsg}
                    </p>
                    {remainingAttempts !== null && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        Remaining attempts before block: <strong>{remainingAttempts}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Number */}
            <div>
              <label htmlFor="account_no" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Account Number
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="account_no"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. 100001"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm font-mono placeholder-slate-400 text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                PIN
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm font-mono tracking-widest text-slate-900 focus:border-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button with motion tap */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-900 via-rose-950 to-slate-950 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-950/20 hover:from-rose-850 hover:to-rose-900 active:scale-[0.99] disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Demo Test Accounts Drawer */}
          <div className="mt-8 border-t border-slate-200/80 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Sample Test Accounts
              </span>
              <span className="text-[11px] text-slate-400 font-mono">from account.csv</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo) => (
                <motion.button
                  key={demo.acc}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleSelectDemo(demo.acc, demo.pin)}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:bg-rose-50/70 hover:border-rose-200 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-rose-900">
                      {demo.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 font-semibold tabular-nums">
                      {demo.bal}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Acc: {demo.acc} · PIN: {demo.pin}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Security footer disclaimer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          NovaBank Private Banking · Core Banking Engine v2.4
        </div>
      </motion.div>
    </div>
  );
};
