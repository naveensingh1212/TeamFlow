const variants = {
  primary:
    "bg-gradient-to-r from-brand-500 to-violetSoft text-white shadow-glow hover:translate-y-[-1px] hover:shadow-soft",
  secondary:
    "border border-slate-200 bg-white text-ink shadow-sm hover:border-brand-100 hover:bg-brand-50",
  ghost: "text-ink hover:bg-white/70 hover:text-brand-700",
};

function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-4 focus:ring-brand-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
