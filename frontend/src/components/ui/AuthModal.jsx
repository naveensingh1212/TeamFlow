import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckSquare,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Button from "./Button.jsx";
import { navigateTo } from "../../utils/navigation.js";
import { loginUser, registerUser } from "../../utils/api.js";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

function Field({
  icon: Icon,
  label,
  name,
  type = "text",
  placeholder,
  showToggle,
  value,
  onChange,
  autoComplete,
  required = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const inputType = showToggle ? (isVisible ? "text" : "password") : type;

  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <span className="mt-1 flex min-h-[42px] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        <Icon size={17} className="shrink-0 text-slate-500" />
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-slate-400"
        />
        {showToggle && (
          <button
            type="button"
            className="rounded-md p-1 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
            onClick={() => setIsVisible((current) => !current)}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </span>
    </label>
  );
}

function AuthModal({ isOpen, mode, onClose, onModeChange }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setError("");
  }, [mode]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const response = isSignup
        ? await registerUser({
            username: formData.username.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          })
        : await loginUser({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          });

      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onClose();
      navigateTo("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to sign in right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-950/20 px-4 py-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onMouseDown={onClose}
    >
      <section
        className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-5 shadow-elegant backdrop-blur-xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition hover:bg-brand-50 hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand-100"
          aria-label="Close auth modal"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violetSoft text-white shadow-glow">
            <CheckSquare size={24} strokeWidth={2.5} />
          </div>
          <h2
            id="auth-modal-title"
            className="mt-3 text-2xl font-black tracking-normal text-ink"
          >
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {isSignup
              ? "Start coordinating your team in minutes."
              : "Sign in to continue to TeamFlow."}
          </p>
        </div>

        <div className="relative mt-5 grid rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          <span
            className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-card transition-transform duration-300 ease-out"
            style={{
              transform: isSignup
                ? "translateX(calc(100% + 4px))"
                : "translateX(4px)",
            }}
          />
          <div className="relative grid grid-cols-2">
            <button
              type="button"
              onClick={() => onModeChange("signin")}
              className={`rounded-lg py-2 transition ${
                isSignup ? "text-slate-500" : "text-ink"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className={`rounded-lg py-2 transition ${
                isSignup ? "text-ink" : "text-slate-500"
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 flex min-h-[42px] w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:border-brand-100 hover:bg-brand-50 focus:outline-none focus:ring-4 focus:ring-brand-100"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs font-medium text-muted">
          <span className="h-px flex-1 bg-slate-200" />
          or with email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {isSignup && (
            <Field
              icon={UserRound}
              label="Username"
              name="username"
              placeholder="alex"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
          )}
          <Field
            icon={Mail}
            label="Email"
            name="email"
            type="email"
            placeholder="you@team.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <Field
            icon={LockKeyhole}
            label="Password"
            name="password"
            placeholder="••••••••"
            showToggle
            value={formData.password}
            onChange={handleChange}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
          {isSignup && (
            <Field
              icon={LockKeyhole}
              label="Confirm password"
              name="confirmPassword"
              placeholder="••••••••"
              showToggle
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          )}

          {isSignup && (
            <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
              <Sparkles
                size={13}
                className="mt-0.5 shrink-0 text-brand-500"
              />
              By signing up you agree to our Terms and Privacy Policy.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-1 w-full py-2.5" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Sign in"}{" "}
            <ArrowRight size={19} />
          </Button>
        </form>

        <p className="mt-4 text-center text-xs font-medium text-muted">
          {isSignup ? "Already have an account? " : "New to TeamFlow? "}
          <button
            type="button"
            onClick={() => onModeChange(isSignup ? "signin" : "signup")}
            className="font-bold text-brand-600 transition hover:text-brand-700"
          >
            {isSignup ? "Sign in" : "Create one"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default AuthModal;
