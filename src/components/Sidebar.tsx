import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  QrCode,
  History,
  KeyRound,
  QrCode as QrIcon,
  LogOut,
  X
} from 'lucide-react';
import { BankLogo } from './BankLogo';

export type TabKey =
  | 'dashboard'
  | 'details'
  | 'deposit'
  | 'withdraw'
  | 'transfer'
  | 'scanpay'
  | 'transactions'
  | 'changepin'
  | 'myqr';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  mobileOpen,
  onCloseMobile
}) => {
  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'details', label: 'Account Details', icon: CreditCard },
    { key: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
    { key: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
    { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { key: 'scanpay', label: 'Scan & Pay', icon: QrCode },
    { key: 'transactions', label: 'Transactions', icon: History },
    { key: 'changepin', label: 'Change PIN', icon: KeyRound },
    { key: 'myqr', label: 'My QR', icon: QrIcon },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Brand identity lockup with Official Bank Logo */}
        <div className="mb-6 px-2 flex items-center justify-between">
          <BankLogo size="md" />
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-900 to-rose-950 text-white shadow-md shadow-rose-950/15'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-rose-200' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer sign out */}
      <div className="border-t border-slate-200/80 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-900"
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
          <span>Sign Out</span>
        </button>
        <div className="mt-3 px-3 text-[11px] text-slate-400">
          Source of Truth: Core Python Engine
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white shadow-xs">
        {content}
      </aside>

      {/* Mobile drawer with backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl z-10 transition-transform">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
