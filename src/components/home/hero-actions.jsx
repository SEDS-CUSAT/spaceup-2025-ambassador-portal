'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Button onClick={() => router.push('/dashboard')} className="rounded-full px-6">
        Launch dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => router.push('/register')}
        variant="secondary"
        className="rounded-full border-white/25 px-5 text-white/80 hover:border-white/50"
      >
        Become an ambassador
      </Button>
    </div>
  );
}
