'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '@/lib/hooks/use-local-storage';

export interface CloudflareAccount {
  id: string;
  email: string;
  apiKey: string;
}

interface AccountContextType {
  accounts: CloudflareAccount[];
  addAccount: (account: Omit<CloudflareAccount, 'id'>) => Promise<{ success: boolean; error?: string }>;
  removeAccount: (id: string) => void;
  selectedAccount: CloudflareAccount | null;
  selectAccount: (id: string | null) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useLocalStorage<CloudflareAccount[]>('cf-accounts', []);
  const [selectedAccountId, setSelectedAccountId] = useLocalStorage<string | null>('cf-selected-account', null);

  const addAccount = async (account: Omit<CloudflareAccount, 'id'>) => {
    try {
      const res = await fetch('/api/cloudflare/accounts', {
        headers: {
          'X-Auth-Email': account.email,
          'X-Auth-Key': account.apiKey,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch Cloudflare account details.');
      }

      const data = await res.json();

      if (data.success && data.result.length > 0) {
        const cloudflareAccount = data.result[0];
        const newAccount = { ...account, id: cloudflareAccount.id };
        const updatedAccounts = [...accounts, newAccount];
        setAccounts(updatedAccounts);
        if (!selectedAccountId) {
          setSelectedAccountId(newAccount.id);
        }
        return { success: true };
      } else {
        throw new Error(data.errors.map((e: any) => e.message).join(', ') || 'No accounts found for these credentials.');
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeAccount = (id: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(updatedAccounts);
    if (selectedAccountId === id) {
      setSelectedAccountId(updatedAccounts.length > 0 ? updatedAccounts[0].id : null);
    }
  };

  const selectAccount = (id: string | null) => {
    setSelectedAccountId(id);
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId) || null;

  return (
    <AccountContext.Provider value={{ accounts, addAccount, removeAccount, selectedAccount, selectAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
