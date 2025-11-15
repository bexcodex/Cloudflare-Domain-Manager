'use client';

import { useParams } from 'next/navigation';
import { DnsRecordManagement } from '@/components/dns-record-management';

export const runtime = 'edge';

export default function ZoneDetailsPage() {
  const params = useParams();
  const zoneId = params.zoneId as string;

  return (
    <>
      {zoneId ? <DnsRecordManagement zoneId={zoneId} /> : <p>Loading...</p>}
    </>
  );
}
