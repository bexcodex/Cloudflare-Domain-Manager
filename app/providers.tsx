'use client';

import { AccountProvider } from '@/context/account-context';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <AccountProvider>{children}</AccountProvider>;
}
