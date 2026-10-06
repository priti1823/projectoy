import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Sidebar, type TabKey } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AccountDetails } from './pages/AccountDetails';
import { Deposit } from './pages/Deposit';
import { Withdraw } from './pages/Withdraw';
import { Transfer } from './pages/Transfer';
import { ScanPay } from './pages/ScanPay';
import { Transactions } from './pages/Transactions';
import { ChangePin } from './pages/ChangePin';
import { MyQR } from './pages/MyQR';
import { BankLogo } from './components/BankLogo';
import { api } from './services/api';
import type { Account } from './types/bank';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session from localStorage if available
  useEffect(() => {
    const savedAccountNo = localStorage.getItem('novabank_active_account');
    if (savedAccountNo) {
      api.getAccount(savedAccountNo)
        .then((res) => {
          if (res.success && res.account) {
            setCurrentAccount(res.account);
          } else {
            localStorage.removeItem('novabank_active_account');
          }
        })
        .catch(() => {
          localStorage.removeItem('novabank_active_account');
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (account: Account) => {
    setCurrentAccount(account);
    setActiveTab('dashboard');
    localStorage.setItem('novabank_active_account', account.account_no);
  };

  const handleLogout = () => {
    setCurrentAccount(null);
    setActiveTab('dashboard');
    localStorage.removeItem('novabank_active_account');
  };

  const handleRefreshAccount = async () => {
    if (!currentAccount) return;
    try {
      const res = await api.getAccount(currentAccount.account_no);
      if (res.success && res.account) {
        setCurrentAccount(res.account);
      }
    } catch (err) {
      console.error('Failed to sync account balance:', err);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <BankLogo size="lg" showSubtitle={false} className="animate-pulse" />
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-2">
            Connecting to NovaBank Core...
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated: Show Login Page
  if (!currentAccount) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset for desktop fixed sidebar) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Sticky Top Bar Contract */}
        <Navbar
          account={currentAccount}
          activeTab={activeTab}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Viewport Content with Fluid Page Transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  account={currentAccount}
                  onRefreshAccount={handleRefreshAccount}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'details' && (
                <AccountDetails
                  account={currentAccount}
                  onRefresh={handleRefreshAccount}
                />
              )}

              {activeTab === 'deposit' && (
                <Deposit
                  account={currentAccount}
                  onRefreshAccount={handleRefreshAccount}
                  onGoToTransactions={() => setActiveTab('transactions')}
                />
              )}

              {activeTab === 'withdraw' && (
                <Withdraw
                  account={currentAccount}
                  onRefreshAccount={handleRefreshAccount}
                  onGoToTransactions={() => setActiveTab('transactions')}
                />
              )}

              {activeTab === 'transfer' && (
                <Transfer
                  account={currentAccount}
                  onRefreshAccount={handleRefreshAccount}
                  onGoToTransactions={() => setActiveTab('transactions')}
                />
              )}

              {activeTab === 'scanpay' && (
                <ScanPay
                  account={currentAccount}
                  onRefreshAccount={handleRefreshAccount}
                  onGoToTransactions={() => setActiveTab('transactions')}
                />
              )}

              {activeTab === 'transactions' && (
                <Transactions account={currentAccount} />
              )}

              {activeTab === 'changepin' && (
                <ChangePin account={currentAccount} />
              )}

              {activeTab === 'myqr' && (
                <MyQR account={currentAccount} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
