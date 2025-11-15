'use client';

import { useState, useCallback } from 'react';
import { useAccounts } from '@/context/account-context';
import { Button } from '@/components/ui/button';
import { AddAccountModal } from '@/components/modals/add-account-modal';
import { AddDomainModal } from '@/components/modals/add-domain-modal';
import { DomainList } from './domain-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { PanelLeft, PlusCircle, Home, UserPlus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Dashboard() {
  const { accounts, selectedAccount, selectAccount } = useAccounts();
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [refreshDomainList, setRefreshDomainList] = useState(0);

  const handleDomainAdded = useCallback(() => {
    setRefreshDomainList(prev => prev + 1);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Cloudflare Manager</h2>
      <nav className="grid items-start gap-2 text-sm font-medium">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Home className="h-4 w-4" />
          Home
        </a>
        {accounts.length > 0 && (
          <select
            value={selectedAccount?.id || ''}
            onChange={(e) => selectAccount(e.target.value)}
            className="p-2 border rounded-md bg-background text-sm sm:text-base w-full"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.email}</option>
            ))}
          </select>
        )}
        <Button onClick={() => setIsAddAccountModalOpen(true)} variant="outline" size="sm" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Account
        </Button>
        {selectedAccount && (
          <Button onClick={() => setIsAddDomainModalOpen(true)} variant="outline" size="sm" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Domain
          </Button>
        )}
      </nav>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 p-4">
          <SidebarContent />
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-xl font-bold md:hidden">Cloudflare Manager</h1>
          </div>
          <ThemeToggleButton />
        </header>
        <main className="flex-1 p-4 md:p-8">
          {selectedAccount ? (
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Domains</h2>
                <p className="text-muted-foreground">
                  Managing domains for {selectedAccount.email}
                </p>
              </div>
              <DomainList key={refreshDomainList} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-lg text-center">
                <CardHeader>
                  <CardTitle>Welcome to Cloudflare Manager</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    It looks like you don&apos;t have any Cloudflare accounts linked yet.
                  </p>
                  <Button onClick={() => setIsAddAccountModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add your first account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <AddAccountModal open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen} />
      <AddDomainModal
        open={isAddDomainModalOpen}
        onOpenChange={setIsAddDomainModalOpen}
        onDomainAdded={handleDomainAdded}
      />
    </div>
  );
}
