import { Logo } from "@/components/shell/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="flex items-center gap-3 border-b border-ink-200 bg-white px-6 py-3">
        <Logo className="h-9" />
        <span className="h-7 w-px bg-ink-200" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink-900">AGI OneDesk</p>
          <p className="text-[11px] text-ink-500">Anwar Group of Industries</p>
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <footer className="border-t border-ink-200 px-6 py-3 text-center text-xs text-ink-400">
        © 2026 Anwar Group of Industries · AGI OneDesk demonstration prototype
      </footer>
    </div>
  );
}
