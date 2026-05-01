import { CheckSquare } from "lucide-react";

function Logo() {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="TeamFlow home">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violetSoft text-white shadow-glow">
        <CheckSquare size={27} strokeWidth={2.5} />
      </span>
      <span className="leading-tight">
        <span className="block text-xl font-extrabold tracking-normal text-ink">
          TeamFlow
        </span>
        <span className="block text-sm font-medium text-muted">
          Team Task Manager
        </span>
      </span>
    </a>
  );
}

export default Logo;
