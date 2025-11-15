'use client';

import { Zone } from '@/lib/types';

interface NameserverInstructionsProps {
  zone: Zone;
}

export function NameserverInstructions({ zone }: NameserverInstructionsProps) {
  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg mb-2">Next Steps: Update Your Nameservers</h3>
      <p className="text-sm text-muted-foreground mb-4">
        To complete the setup, you need to log in to your domain registrar (where you bought your domain) and replace your current nameservers with the following Cloudflare nameservers:
      </p>
      <div className="bg-secondary/50 p-4 rounded-md space-y-2">
        {zone.name_servers.map(ns => (
          <div key={ns} className="flex items-center justify-between">
            <p className="font-mono text-sm">{ns}</p>
            <button 
              onClick={() => navigator.clipboard.writeText(ns)}
              className="text-xs text-primary hover:underline"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        It may take some time for the nameserver changes to propagate.
      </p>
    </div>
  );
}
