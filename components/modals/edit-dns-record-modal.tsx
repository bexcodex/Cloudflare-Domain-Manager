'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAccounts } from '@/context/account-context';
import { Zone, DnsRecord, CloudflareResponse } from '@/lib/types';

interface EditDnsRecordModalProps {
  zone: Zone;
  record: DnsRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDnsRecordUpdated: (updatedRecord: DnsRecord) => void;
}

export function EditDnsRecordModal({ zone, record, open, onOpenChange, onDnsRecordUpdated }: EditDnsRecordModalProps) {
  const { selectedAccount } = useAccounts();
  const [type, setType] = useState(record.type);
  const [name, setName] = useState(record.name);
  const [content, setContent] = useState(record.content);
  const [proxied, setProxied] = useState(record.proxied);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setType(record.type);
      setName(record.name);
      setContent(record.content);
      setProxied(record.proxied);
      setError(null);
    }
  }, [open, record]);

  const handleSubmit = async () => {
    if (!selectedAccount) return;
    setError(null);

    try {
      const res = await fetch(`/api/cloudflare/zones/${zone.id}/dns_records/${record.id}`, {
        method: 'PUT',
        headers: {
          'X-Auth-Email': selectedAccount.email,
          'X-Auth-Key': selectedAccount.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, name, content, proxied, ttl: 1 }),
      });

      const data: CloudflareResponse<DnsRecord> = await res.json();

      if (data.success) {
        onDnsRecordUpdated(data.result);
        onOpenChange(false);
      } else {
        setError(data.errors.map(e => e.message).join(', '));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit DNS Record for {zone.name}</DialogTitle>
          <DialogDescription>Modify the details for the DNS record.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">Type</label>
            <Select value={type} onValueChange={(value) => setType(value as DnsRecord['type'])}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="AAAA">AAAA</SelectItem>
                <SelectItem value="CNAME">CNAME</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
                <SelectItem value="NS">NS</SelectItem>
                <SelectItem value="MX">MX</SelectItem>
                <SelectItem value="SRV">SRV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="@ for root" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="content" className="text-right">Content</label>
            <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" placeholder="IP address or domain" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="proxied" className="text-right">Proxy</label>
            <Switch id="proxied" checked={proxied} onCheckedChange={setProxied} />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
