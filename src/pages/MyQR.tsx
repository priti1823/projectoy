import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Maximize2, ShieldCheck, X, Copy, Check, RefreshCw, SlidersHorizontal } from 'lucide-react';
import type { Account } from '../types/bank';
import { api } from '../services/api';
import { BankLogo } from '../components/BankLogo';

interface MyQRProps {
  account: Account;
}

export const MyQR: React.FC<MyQRProps> = ({ account }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cardTheme, setCardTheme] = useState<'pearl' | 'titanium'>('pearl');
  const [showAccountOnCard, setShowAccountOnCard] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [isDownloading, setIsDownloading] = useState(false);

  const qrUrl = `/api/qr/${account.account_no}?t=${qrTimestamp}`;
  const formattedAccountNo = account.account_no.replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(account.account_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQR = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setQrTimestamp(Date.now());
      setIsRefreshing(false);
    }, 600);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `NovaBank_QR_${account.account_no}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          My Account QR
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Scan this QR to identify this account.
        </p>
      </div>

      {/* Main QR Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center shadow-lg transition-colors duration-300 border ${
          cardTheme === 'pearl'
            ? 'bg-white border-slate-200 shadow-slate-900/5'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white border-slate-800 shadow-rose-950/20'
        }`}
      >
        {/* Header branding on card */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100/10 mb-6">
          <BankLogo size="sm" variant={cardTheme === 'pearl' ? 'full' : 'white'} />
          <div
            className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md ${
              cardTheme === 'pearl'
                ? 'bg-rose-50 text-rose-900 border border-rose-100'
                : 'bg-white/10 text-rose-200 border border-white/10'
            }`}
          >
            Digital Pass
          </div>
        </div>

        {/* QR Code Container with crisp frame */}
        <div className="relative mx-auto flex h-60 w-60 items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
          <img
            src={qrUrl}
            alt={`QR code for account ${account.account_no}`}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Account Info */}
        <div className="mt-6 space-y-1.5">
          <div
            className={`text-base font-bold ${
              cardTheme === 'pearl' ? 'text-slate-900' : 'text-white'
            }`}
          >
            {account.Name}
          </div>

          {showAccountOnCard && (
            <div className="flex items-center justify-center gap-2">
              <span
                className={`font-mono text-sm tracking-wider tabular-nums ${
                  cardTheme === 'pearl' ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Account: {formattedAccountNo}
              </span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                title="Copy account number"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}

          <div
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full mt-2 ${
              cardTheme === 'pearl'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>Python Core Verified QR Code</span>
          </div>
        </div>

        {/* Action buttons: View QR & Download QR */}
        <div className="flex gap-2.5 pt-6 border-t border-slate-100/10 mt-6">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsFullscreen(true)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold transition ${
              cardTheme === 'pearl'
                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border border-white/20 bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Maximize2 className="h-4 w-4" />
            <span>View Full QR</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-900 to-rose-950 py-2.5 px-3 text-xs font-semibold text-white shadow-md shadow-rose-950/20 hover:from-rose-850 hover:to-rose-900 disabled:opacity-50 transition"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? 'Saving...' : 'Download QR'}</span>
          </motion.button>
        </div>
      </div>

      {/* QR Settings Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>QR Display Settings</span>
          </div>
          <button
            type="button"
            onClick={handleRefreshQR}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-[11px] font-medium text-rose-900 hover:underline"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Reload Core</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-600">Card Appearance</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setCardTheme('pearl')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                cardTheme === 'pearl'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pearl
            </button>
            <button
              type="button"
              onClick={() => setCardTheme('titanium')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                cardTheme === 'titanium'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Titanium
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-600">Show Account Number</span>
          <button
            type="button"
            onClick={() => setShowAccountOnCard(!showAccountOnCard)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showAccountOnCard ? 'bg-rose-900' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showAccountOnCard ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fullscreen Modal with motion spring */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-sm w-full rounded-3xl bg-white p-8 text-center shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <BankLogo size="md" className="justify-center mb-3" />

              <h3 className="text-base font-bold text-slate-900">
                {account.Name}
              </h3>
              <p className="font-mono text-xs text-slate-500 mt-0.5 tabular-nums">
                {formattedAccountNo}
              </p>

              <div className="my-6 mx-auto flex h-72 w-72 items-center justify-center rounded-2xl border border-slate-200 p-4 shadow-inner">
                <img
                  src={qrUrl}
                  alt="Enlarged QR"
                  className="h-full w-full object-contain"
                />
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full rounded-xl bg-gradient-to-r from-rose-900 to-rose-950 py-3 text-xs font-semibold text-white hover:from-rose-850 hover:to-rose-900 shadow-md transition"
              >
                Save to Device
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
