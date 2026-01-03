import Link from "next/link";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "mt-20" }: FooterProps) {
  return (
    <footer
      className={`container mx-auto border-t border-zinc-200 dark:border-zinc-800 px-6 py-8 ${className}`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-zinc-500">
            Live outbound API inspector - see what your code and AI agents
            actually sent, and why it failed.
          </div>
          <div className="flex gap-4 text-sm text-zinc-500">
            <Link
              href="/use-cases"
              className="hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Use Cases
            </Link>
            <Link
              href="/pricing"
              className="hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Pricing
            </Link>
            <a
              href="/privacy"
              className="hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
