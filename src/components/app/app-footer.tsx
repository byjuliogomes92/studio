
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export function AppFooter() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith("/editor/")) {
    return null;
  }

  return (
    <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t bg-card" aria-hidden="false">
       <div className="flex justify-center items-center gap-4">
        <span>&copy; {currentYear} Morfeus</span>
        <Separator orientation="vertical" className="h-4" />
         <span>
            Desenvolvido por:{" "}
            <Link
                href="https://www.linkedin.com/in/byjuliogomes/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 hover:text-primary"
            >
                Júlio Cesar Gomes
            </Link>
         </span>
         <Separator orientation="vertical" className="h-4" />
         <Link href="/support" className="font-medium underline underline-offset-4 hover:text-primary">
            Suporte
         </Link>
       </div>
    </footer>
  );
}
