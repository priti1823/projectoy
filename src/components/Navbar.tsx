import React from 'react';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import type { Account } from '../types/bank';
import { BankLogo } from './BankLogo';

interface NavbarProps {
  account: Account | null;
  activeTab: string;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  activeTab,
  onLogout,
  onOpenMobileMenu
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Account Overview';
      case 'details': return 'Account Details';
      case 'deposit': return 'Deposit Funds';
      case 'withdraw': return 'Withdraw Funds';
      case 'transfer': return 'Money Transfer';
      case 'scanpay': return 'Scan & Pay';
      case 'transactions': return 'Transaction History';
      case 'changepin': return 'Security & PIN';
      case 'myqr': return 'My Account QR';
      default: return 'Banking';
    }
  };

  const maskedAccount = account?.account_no
    ? `•••• ${account.account_no.slice(-4)}`
    : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Zone 1: Mobile toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <BankLogo size="sm" showSubtitle={false} />

        <div className="hidden h-5 w-px bg-slate-200 md:block mx-1" />

        <span className="hidden text-sm font-medium text-slate-500 md:inline-block">
          {getTabTitle(activeTab)}
        </span>
      </div>

      {/* Zone 2: Security indicator */}
      <div className="hidden items-center gap-1.5 text-xs font-medium text-emerald-800 sm:flex bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>256-Bit Encrypted Banking Core</span>
      </div>

      {/* Zone 3: Account info & Logout */}
      <div className="flex items-center gap-3">
        {account && (
          <div className="flex items-center gap-2.5 text-right">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {account.Name}
              </div>
              <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                {maskedAccount}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200/80 text-slate-700">
              <User className="h-4 w-4" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-rose-900 active:scale-95"
          title="Sign out of your account"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
