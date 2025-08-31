
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/editor/")) {
    return null;
  }

  return (
    <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t bg-card mt-auto" aria-hidden="false">
      Desenvolvido por:{" "}
      <Link
        href="https://www.linkedin.com/in/byjuliogomes/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline underline-offset-4 hover:text-primary"
      >
        Júlio Cesar Gomes
      </Link>
    </footer>
  );
}
