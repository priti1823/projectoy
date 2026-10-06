export interface Account {
  Name: string;
  account_no: string;
  balance: number;
}

export type TransactionType = 'deposit' | 'Withdraw' | 'Transfer' | 'Recieved';

export interface Transaction {
  account_no: string;
  transaction_id: string;
  type: TransactionType | string;
  amount: number | string;
  time: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  account?: Account;
  error?: string;
  code?: 'INVALID_ACCOUNT' | 'INCORRECT_PIN' | 'ACCOUNT_BLOCKED' | string;
  attempts?: number;
  remaining_attempts?: number;
  blocked?: boolean;
}

export interface DepositResponse {
  success: boolean;
  message?: string;
  new_balance?: number;
  transaction?: Transaction;
  error?: string;
}

export interface WithdrawResponse {
  success: boolean;
  message?: string;
  new_balance?: number;
  transaction?: Transaction;
  error?: string;
}

export interface TransferResponse {
  success: boolean;
  message?: string;
  new_balance?: number;
  sender_transaction_id?: string;
  receiver_transaction_id?: string;
  amount?: number;
  receiver_name?: string;
  receiver_account_no?: string;
  time?: string;
  error?: string;
}

export interface ScanPayResponse {
  success: boolean;
  message?: string;
  new_balance?: number;
  receiver_name?: string;
  receiver_account_no?: string;
  amount?: number;
  transaction_id?: string;
  time?: string;
  error?: string;
}

export interface ChangePinResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ScanQrImageResponse {
  success: boolean;
  account_no?: string;
  name?: string | null;
  raw_data?: string;
  error?: string;
  warning?: string;
}

export interface Recipient {
  Name: string;
  account_no: string;
}
