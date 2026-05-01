import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import AuthModal from "../components/ui/AuthModal.jsx";
import FeatureCard from "../components/ui/FeatureCard.jsx";
import Logo from "../components/ui/Logo.jsx";
import useCurrentYear from "../hooks/useCurrentYear.js";

const features = [
  {
    icon: UsersRound,
    title: "Project & Team Management",
    description:
      "Organize projects, invite teammates, and keep everyone aligned in one shared workspace.",
  },
  {
    icon: ClipboardCheck,
    title: "Task Creation & Assignment",
    description:
      "Create tasks, assign owners, set deadlines, and track each item from todo to done.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Visibility",
    description:
      "See tasks, status, and overdue work at a glance with a clean dashboard built for focus.",
  },
  {
    icon: CheckCircle2,
    title: "Status Tracking",
    description:
      "Move work through clear stages so teammates always know what is active, blocked, and complete.",
  },
  {
    icon: ShieldCheck,
    title: "Team Roles",
    description:
      "Give admins, managers, and members the right level of access for calmer collaboration.",
    highlighted: true,
  },
  {
    icon: Sparkles,
    title: "Built for Speed",
    description:
      "A snappy, modern experience your team can use every day without slowing down.",
  },
];

function LandingPage() {
  const currentYear = useCurrentYear();
  const [authMode, setAuthMode] = useState("signup");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  useEffect(() => {
    const requestedMode = sessionStorage.getItem("teamflow:authMode");
    if (!requestedMode) return;

    sessionStorage.removeItem("teamflow:authMode");
    openAuth(requestedMode);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f7f6ff_42%,#ffffff_100%)] text-ink">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Account">
          <Button
            type="button"
            variant="ghost"
            className="px-4"
            onClick={() => openAuth("signin")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            className="px-5"
            onClick={() => openAuth("signup")}
          >
            Sign up
          </Button>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[590px] w-full max-w-7xl flex-col items-center justify-center px-5 pb-20 pt-14 text-center sm:px-8 lg:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4 py-2.5 text-sm font-medium text-muted shadow-sm backdrop-blur">
          <Sparkles size={18} className="text-brand-500" />
          Built for high-performing teams
        </div>

        <h1 className="mt-8 max-w-5xl text-4xl font-black tracking-normal text-ink sm:text-5xl lg:text-6xl">
          Where teams turn tasks into{" "}
          <span className="bg-gradient-to-r from-brand-500 to-violetSoft bg-clip-text text-transparent">
            progress
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          TeamFlow brings projects, tasks, and people together so your team
          ships work faster, with clarity at every step.
        </p>

        <div className="mt-9 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => openAuth("signup")}
          >
            Get started free <ArrowRight size={19} />
          </Button>
          <Button
            as="a"
            href="#features"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            See how it works
          </Button>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mb-14 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <BadgeCheck size={28} />
          </div>
          <h2 className="text-4xl font-black tracking-normal text-ink sm:text-5xl">
            Everything your team needs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            Powerful features wrapped in a simple, beautiful interface.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-9 text-center text-sm font-medium text-muted">
        (c) {currentYear} TeamFlow. Crafted for teams that ship.
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </main>
  );
}

export default LandingPage;
