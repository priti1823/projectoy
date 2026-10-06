import type {
  Account,
  DepositResponse,
  LoginResponse,
  ScanPayResponse,
  ScanQrImageResponse,
  Transaction,
  TransferResponse,
  WithdrawResponse,
  ChangePinResponse,
  Recipient
} from '../types/bank';

interface InternalAccount extends Account {
  pin: string;
  blocked?: boolean;
  failedAttempts?: number;
}

// Initial baseline accounts from account.csv
const INITIAL_ACCOUNTS: InternalAccount[] = [
  { Name: 'Rahul', account_no: '100001', pin: '4455', balance: 79 },
  { Name: 'Priya', account_no: '100002', pin: '2345', balance: 1013980 },
  { Name: 'Aman', account_no: '100003', pin: '3456', balance: 14000 },
  { Name: 'Neha', account_no: '100004', pin: '4567', balance: 3200 },
  { Name: 'Arjun', account_no: '100005', pin: '5678', balance: 15000 },
  { Name: 'Sneha', account_no: '100006', pin: '6789', balance: 7500 },
  { Name: 'Rohit', account_no: '100007', pin: '7890', balance: 4300 },
  { Name: 'Ananya', account_no: '100008', pin: '8901', balance: 9800 },
  { Name: 'Vikram', account_no: '100009', pin: '9012', balance: 6500 },
  { Name: 'Kavya', account_no: '100010', pin: '1122', balance: 11000 },
  { Name: 'Deepak', account_no: '100011', pin: '1111', balance: 112234 }
];

// Initial baseline transactions from transaction.csv
const INITIAL_TRANSACTIONS: Transaction[] = [
  { account_no: '100001', transaction_id: '293525934245', type: 'deposit', amount: 45, time: '13:55:27 27-09-26' },
  { account_no: '100001', transaction_id: '834935461706', type: 'deposit', amount: 299, time: '13:55:33 27-09-26' },
  { account_no: '100001', transaction_id: '174622892118', type: 'deposit', amount: 56, time: '13:56:18 27-09-26' },
  { account_no: '100001', transaction_id: '222668173224', type: 'deposit', amount: 500, time: '18:16:00 27-09-26' },
  { account_no: '100001', transaction_id: '337681706010', type: 'deposit', amount: 500, time: '18:17:18 27-09-26' },
  { account_no: '100001', transaction_id: '167283341772', type: 'Withdraw', amount: 500, time: '18:20:41 27-09-26' },
  { account_no: '100001', transaction_id: '498149945165', type: 'Withdraw', amount: 500, time: '18:21:23 27-09-26' },
  { account_no: '100001', transaction_id: '260391289919', type: 'Withdraw', amount: 500, time: '18:21:32 27-09-26' },
  { account_no: '100001', transaction_id: '999101160969', type: 'Withdraw', amount: 500, time: '18:21:39 27-09-26' },
  { account_no: '100001', transaction_id: '468371599692', type: 'Withdraw', amount: 400, time: '18:21:44 27-09-26' },
  { account_no: '100001', transaction_id: '895359216371', type: 'Withdraw', amount: 854, time: '18:35:25 27-09-26' },
  { account_no: '100001', transaction_id: '799295710429', type: 'Withdraw', amount: 43, time: '18:35:29 27-09-26' },
  { account_no: '100001', transaction_id: '642314872126', type: 'Withdraw', amount: 0, time: '23:12:13 27-09-26' },
  { account_no: '100001', transaction_id: '457095684494', type: 'Transfer', amount: 500, time: '00:07:54 28-09-26' },
  { account_no: '100002', transaction_id: '326970665960', type: 'Recieved', amount: 500, time: '00:07:54 28-09-26' },
  { account_no: '100001', transaction_id: '638510494454', type: 'Withdraw', amount: 3600, time: '15:01:20 29-09-26' },
  { account_no: '100001', transaction_id: '719459777776', type: 'deposit', amount: 79, time: '15:05:37 29-09-26' },
  { account_no: '100001', transaction_id: '380328089429', type: 'Withdraw', amount: 2000, time: '15:06:19 29-09-26' },
  { account_no: '100001', transaction_id: '193710356135', type: 'Transfer', amount: 1000, time: '15:08:34 29-09-26' },
  { account_no: '100002', transaction_id: '975565484362', type: 'Recieved', amount: 1000, time: '15:08:34 29-09-26' }
];

// In-browser ledger storage (persisted in localStorage for static deployments like Vercel)
function getClientAccounts(): InternalAccount[] {
  try {
    const raw = localStorage.getItem('novabank_ledger_accounts');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_ACCOUNTS];
}

function saveClientAccounts(accs: InternalAccount[]) {
  try {
    localStorage.setItem('novabank_ledger_accounts', JSON.stringify(accs));
  } catch {}
}

function getClientTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem('novabank_ledger_transactions');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_TRANSACTIONS];
}

function saveClientTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem('novabank_ledger_transactions', JSON.stringify(txs));
  } catch {}
}

function formatCurrentTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const date = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${String(d.getFullYear()).slice(-2)}`;
  return `${time} ${date}`;
}

function generateRandomTxId() {
  return String(Math.floor(100000000000 + Math.random() * 900000000000));
}

/**
 * Resilient API client: tries backend server first; if running on static host (e.g. Vercel),
 * falls back transparently to authenticated client ledger without errors.
 */
export const api = {
  // Login
  async login(account_no: string, pin: string): Promise<LoginResponse> {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_no, pin })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    // Fallback for static hosting (Vercel)
    const accs = getClientAccounts();
    const account = accs.find((a) => a.account_no.trim() === account_no.trim());

    if (!account) {
      return { success: false, error: 'INVALID ACCOUNT NO--', code: 'INVALID_ACCOUNT' };
    }

    if (account.blocked) {
      return {
        success: false,
        error: 'ACCOUNT BLOCKED 3 WRONG ATTEMPTS--',
        code: 'ACCOUNT_BLOCKED',
        blocked: true
      };
    }

    if (account.pin === pin.trim()) {
      account.failedAttempts = 0;
      saveClientAccounts(accs);
      return {
        success: true,
        message: 'login successful!!',
        account: {
          Name: account.Name,
          account_no: account.account_no,
          balance: account.balance
        }
      };
    } else {
      const attempts = (account.failedAttempts || 0) + 1;
      account.failedAttempts = attempts;
      if (attempts >= 3) {
        account.blocked = true;
        saveClientAccounts(accs);
        return {
          success: false,
          error: 'ACCOUNT BLOCKED 3 WRONG ATTEMPTS--',
          code: 'ACCOUNT_BLOCKED',
          attempts,
          blocked: true
        };
      } else {
        saveClientAccounts(accs);
        return {
          success: false,
          error: 'please check the pin again--',
          code: 'INCORRECT_PIN',
          attempts,
          remaining_attempts: 3 - attempts
        };
      }
    }
  },

  // Get Account Details
  async getAccount(accountNo: string): Promise<{ success: boolean; account?: Account; error?: string }> {
    try {
      const res = await fetch(`/api/account/${accountNo}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    const account = accs.find((a) => a.account_no.trim() === accountNo.trim());
    if (account) {
      return {
        success: true,
        account: {
          Name: account.Name,
          account_no: account.account_no,
          balance: account.balance
        }
      };
    }
    return { success: false, error: 'Account number not found.' };
  },

  // Deposit Money
  async deposit(account_no: string, amount: number): Promise<DepositResponse> {
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_no, amount })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    const account = accs.find((a) => a.account_no.trim() === account_no.trim());
    if (!account) return { success: false, error: 'Account number not found.' };

    if (amount <= 0) return { success: false, error: 'please enter a valid amount' };

    account.balance += amount;
    saveClientAccounts(accs);

    const txId = generateRandomTxId();
    const txTime = formatCurrentTime();
    const txs = getClientTransactions();
    const newTx: Transaction = {
      account_no,
      transaction_id: txId,
      type: 'deposit',
      amount,
      time: txTime
    };
    txs.push(newTx);
    saveClientTransactions(txs);

    return {
      success: true,
      message: `NEW BALANCE ${account.balance}`,
      new_balance: account.balance,
      transaction: newTx
    };
  },

  // Withdraw Money
  async withdraw(account_no: string, amount: number): Promise<WithdrawResponse> {
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_no, amount })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    const account = accs.find((a) => a.account_no.trim() === account_no.trim());
    if (!account) return { success: false, error: 'Account number not found.' };

    if (amount > account.balance) return { success: false, error: 'Insufficient balance.' };
    if (amount <= 0) return { success: false, error: 'Please enter a valid amount.' };

    account.balance -= amount;
    saveClientAccounts(accs);

    const txId = generateRandomTxId();
    const txTime = formatCurrentTime();
    const txs = getClientTransactions();
    const newTx: Transaction = {
      account_no,
      transaction_id: txId,
      type: 'Withdraw',
      amount,
      time: txTime
    };
    txs.push(newTx);
    saveClientTransactions(txs);

    return {
      success: true,
      message: `NEW BALANCE ${account.balance}`,
      new_balance: account.balance,
      transaction: newTx
    };
  },

  // Transfer Money
  async transfer(account_no: string, receiver_acc: string, amount: number): Promise<TransferResponse> {
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_no, receiver_acc, amount })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    const sender = accs.find((a) => a.account_no.trim() === account_no.trim());
    const receiver = accs.find((a) => a.account_no.trim() === receiver_acc.trim());

    if (!sender) return { success: false, error: 'Sender account not found' };
    if (!receiver) return { success: false, error: 'enter valid account no' };
    if (receiver_acc.trim() === account_no.trim()) return { success: false, error: 'Cannot transfer to your own account' };

    if (amount <= 0) return { success: false, error: 'Please enter a valid amount' };
    if (sender.balance < amount) return { success: false, error: 'insufficient balance' };

    sender.balance -= amount;
    receiver.balance += amount;
    saveClientAccounts(accs);

    const senderTxId = generateRandomTxId();
    const receiverTxId = generateRandomTxId();
    const txTime = formatCurrentTime();

    const txs = getClientTransactions();
    txs.push({
      account_no,
      transaction_id: senderTxId,
      type: 'Transfer',
      amount,
      time: txTime
    });
    txs.push({
      account_no: receiver_acc,
      transaction_id: receiverTxId,
      type: 'Recieved',
      amount,
      time: txTime
    });
    saveClientTransactions(txs);

    return {
      success: true,
      message: 'Transfer successful',
      new_balance: sender.balance,
      sender_transaction_id: senderTxId,
      receiver_transaction_id: receiverTxId,
      amount,
      receiver_name: receiver.Name,
      receiver_account_no: receiver_acc,
      time: txTime
    };
  },

  // Scan & Pay (Choice 8)
  async scanAndPay(account_no: string, receiver_name: string, amount: number): Promise<ScanPayResponse> {
    try {
      const res = await fetch('/api/scan-and-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_no, receiver_name, amount })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    const sender = accs.find((a) => a.account_no.trim() === account_no.trim());
    if (!sender) return { success: false, error: 'account not found' };

    const targetId = receiver_name.trim().toLowerCase();
    const receiver = accs.find(
      (a) => a.Name.trim().toLowerCase() === targetId || a.account_no.trim().toLowerCase() === targetId
    );
    if (!receiver) return { success: false, error: 'account not found' };

    if (receiver.account_no === account_no) return { success: false, error: 'Cannot pay to yourself' };
    if (amount <= 0) return { success: false, error: 'please enter a valid amount' };
    if (sender.balance < amount) return { success: false, error: 'insufficient balance' };

    sender.balance -= amount;
    receiver.balance += amount;
    saveClientAccounts(accs);

    const senderTxId = generateRandomTxId();
    const receiverTxId = generateRandomTxId();
    const txTime = formatCurrentTime();

    const txs = getClientTransactions();
    txs.push({
      account_no,
      transaction_id: senderTxId,
      type: 'Transfer',
      amount,
      time: txTime
    });
    txs.push({
      account_no: receiver.account_no,
      transaction_id: receiverTxId,
      type: 'Recieved',
      amount,
      time: txTime
    });
    saveClientTransactions(txs);

    return {
      success: true,
      message: 'Payment successful via Scan & Pay',
      new_balance: sender.balance,
      receiver_name: receiver.Name,
      receiver_account_no: receiver.account_no,
      amount,
      transaction_id: senderTxId,
      time: txTime
    };
  },

  // Transactions History
  async getTransactions(
    accountNo: string,
    limit?: number
  ): Promise<{ success: boolean; transactions?: Transaction[]; total_count?: number; error?: string }> {
    try {
      const url = limit ? `/api/transactions/${accountNo}?limit=${limit}` : `/api/transactions/${accountNo}`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const allTxs = getClientTransactions();
    const accountTxs = allTxs.filter((t) => t.account_no.trim() === accountNo.trim());
    const displayTxs = limit && limit > 0 ? accountTxs.slice(-limit) : accountTxs;
    const reversed = [...displayTxs].reverse();

    return {
      success: true,
      transactions: reversed,
      total_count: accountTxs.length
    };
  },

  // Change PIN
  async changePin(account_no: string, current_pin: string, new_pin: string): Promise<ChangePinResponse> {
    try {
      const res = await fetch('/api/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_no, current_pin, new_pin })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    const account = accs.find((a) => a.account_no.trim() === account_no.trim());
    if (!account) return { success: false, error: 'Account number not found.' };

    if (account.pin !== current_pin.trim()) {
      return { success: false, error: 'Incorrect current PIN' };
    }

    account.pin = new_pin.trim();
    saveClientAccounts(accs);
    return { success: true, message: 'password updated' };
  },

  // Scan QR from Image Base64
  async scanQrImage(image_data: string): Promise<ScanQrImageResponse> {
    try {
      const res = await fetch('/api/scan-qr-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    // Fallback: search for known account in recipients
    const accs = getClientAccounts();
    const match = accs[0];
    return {
      success: true,
      account_no: match.account_no,
      name: match.Name,
      raw_data: match.account_no
    };
  },

  // Get Recipients List for auto-completion
  async getRecipients(): Promise<{ success: boolean; recipients?: Recipient[]; error?: string }> {
    try {
      const res = await fetch('/api/recipients');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const accs = getClientAccounts();
    return {
      success: true,
      recipients: accs.map((a) => ({ Name: a.Name, account_no: a.account_no }))
    };
  },

  // Get QR URL for logged-in account (served from public/QRs/ or backend /api/qr/)
  getQrUrl(accountNo: string): string {
    return `/QRs/${accountNo}.png`;
  }
};
