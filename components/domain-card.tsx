'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zone } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Globe, Server } from 'lucide-react';

interface DomainCardProps {
  zone: Zone;
}

export function DomainCard({ zone }: DomainCardProps) {
  const statusColor = zone.status === 'active' ? 'text-green-500' : 'text-gray-500';
  const statusIcon = zone.status === 'active' ? <Globe className={`h-4 w-4 ${statusColor}`} /> : <Server className={`h-4 w-4 ${statusColor}`} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/zones/${zone.id}`} passHref>
        <div className="group flex items-center justify-between p-4 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer bg-card">
          <div className="flex flex-col min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate group-hover:text-primary">{zone.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              {statusIcon}
              <span className={`capitalize ${statusColor}`}>{zone.status}</span>
            </div>
          </div>
          <Button variant="outline">Manage</Button>
        </div>
      </Link>
    </motion.div>
  );
}
