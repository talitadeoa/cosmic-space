import EmailSubscribeLanding from '@/components/home/EmailSubscribeLanding';
import Link from 'next/link';

export default function LegacySubscribePage() {
  return (
    <div>
      <EmailSubscribeLanding />
      <div className="mt-8 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/home"
            className="inline-block rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Preview da Home
          </Link>
          <Link
            href="/home/alternativa"
            className="inline-block rounded-lg border border-white/20 px-6 py-2 text-white transition-colors hover:border-white/40"
          >
            Home alternativa
          </Link>
        </div>
      </div>
    </div>
  );
}
