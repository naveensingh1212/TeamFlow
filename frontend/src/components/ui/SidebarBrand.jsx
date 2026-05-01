import { CheckSquare } from "lucide-react";

function SidebarBrand() {
  return (
    <div className="flex min-w-0 items-center gap-3 px-6 py-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violetSoft text-white shadow-glow">
        <CheckSquare size={23} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="whitespace-nowrap text-base font-black tracking-normal text-ink">
          TeamFlow
        </div>
        <div className="whitespace-nowrap text-xs font-medium text-muted">
          Workspace
        </div>
      </div>
    </div>
  );
}

export default SidebarBrand;
