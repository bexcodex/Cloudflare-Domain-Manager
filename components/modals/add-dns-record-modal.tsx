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
import { Zone, DnsRecord, DnsRecordType, CloudflareResponse } from '@/lib/types';

const dnsRecordTypes: DnsRecordType[] = [
  'A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA', 'CERT', 'DNSKEY',
  'DS', 'NAPTR', 'SMIMEA', 'SSHFP', 'SVCB', 'TLSA', 'URI', 'PTR', 'HTTPS'
];

interface AddDnsRecordModalProps {
  zone: Zone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDnsRecordAdded: (record: DnsRecord) => void;
}

export function AddDnsRecordModal({ zone, open, onOpenChange, onDnsRecordAdded }: AddDnsRecordModalProps) {
  const { selectedAccount } = useAccounts();
  const [type, setType] = useState<DnsRecordType>('A');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [proxied, setProxied] = useState(true);
  const [priority, setPriority] = useState<number | undefined>(10);
  const [srvData, setSrvData] = useState({ service: '', proto: '_tcp', name: '', priority: 1, weight: 1, port: 1, target: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(zone.name);
  }, [zone.name]);

  const handleSubmit = async () => {
    if (!selectedAccount) return;
    setError(null);

    let recordContent = content;
    if (type === 'SRV') {
      recordContent = `${srvData.service} ${srvData.proto} ${srvData.name} ${srvData.priority} ${srvData.weight} ${srvData.port} ${srvData.target}`;
    }

    const body: any = { type, name, content: recordContent, proxied, ttl: 1 };
    if (type === 'MX') {
      body.priority = priority;
    }
    if (type === 'SRV') {
      body.data = {
        service: srvData.service,
        proto: srvData.proto,
        name: srvData.name,
        priority: srvData.priority,
        weight: srvData.weight,
        port: srvData.port,
        target: srvData.target,
      };
    }

    try {
      const res = await fetch(`/api/cloudflare/zones/${zone.id}/dns_records`, {
        method: 'POST',
        headers: {
          'X-Auth-Email': selectedAccount.email,
          'X-Auth-Key': selectedAccount.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data: CloudflareResponse<DnsRecord> = await res.json();

      if (data.success) {
        onDnsRecordAdded(data.result);
        onOpenChange(false);
      } else {
        setError(data.errors.map(e => e.message).join(', '));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSrvChange = (field: keyof typeof srvData, value: string | number) => {
    setSrvData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add DNS Record to {zone.name}</DialogTitle>
          <DialogDescription>Enter the details for the new DNS record.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">Type</label>
            <Select value={type} onValueChange={(value) => setType(value as DnsRecordType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {dnsRecordTypes.map(recordType => (
                  <SelectItem key={recordType} value={recordType}>{recordType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="@ for root" />
          </div>
          {type === 'MX' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priority" className="text-right">Priority</label>
              <Input id="priority" type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10))} className="col-span-3" />
            </div>
          )}
          {type === 'SRV' ? (
            <div className="grid grid-cols-2 gap-2 col-span-4">
              <Input placeholder="Service" value={srvData.service} onChange={e => handleSrvChange('service', e.target.value)} />
              <Input placeholder="Proto" value={srvData.proto} onChange={e => handleSrvChange('proto', e.target.value)} />
              <Input placeholder="Priority" type="number" value={srvData.priority} onChange={e => handleSrvChange('priority', parseInt(e.target.value, 10))} />
              <Input placeholder="Weight" type="number" value={srvData.weight} onChange={e => handleSrvChange('weight', parseInt(e.target.value, 10))} />
              <Input placeholder="Port" type="number" value={srvData.port} onChange={e => handleSrvChange('port', parseInt(e.target.value, 10))} />
              <Input placeholder="Target" value={srvData.target} onChange={e => handleSrvChange('target', e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="content" className="text-right">Content</label>
              <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" placeholder="IP address, domain, or text" />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="proxied" className="text-right">Proxy</label>
            <Switch id="proxied" checked={proxied} onCheckedChange={setProxied} disabled={!['A', 'AAAA', 'CNAME'].includes(type)} />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
