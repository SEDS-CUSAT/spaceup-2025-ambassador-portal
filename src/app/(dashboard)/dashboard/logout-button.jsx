'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      setIsSigningOut(false);
    }
  }

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={isSigningOut} className="gap-2 text-white/80">
      <LogOut className="h-4 w-4" />
      {isSigningOut ? 'Signing out…' : 'Log out'}
    </Button>
  );
}
