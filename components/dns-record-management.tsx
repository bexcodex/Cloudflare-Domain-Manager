'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DnsRecord, Zone, CloudflareResponse } from '@/lib/types';
import { useAccounts } from '@/context/account-context';
import { Button } from '@/components/ui/button';
import { AddDnsRecordModal } from './modals/add-dns-record-modal';
import { ConfirmDialog } from './ui/confirm-dialog';
import { PlusCircle } from 'lucide-react';
import { DnsRecordRow } from './dns-record-row';

interface DnsRecordManagementProps {
  zoneId: string;
}

export function DnsRecordManagement({ zoneId }: DnsRecordManagementProps) {
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeletingDomain, setIsDeletingDomain] = useState(false);
  const { selectedAccount } = useAccounts();
  const [zone, setZone] = useState<Zone | null>(null);
  const router = useRouter();

  const fetchZoneDetails = async () => {
    if (!selectedAccount) return;
    try {
      const res = await fetch(`/api/cloudflare/zones/${zoneId}`, {
        headers: { 'X-Auth-Email': selectedAccount.email, 'X-Auth-Key': selectedAccount.apiKey },
      });
      const data: CloudflareResponse<Zone> = await res.json();
      if (data.success) setZone(data.result);
    } catch (err) { console.error(err); }
  };

  const fetchDnsRecords = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cloudflare/zones/${zoneId}/dns_records`, {
        headers: { 'X-Auth-Email': selectedAccount.email, 'X-Auth-Key': selectedAccount.apiKey },
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data: CloudflareResponse<DnsRecord[]> = await res.json();
      if (data.success) {
        setDnsRecords(data.result);
      } else {
        setError(data.errors.map(e => e.message).join(', '));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZoneDetails();
    fetchDnsRecords();
  }, [selectedAccount, zoneId]);

  const handleDnsRecordAdded = (newRecord: DnsRecord) => setDnsRecords(prev => [...prev, newRecord]);
  const handleDnsRecordUpdated = (updatedRecord: DnsRecord) => setDnsRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  const handleDnsRecordDeleted = (deletedRecordId: string) => setDnsRecords(prev => prev.filter(r => r.id !== deletedRecordId));

  const handleDeleteDomain = async () => {
    if (!selectedAccount) return;
    setIsDeletingDomain(true);
    setError(null);
    try {
      await fetch(`/api/cloudflare/zones/${zoneId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Email': selectedAccount.email, 'X-Auth-Key': selectedAccount.apiKey },
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeletingDomain(false);
    }
  };

  if (!zone) return <p>Loading zone details...</p>;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">DNS Management</h2>
          <p className="text-muted-foreground">Manage DNS records for {zone.name}.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Record
          </Button>
          <ConfirmDialog
            trigger={<Button variant="destructive" disabled={isDeletingDomain}>{isDeletingDomain ? 'Deleting...' : 'Delete Domain'}</Button>}
            title="Are you absolutely sure?"
            description={`This action cannot be undone. This will permanently delete the domain ${zone.name} and all its DNS records.`}
            onConfirm={handleDeleteDomain}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        {loading && (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-16 bg-muted rounded-md"></div>
                  <div className="h-5 w-40 bg-muted rounded-md"></div>
                  <div className="h-5 w-40 bg-muted rounded-md"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-muted rounded-md"></div>
                  <div className="h-8 w-8 bg-muted rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-500 p-4">Error: {error}</p>}
        {!loading && !error && dnsRecords.length > 0 ? (
          dnsRecords.map((record, index) => (
            <DnsRecordRow
              key={record.id}
              zone={zone}
              record={record}
              isLast={index === dnsRecords.length - 1}
              onDnsRecordDeleted={handleDnsRecordDeleted}
              onDnsRecordUpdated={handleDnsRecordUpdated}
            />
          ))
        ) : (
          !loading && !error && (
            <div className="p-4 text-center text-muted-foreground">
              No DNS records found.
            </div>
          )
        )}
      </div>

      <AddDnsRecordModal
        zone={zone}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onDnsRecordAdded={handleDnsRecordAdded}
      />
    </>
  );
}
