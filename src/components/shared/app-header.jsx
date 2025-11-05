'use client';

import Image from 'next/image';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="fixed left-6 top-6 z-50">
      <Link 
        href="/" 
        className="inline-flex items-center gap-3 transition hover:opacity-80"
      >
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image src="/SpaceUp-Icon.jpg" alt="SpaceUp" fill sizes="48px" className="object-cover" />
        </div>
      </Link>
    </header>
  );
}
