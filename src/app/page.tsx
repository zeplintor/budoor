import Link from "next/link";
import {
  Sprout,
  Map,
  CloudSun,
  MessageCircle,
  Brain,
  Check,
  ArrowRight,
  ChevronDown,
  Shield,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { JsonLdScripts } from "@/components/JsonLdScripts";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata(
  "Budoor - Intelligence Agricole IA pour Agriculteurs Marocains",
  "Budoor: Un agronome IA expert dans votre poche qui surveille vos champs 24h/24. Conseils agricoles en temps réel, rapports météo, analyses de sol et recommandations personnalisées.",
  "/",
  [
    "intelligence agricole maroc",
    "agronome IA",
    "conseil agricole gratuit",
    "app agriculture marocaine",
  ]
);

export default async function Home() {
  const t = await getTranslations();

  const features = [
    {
      num: "01",
      icon: Map,
      title: t("landing.features.map.title"),
      description: t("landing.features.map.description"),
    },
    {
      num: "02",
      icon: CloudSun,
      title: t("landing.features.weather.title"),
      description: t("landing.features.weather.description"),
    },
    {
      num: "03",
      icon: Brain,
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.description"),
    },
    {
      num: "04",
      icon: MessageCircle,
      title: t("landing.features.whatsapp.title"),
      description: t("landing.features.whatsapp.description"),
    },
  ];

  const steps = t.raw("landing.howItWorks.steps") as {
    title: string;
    description: string;
  }[];

  const testimonials = t.raw("landing.testimonials.items") as {
    name: string;
    role: string;
    content: string;
  }[];

  const faqItems = t.raw("landing.faq.items") as {
    question: string;
    answer: string;
  }[];

  const freeFeatures = t.raw("landing.pricing.free.features") as string[];
  const proFeatures = t.raw("landing.pricing.pro.features") as string[];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <JsonLdScripts />

      {/* ═══════════════════════════════════════════
          HEADER — sticky minimal nav
      ═══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(250,250,247,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "var(--accent-green)" }}
            >
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-display font-bold text-xl tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Budoor
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#fonctionnalites"
              className="text-sm font-medium transition-colors hover:text-[var(--accent-green)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("landing.features.title")}
            </a>
            <a
              href="#tarifs"
              className="text-sm font-medium transition-colors hover:text-[var(--accent-green)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("landing.pricing.title")}
            </a>
            <LanguageSwitcher />
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-[var(--bg-muted)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "var(--accent-green)",
                color: "white",
              }}
            >
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          HERO — editorial split layout
      ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="grid md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_480px] gap-12 lg:gap-20 items-center">
          {/* Left: editorial text */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-wide"
              style={{
                background: "var(--accent-green-light)",
                color: "var(--accent-green)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--accent-green)",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
              {t("landing.hero.newFeature")}
            </div>

            {/* Headline */}
            <h1
              className="font-display font-bold leading-[1.08] mb-6"
              style={{
                fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.hero.title")}
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("landing.hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
                style={{ background: "var(--accent-green)", color: "white" }}
              >
                {t("landing.hero.cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-[var(--bg-muted)]"
                style={{
                  border: "1.5px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                {t("landing.hero.discoverFeatures")}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5">
              {[
                { icon: Shield, label: t("landing.hero.trust.secure") },
                { icon: Zap, label: t("landing.hero.trust.realtime") },
                { icon: Sprout, label: t("landing.hero.trust.multilang") },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--accent-green)" }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: product mockup */}
          <div
            className="relative animate-fade-in-up hidden md:block"
            style={{ animationDelay: "0.15s" }}
          >
            {/* Main card */}
            <div
              className="rounded-2xl border p-5 space-y-3"
              style={{
                background: "white",
                borderColor: "var(--border-light)",
                boxShadow: "var(--shadow-elevated)",
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-light)" }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: "var(--accent-green)" }}
                  >
                    <Sprout className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Tableau de bord
                  </span>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-green-light)",
                    color: "var(--accent-green)",
                  }}
                >
                  En direct
                </span>
              </div>

              {/* Mini stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Parcelles", value: "3", icon: "🌱", color: "var(--accent-green-light)" },
                  { label: "Température", value: "26°C", icon: "☀️", color: "var(--accent-gold-light)" },
                  { label: "Alertes", value: "0", icon: "✓", color: "#F0FDF4" },
                  { label: "Rapports", value: "14", icon: "📊", color: "var(--accent-purple-light)" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl p-3 border"
                    style={{
                      borderColor: "var(--border-muted)",
                      background: item.color,
                    }}
                  >
                    <div className="text-base mb-1">{item.icon}</div>
                    <div
                      className="font-display font-bold text-xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI recommendation card */}
              <div
                className="rounded-xl p-4 border-l-4"
                style={{
                  background: "var(--accent-green-light)",
                  borderLeftColor: "var(--accent-green)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--accent-green)" }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--accent-green)" }}
                  >
                    Recommandation IA
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  Risque de gel modéré cette nuit. Protégez vos agrumes et
                  planifiez l&apos;irrigation tôt demain matin.
                </p>
              </div>
            </div>

            {/* Floating WhatsApp badge */}
            <div
              className="absolute -bottom-5 -left-5 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-float"
              style={{
                background: "white",
                borderColor: "var(--border-light)",
                animationDelay: "1s",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#25D366" }}
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Rapport reçu
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  WhatsApp · il y a 2 min
                </p>
              </div>
            </div>

            {/* Subtle decorative ring */}
            <div
              className="absolute -z-10 inset-0 rounded-3xl scale-110 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 40%, var(--accent-green-light) 0%, transparent 70%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════ */}
      <div
        className="border-y"
        style={{
          background: "white",
          borderColor: "var(--border-light)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 divide-x"
          style={{ borderColor: "var(--border-light)" }}>
          {[
            { value: "500+", label: t("landing.stats.farmers") },
            { value: "10k+", label: t("landing.stats.hectares") },
            { value: "+35%", label: t("landing.stats.yield") },
            { value: "98%",  label: t("landing.stats.satisfaction") },
          ].map((stat, i) => (
            <div key={stat.label} className={`text-center px-4 ${i === 0 ? "" : ""}`}>
              <div
                className="font-display font-bold text-3xl mb-0.5"
                style={{ color: "var(--accent-green)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          FEATURES — numbered cards
      ═══════════════════════════════════════════ */}
      <section
        id="fonctionnalites"
        className="max-w-6xl mx-auto px-6 py-20 md:py-28"
      >
        <div className="mb-14">
          <p
            className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
            style={{ color: "var(--accent-gold)" }}
          >
            {t("landing.features.badge")}
          </p>
          <h2
            className="font-display font-bold leading-[1.1]"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--text-primary)",
              maxWidth: "480px",
            }}
          >
            {t("landing.features.title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6 stagger-children">
          {features.map((feature) => (
            <div
              key={feature.num}
              className="feature-card group p-8 rounded-2xl"
              style={{ background: "white" }}
            >
              <div className="flex items-start gap-5">
                {/* Number */}
                <span
                  className="font-display font-bold text-sm pt-0.5 shrink-0"
                  style={{ color: "var(--accent-green)", opacity: 0.6 }}
                >
                  {feature.num}
                </span>

                <div className="flex-1">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "var(--accent-green-light)" }}
                  >
                    <feature.icon
                      className="w-5 h-5"
                      style={{ color: "var(--accent-green)" }}
                    />
                  </div>

                  <h3
                    className="font-display font-semibold text-lg mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ═══════════════════════════════════════════ */}
      <section
        style={{
          background: "white",
          borderTop: "1px solid var(--border-light)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-16">
            <p
              className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: "var(--accent-gold)" }}
            >
              {t("landing.howItWorks.badge")}
            </p>
            <h2
              className="font-display font-bold leading-[1.1]"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "var(--text-primary)",
              }}
            >
              {t("landing.howItWorks.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-16 stagger-children">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center md:text-left">
                {/* Step number circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg mb-5 mx-auto md:mx-0"
                  style={{ background: "var(--accent-green)", color: "white" }}
                >
                  {i + 1}
                </div>

                {/* Connector (desktop) */}
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-6 left-[calc(100%+1rem)] right-[-1rem]"
                    style={{
                      height: "1px",
                      background: `linear-gradient(to right, var(--border-light), transparent)`,
                      width: "calc(100% - 3rem)",
                    }}
                  />
                )}

                <h3
                  className="font-display font-semibold text-xl mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
            style={{ color: "var(--accent-gold)" }}
          >
            {t("landing.testimonials.badge")}
          </p>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--text-primary)",
            }}
          >
            {t("landing.testimonials.title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 stagger-children">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="p-7 rounded-2xl border"
              style={{
                background: "white",
                borderColor: "var(--border-light)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span
                    key={j}
                    className="text-base"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mb-6 italic"
                style={{ color: "var(--text-secondary)" }}
              >
                &ldquo;{item.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
                  style={{
                    background: "var(--accent-green-light)",
                    color: "var(--accent-green)",
                  }}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════ */}
      <section
        id="tarifs"
        style={{
          background: "white",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: "var(--accent-gold)" }}
            >
              {t("landing.pricing.badge")}
            </p>
            <h2
              className="font-display font-bold mb-3"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "var(--text-primary)",
              }}
            >
              {t("landing.pricing.title")}
            </h2>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              {t("landing.pricing.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free plan */}
            <div
              className="p-8 rounded-2xl border"
              style={{
                borderColor: "var(--border-light)",
                background: "var(--bg-primary)",
              }}
            >
              <div className="mb-6 pb-6 border-b" style={{ borderColor: "var(--border-light)" }}>
                <h3
                  className="font-display font-bold text-xl mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("landing.pricing.free.name")}
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("landing.pricing.free.description")}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-display font-bold text-4xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    0€
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {t("landing.pricing.perMonth")}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {freeFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Check
                      className="w-4 h-4 shrink-0"
                      style={{ color: "var(--accent-green)" }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block text-center px-6 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-[var(--bg-muted)]"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                {t("landing.pricing.tryFree")}
              </Link>
            </div>

            {/* Pro plan */}
            <div
              className="p-8 rounded-2xl relative overflow-hidden"
              style={{ background: "var(--accent-green)" }}
            >
              {/* Popular badge */}
              <div
                className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "var(--accent-gold)", color: "white" }}
              >
                {t("landing.pricing.popular")}
              </div>

              <div className="mb-6 pb-6 border-b border-white/20">
                <h3 className="font-display font-bold text-xl mb-1 text-white">
                  {t("landing.pricing.pro.name")}
                </h3>
                <p className="text-sm mb-4 text-white/70">
                  {t("landing.pricing.pro.description")}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-4xl text-white">
                    29€
                  </span>
                  <span className="text-sm text-white/60">
                    {t("landing.pricing.perMonth")}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {proFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-white"
                  >
                    <Check className="w-4 h-4 shrink-0 text-white/80" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-95 active:scale-[0.98]"
                style={{
                  background: "white",
                  color: "var(--accent-green)",
                }}
              >
                {t("landing.pricing.pro.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold uppercase tracking-[0.15em] mb-3"
            style={{ color: "var(--accent-gold)" }}
          >
            {t("landing.faq.badge")}
          </p>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--text-primary)",
            }}
          >
            {t("landing.faq.title")}
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-light)" }}>
          {faqItems.map((item, i) => (
            <details key={i} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                <span
                  className="font-semibold text-base leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className="w-5 h-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  style={{ color: "var(--text-muted)" }}
                />
              </summary>
              <p
                className="pt-4 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — dark green
      ═══════════════════════════════════════════ */}
      <section style={{ background: "var(--accent-green)" }}>
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
          <h2
            className="font-display font-bold text-white leading-[1.1] mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            {t("landing.cta.title")}
          </h2>
          <p
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {t("landing.cta.subtitle")}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{
              background: "white",
              color: "var(--accent-green)",
            }}
          >
            {t("landing.cta.button")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer style={{ background: "var(--bg-dark)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Sprout className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white">Budoor</span>
              </div>
              <p
                className="text-sm max-w-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {t("landing.footer.description")}
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-3 gap-x-12 gap-y-3 text-sm">
              {[
                { label: t("landing.footer.features"), href: "#fonctionnalites" },
                { label: t("landing.footer.pricing"), href: "#tarifs" },
                { label: t("landing.footer.faq"), href: "#faq" },
                { label: t("landing.footer.docs"), href: "/docs" },
                { label: t("landing.footer.support"), href: "/support" },
                { label: t("landing.footer.privacy"), href: "/privacy" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="transition-colors hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            <span>
              © {new Date().getFullYear()} Budoor. {t("common.allRightsReserved")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
