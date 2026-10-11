"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  /** The tab is also active on URLs starting with one of these (e.g. a match inside "Matches"). */
  prefixes?: string[];
};

/** Horizontal tabs; the one matching the current URL is highlighted. */
export function NavTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 mb-6 overflow-x-auto border-b border-line px-4">
      <ul className="flex gap-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.prefixes ?? []).some((p) => pathname.startsWith(p));
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                  active ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
