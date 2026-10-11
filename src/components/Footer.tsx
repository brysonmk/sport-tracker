import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line py-6 text-center text-sm text-muted">
      <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-4">
        <Link href="/about" className="hover:text-fg">About</Link>
        <Link href="/open" className="hover:text-fg">Open a league</Link>
        <Link href="/contact" className="hover:text-fg">Contact</Link>
        <a href="https://github.com/brysonmk/sport-tracker" className="hover:text-fg">GitHub</a>
      </nav>
    </footer>
  );
}
