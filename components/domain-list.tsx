'use client';

import { useEffect, useState } from 'react';
import { useAccounts } from '@/context/account-context';
import { CloudflareResponse, Zone } from '@/lib/types';
import { DomainCard } from './domain-card';

export function DomainList() {
  const { selectedAccount } = useAccounts();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cloudflare/zones', {
        headers: {
          'X-Auth-Email': selectedAccount.email,
          'X-Auth-Key': selectedAccount.apiKey,
        },
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data: CloudflareResponse<Zone[]> = await res.json();

      if (data.success) {
        setZones(data.result);
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
    fetchZones();
  }, [selectedAccount]);

  const handleDomainDeleted = (deletedZoneId: string) => {
    setZones(prev => prev.filter(zone => zone.id !== deletedZoneId));
  };

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {zones.map(zone => (
        <DomainCard
          key={zone.id}
          zone={zone}
        />
      ))}
    </div>
  );
}
