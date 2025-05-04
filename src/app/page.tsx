import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/leaders">For Leaders</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/viewers">For Viewers</Link>
        </Button>
      </div>
    </div>
  );
}
