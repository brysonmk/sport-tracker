import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-line bg-card">
      <nav aria-label="Main" className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="text-xl">⚽</span>
          Sports Tracker
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/about" className="text-muted hover:text-fg">About</Link>
          <Link href="/new" className="rounded-full bg-accent px-3 py-1.5 font-medium text-accent-fg hover:opacity-90">
            New league
          </Link>
        </div>
      </nav>
    </header>
  );
}
