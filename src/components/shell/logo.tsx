"use client";

import { cn } from "@/lib/utils";

/**
 * Anwar Group logo. The asset lives in `public/anwars-logo.webp` so it is served
 * by the app and bundled on Vercel — never read from a local D:\ path at runtime.
 */
export function Logo({ className, alt = "Anwar Group" }: { className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/anwars-logo.webp" alt={alt} className={cn("w-auto object-contain", className)} />
  );
}
