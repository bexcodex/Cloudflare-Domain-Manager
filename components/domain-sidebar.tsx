'use client';

import { useEffect, useState } from 'react';
import { useAccounts } from '@/context/account-context';
import { CloudflareResponse, Zone } from '@/lib/types';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';

export function DomainSidebar() {
  const { selectedAccount } = useAccounts();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
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
        if (!res.ok) throw new Error(`Error: ${res.status}`);
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

    fetchZones();
  }, [selectedAccount]);

  return (
    <nav className="flex flex-col gap-2 text-sm font-medium">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary mb-4"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
      <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase">Domains</h3>
      {loading && (
        <div className="space-y-2 px-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 px-3">Error: {error}</p>}
      {!loading && !error && zones.map(zone => (
        <Link
          key={zone.id}
          href={`/zones/${zone.id}`}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            params.zoneId === zone.id && 'bg-muted text-primary'
          )}
        >
          {zone.name}
        </Link>
      ))}
    </nav>
  );
}
