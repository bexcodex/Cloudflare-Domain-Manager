'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/context/account-context';

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addAccount } = useAccounts();

  const handleSubmit = async () => {
    if (email && apiKey) {
      setIsLoading(true);
      setError(null);
      const result = await addAccount({ email, apiKey });
      setIsLoading(false);
      if (result.success) {
        onOpenChange(false);
        setEmail('');
        setApiKey('');
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cloudflare Account</DialogTitle>
          <DialogDescription>
            Enter your Cloudflare email and Global API Key.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right">
              Email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="user@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="api-key" className="text-right">
              API Key
            </label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Your Global API Key"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
