import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mx-auto mt-2 max-w-sm text-muted">
        The league or match may have been deleted, or the link was copied incompletely.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/open" className={buttonClasses("secondary")}>
          Paste a link
        </Link>
        <Link href="/" className={buttonClasses("primary")}>
          Home
        </Link>
      </div>
    </div>
  );
}
