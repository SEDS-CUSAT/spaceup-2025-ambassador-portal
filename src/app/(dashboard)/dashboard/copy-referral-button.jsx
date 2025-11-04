'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function CopyReferralButton({ referralCode }) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    if (!referralCode) {
      toast.error('Referral code unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setIsCopied(true);
      toast.success('Referral code copied');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Unable to copy right now');
    }
  }

  return (
    <Button variant="secondary" onClick={handleCopy} className="gap-2">
      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {isCopied ? 'Copied' : 'Copy code'}
    </Button>
  );
}
