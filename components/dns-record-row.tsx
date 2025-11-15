'use client';

import { DnsRecord, Zone } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cloud, CloudOff, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditDnsRecordModal } from './modals/edit-dns-record-modal';
import { useState } from 'react';
import { ConfirmDialog } from './ui/confirm-dialog';
import { useAccounts } from '@/context/account-context';
import { useRouter } from 'next/navigation';

interface DnsRecordRowProps {
  zone: Zone;
  record: DnsRecord;
  isLast: boolean;
  onDnsRecordUpdated: (updatedRecord: DnsRecord) => void;
  onDnsRecordDeleted: (deletedRecordId: string) => void;
}

export function DnsRecordRow({ zone, record, isLast, onDnsRecordUpdated, onDnsRecordDeleted }: DnsRecordRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedAccount } = useAccounts();
  const router = useRouter();

  const handleDelete = async () => {
    if (!selectedAccount) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/cloudflare/zones/${zone.id}/dns_records/${record.id}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Email': selectedAccount.email,
          'X-Auth-Key': selectedAccount.apiKey,
        },
      });
      onDnsRecordDeleted(record.id);
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={cn('p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', !isLast && 'border-b')}>
        <div className="flex items-center gap-x-4 min-w-0">
          <Badge variant="secondary" className="hidden sm:flex">{record.type}</Badge>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 min-w-0">
            <p className="font-mono truncate" title={record.name}>{record.name}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
            <p className="font-mono truncate text-muted-foreground sm:text-foreground" title={record.content}>{record.content}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
           <Badge variant="secondary" className="sm:hidden mr-2">{record.type}</Badge>
          <div className="flex items-center space-x-2">
            {record.proxied ? (
              <Cloud className="h-5 w-5 text-orange-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-muted-foreground" />
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              title="Are you sure?"
              description={`This will permanently delete the ${record.type} record for ${record.name}.`}
              onConfirm={handleDelete}
            />
          </div>
        </div>
      </div>
      <EditDnsRecordModal
        zone={zone}
        record={record}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onDnsRecordUpdated={onDnsRecordUpdated}
      />
    </>
  );
}
