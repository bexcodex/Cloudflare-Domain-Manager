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
import { Zone, CloudflareResponse } from '@/lib/types';

import { NameserverInstructions } from '@/components/nameserver-instructions';

interface AddDomainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainAdded: (zone: Zone) => void;
}

export function AddDomainModal({ open, onOpenChange, onDomainAdded }: AddDomainModalProps) {
  const { selectedAccount } = useAccounts();
  const [domainName, setDomainName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newlyAddedZone, setNewlyAddedZone] = useState<Zone | null>(null);

  const handleSubmit = async () => {
    if (!selectedAccount) return;
    setError(null);

    try {
      const res = await fetch(`/api/cloudflare/zones`, {
        method: 'POST',
        headers: {
          'X-Auth-Email': selectedAccount.email,
          'X-Auth-Key': selectedAccount.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domainName,
          account: { id: selectedAccount.id },
          jump_start: true,
        }),
      });

      const data: CloudflareResponse<Zone> = await res.json();

      if (data.success) {
        onDomainAdded(data.result);
        setNewlyAddedZone(data.result);
      } else {
        setError(data.errors.map(e => e.message).join(', '));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setDomainName('');
      setError(null);
      setNewlyAddedZone(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{newlyAddedZone ? 'Domain Added Successfully' : 'Add New Domain'}</DialogTitle>
          {!newlyAddedZone && (
            <DialogDescription>Enter the domain name you want to add to Cloudflare.</DialogDescription>
          )}
        </DialogHeader>
        {newlyAddedZone ? (
          <NameserverInstructions zone={newlyAddedZone} />
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="domain-name" className="text-right">Domain Name</label>
              <Input
                id="domain-name"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="col-span-3"
                placeholder="example.com"
              />
            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
        <DialogFooter>
          {newlyAddedZone ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <Button type="submit" onClick={handleSubmit}>Add Domain</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
