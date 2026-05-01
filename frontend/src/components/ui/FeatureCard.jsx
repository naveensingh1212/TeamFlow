function FeatureCard({ icon: Icon, title, description, highlighted = false }) {
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft">
      <div
        className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${
          highlighted
            ? "bg-gradient-to-br from-brand-500 to-violetSoft text-white shadow-glow"
            : "bg-brand-50 text-brand-700"
        }`}
      >
        <Icon size={30} strokeWidth={2.2} />
      </div>
      <h3 className="text-xl font-extrabold tracking-normal text-ink">
        {title}
      </h3>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        {description}
      </p>
    </article>
  );
}

export default FeatureCard;
