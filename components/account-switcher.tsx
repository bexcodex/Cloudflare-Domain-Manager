'use client';

import { useAccounts } from '@/context/account-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AccountSwitcher() {
  const { accounts, selectedAccount, selectAccount } = useAccounts();

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="w-[200px]">
      <Select
        value={selectedAccount?.id || ''}
        onValueChange={(value: string) => selectAccount(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select account..." />
        </SelectTrigger>
        <SelectContent>
          {accounts.map(acc => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
