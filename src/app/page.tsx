import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import {
  Sprout,
  Map,
  CloudSun,
  MessageCircle,
  Brain,
  ChevronRight,
  Check,
  Star,
  Users,
  TrendingUp,
  Leaf,
  Bell,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Play,
  Quote,
  ChevronDown,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function Home() {
  const t = await getTranslations();

  const features = [
    {
      icon: Map,
      title: t("landing.features.map.title"),
      description: t("landing.features.map.description"),
      accent: "pink" as const,
    },
    {
      icon: CloudSun,
      title: t("landing.features.weather.title"),
      description: t("landing.features.weather.description"),
      accent: "yellow" as const,
    },
    {
      icon: Brain,
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.description"),
      accent: "mint" as const,
    },
    {
      icon: MessageCircle,
      title: t("landing.features.whatsapp.title"),
      description: t("landing.features.whatsapp.description"),
      accent: "purple" as const,
    },
  ];

  const stats = [
    { value: "2,500+", label: t("landing.stats.farmers"), icon: Users },
    { value: "15,000+", label: t("landing.stats.hectares"), icon: Leaf },
    { value: "+32%", label: t("landing.stats.yield"), icon: TrendingUp },
    { value: "98%", label: t("landing.stats.satisfaction"), icon: Star },
  ];

  const howItWorksSteps = t.raw("landing.howItWorks.steps") as Array<{
    title: string;
    description: string;
  }>;

  const testimonials = t.raw("landing.testimonials.items") as Array<{
    name: string;
    role: string;
    content: string;
  }>;

  const faqs = t.raw("landing.faq.items") as Array<{
    question: string;
    answer: string;
  }>;

  const whatsappBenefits = t.raw("landing.whatsappDemo.benefits") as string[];

  const plans = [
    {
      name: t("landing.pricing.free.name"),
      price: "0",
      description: t("landing.pricing.free.description"),
      features: t.raw("landing.pricing.free.features") as string[],
    },
    {
      name: t("landing.pricing.pro.name"),
      price: "29",
      description: t("landing.pricing.pro.description"),
      features: t.raw("landing.pricing.pro.features") as string[],
      popular: true,
    },
  ];

  const accentColors = {
    pink: {
      bg: "bg-[var(--accent-pink)]",
      bgLight: "bg-[var(--accent-pink-light)]",
      text: "text-[var(--accent-pink-dark)]",
    },
    yellow: {
      bg: "bg-[var(--accent-yellow)]",
      bgLight: "bg-[var(--accent-yellow-light)]",
      text: "text-[var(--accent-yellow-dark)]",
    },
    mint: {
      bg: "bg-[var(--accent-mint)]",
      bgLight: "bg-[var(--accent-mint-light)]",
      text: "text-[var(--accent-mint-dark)]",
    },
    purple: {
      bg: "bg-[var(--accent-purple)]",
      bgLight: "bg-[var(--accent-purple-light)]",
      text: "text-[var(--accent-purple-dark)]",
    },
    coral: {
      bg: "bg-[var(--accent-coral)]",
      bgLight: "bg-[var(--accent-coral-light)]",
      text: "text-[var(--accent-coral-dark)]",
    },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-muted)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-mint)]">
              <Sprout className="h-4 w-4 md:h-5 md:w-5 text-[var(--text-primary)]" />
            </div>
            <span className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Budoor</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t("landing.footer.features")}
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t("landing.howItWorks.title")}
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t("landing.footer.pricing")}
            </Link>
            <Link href="#faq" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t("landing.footer.faq")}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="h-9 px-3 md:h-10 md:px-4 text-sm">
                {t("nav.register")}
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Decorative elements - hidden on mobile for cleaner look */}
        <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-[var(--accent-pink)] rounded-full opacity-20 blur-3xl" />
        <div className="hidden md:block absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-mint)] rounded-full opacity-20 blur-3xl" />
        <div className="hidden md:block absolute top-40 right-1/4 w-64 h-64 bg-[var(--accent-yellow)] rounded-full opacity-10 blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-start">
              <Badge variant="pink" size="lg" className="mb-4 md:mb-6">
                <Zap className="w-3 h-3 mr-1" />
                {t("landing.hero.newFeature")}
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                {t("landing.hero.title")}
              </h1>

              <p className="mt-4 md:mt-6 text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0">
                {t("landing.hero.subtitle")}
              </p>

              <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full shadow-lg h-12 md:h-auto">
                    {t("landing.hero.cta")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full h-12 md:h-auto">
                    <Play className="h-4 w-4" />
                    {t("landing.hero.watchDemo")}
                  </Button>
                </Link>
              </div>

              {/* Trust badges - scrollable on mobile */}
              <div className="mt-6 md:mt-10 flex flex-wrap items-center gap-4 md:gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-[var(--accent-mint-dark)]" />
                  <span className="text-xs md:text-sm text-[var(--text-secondary)]">{t("landing.hero.trust.secure")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 md:h-5 md:w-5 text-[var(--accent-purple-dark)]" />
                  <span className="text-xs md:text-sm text-[var(--text-secondary)]">{t("landing.hero.trust.multilang")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 md:h-5 md:w-5 text-[var(--accent-yellow-dark)]" />
                  <span className="text-xs md:text-sm text-[var(--text-secondary)]">{t("landing.hero.trust.realtime")}</span>
                </div>
              </div>
            </div>

            {/* Hero illustration - Dashboard preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-pink)]/20 to-[var(--accent-mint)]/20 rounded-[var(--radius-2xl)] transform rotate-3" />
              <div className="relative bg-[var(--bg-secondary)] rounded-[var(--radius-2xl)] shadow-2xl p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mini dashboard preview */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[var(--status-error)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--accent-yellow)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--accent-mint)]" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[var(--accent-pink-light)] rounded-[var(--radius-lg)] p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Parcelles</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
                  </div>
                  <div className="bg-[var(--accent-yellow-light)] rounded-[var(--radius-lg)] p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Alertes</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
                  </div>
                </div>

                <div className="bg-[var(--bg-muted)] rounded-[var(--radius-lg)] p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Rendement prévu</p>
                    <Badge variant="mint" size="sm">+12%</Badge>
                  </div>
                  <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-[var(--accent-mint)] to-[var(--accent-yellow)] rounded-full" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[var(--accent-mint-light)] rounded-[var(--radius-md)]">
                  <CloudSun className="h-5 w-5 text-[var(--accent-mint-dark)]" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">Météo favorable</p>
                    <p className="text-xs text-[var(--text-secondary)]">Idéal pour traitement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="relative overflow-hidden bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] md:rounded-[var(--radius-xl)] p-4 md:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 group"
              >
                <div className={`absolute top-0 left-0 h-1 w-full ${
                  index === 0 ? "bg-[var(--accent-pink)]" :
                  index === 1 ? "bg-[var(--accent-mint)]" :
                  index === 2 ? "bg-[var(--accent-yellow)]" :
                  "bg-[var(--accent-purple)]"
                }`} />
                <stat.icon className={`h-6 w-6 md:h-8 md:w-8 mb-2 md:mb-3 ${
                  index === 0 ? "text-[var(--accent-pink)]" :
                  index === 1 ? "text-[var(--accent-mint)]" :
                  index === 2 ? "text-[var(--accent-yellow)]" :
                  "text-[var(--accent-purple)]"
                }`} />
                <p className="text-xl md:text-3xl font-bold text-[var(--text-primary)] mb-0.5 md:mb-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="yellow" className="mb-3 md:mb-4">{t("landing.features.badge")}</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl mx-auto px-4">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] md:rounded-[var(--radius-xl)] p-4 md:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-[var(--radius-md)] md:rounded-[var(--radius-lg)] ${accentColors[feature.accent].bg} flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-5 w-5 md:h-7 md:w-7 text-[var(--text-primary)]" />
                </div>
                <h3 className="font-semibold text-sm md:text-lg text-[var(--text-primary)] mb-1 md:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 md:line-clamp-none">
                  {feature.description}
                </p>
                <ArrowRight className="hidden md:block absolute bottom-6 right-6 h-5 w-5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Demo Section */}
      <section id="demo" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-muted)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge variant="mint" className="mb-3 md:mb-4">
                <MessageCircle className="w-3 h-3 mr-1" />
                WhatsApp
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 md:mb-6">
                {t("landing.whatsappDemo.title")}
              </h2>
              <p className="text-sm md:text-lg text-[var(--text-secondary)] mb-6 md:mb-8">
                {t("landing.whatsappDemo.subtitle")}
              </p>

              <div className="space-y-3 md:space-y-4">
                {whatsappBenefits.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-[var(--accent-mint)] shrink-0">
                      <Check className="h-3 w-3 md:h-4 md:w-4 text-[var(--text-primary)]" />
                    </div>
                    <span className="text-sm md:text-base text-[var(--text-primary)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              {/* Phone mockup */}
              <div className="relative mx-auto w-64 sm:w-72 md:w-80">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-mint)] to-[var(--accent-yellow)] rounded-[2.5rem] transform rotate-3 opacity-50" />
                <div className="relative bg-[var(--text-primary)] rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="bg-[#e5ddd5] rounded-[2rem] overflow-hidden">
                    {/* WhatsApp header */}
                    <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-mint)] flex items-center justify-center">
                        <Sprout className="h-5 w-5 text-[var(--text-primary)]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Budoor</p>
                        <p className="text-green-200 text-xs">en ligne</p>
                      </div>
                    </div>

                    {/* Chat content */}
                    <div className="p-4 min-h-[320px]">
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%]">
                        <p className="text-sm whitespace-pre-line text-gray-800 leading-relaxed">
{`🌾 *Rapport : Le Grand Pré*
📅 23 Janvier 2026

🚦 *Statut :* Vigilance

🌦️ *Météo 3 jours :*
Pluies prévues mercredi (30mm)

🚜 *Actions recommandées :*
• Reporter l'épandage d'azote
• Vérifier le drainage Nord
• Fenêtre semis : 28 Jan

💬 _"Détails" pour plus d'infos_`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 text-end">14:32 ✓✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="purple" className="mb-3 md:mb-4">{t("landing.howItWorks.badge")}</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl mx-auto px-4">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-[var(--border-light)]" />
                )}
                <div className="relative bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] md:rounded-[var(--radius-xl)] p-5 md:p-8 shadow-[var(--shadow-card)] text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 text-lg md:text-2xl font-bold ${
                    index === 0 ? "bg-[var(--accent-pink)] text-[var(--text-primary)]" :
                    index === 1 ? "bg-[var(--accent-yellow)] text-[var(--text-primary)]" :
                    "bg-[var(--accent-mint)] text-[var(--text-primary)]"
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-base md:text-xl font-semibold text-[var(--text-primary)] mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-muted)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="coral" className="mb-3 md:mb-4">{t("landing.testimonials.badge")}</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
              {t("landing.testimonials.title")}
            </h2>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] md:rounded-[var(--radius-xl)] p-5 md:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300 min-w-[280px] md:min-w-0 snap-start shrink-0 md:shrink"
              >
                <Quote className="h-6 w-6 md:h-8 md:w-8 text-[var(--accent-pink)] mb-3 md:mb-4" />
                <p className="text-sm md:text-base text-[var(--text-primary)] mb-4 md:mb-6 leading-relaxed line-clamp-4 md:line-clamp-none">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] flex items-center justify-center text-[var(--text-primary)] font-semibold text-sm md:text-base shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm md:text-base text-[var(--text-primary)] truncate">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)] truncate">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 md:gap-1 mt-3 md:mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-[var(--accent-yellow)] text-[var(--accent-yellow)]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="yellow" className="mb-3 md:mb-4">{t("landing.pricing.badge")}</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)]">
              {t("landing.pricing.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] md:rounded-[var(--radius-2xl)] p-5 md:p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] ${
                  plan.popular ? "ring-2 ring-[var(--accent-pink)] order-first md:order-none" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="pink" size="lg">
                      {t("landing.pricing.popular")}
                    </Badge>
                  </div>
                )}
                <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mt-2 md:mt-0">{plan.name}</h3>
                <p className="text-[var(--text-secondary)] text-xs md:text-sm mb-4 md:mb-6">{plan.description}</p>
                <p className="mb-4 md:mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{plan.price}€</span>
                  <span className="text-sm md:text-base text-[var(--text-secondary)]">{t("landing.pricing.perMonth")}</span>
                </p>
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-[var(--text-primary)]">
                      <div className="flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-[var(--accent-mint-light)] shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-[var(--accent-mint-dark)]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full h-11 md:h-12"
                    size="lg"
                  >
                    {plan.popular ? t("landing.pricing.pro.cta") : t("landing.pricing.tryFree")}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-muted)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="mint" className="mb-3 md:mb-4">{t("landing.faq.badge")}</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
              {t("landing.faq.title")}
            </h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-[var(--bg-secondary)] rounded-[var(--radius-md)] md:rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 md:p-6 cursor-pointer list-none gap-3">
                  <span className="font-medium text-sm md:text-base text-[var(--text-primary)] text-left">{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-200 shrink-0" />
                </summary>
                <div className="px-4 md:px-6 pb-4 md:pb-6 text-sm md:text-base text-[var(--text-secondary)]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent-pink)] via-[var(--accent-coral)] to-[var(--accent-yellow)] rounded-[var(--radius-2xl)] p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
                {t("landing.cta.title")}
              </h2>
              <p className="text-[var(--text-primary)]/80 mb-8 max-w-xl mx-auto">
                {t("landing.cta.subtitle")}
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-[var(--text-primary)] text-[var(--text-inverse)] hover:bg-[var(--bg-dark-hover)] shadow-lg">
                  {t("landing.cta.button")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-muted)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-mint)]">
                  <Sprout className="h-5 w-5 text-[var(--text-primary)]" />
                </div>
                <span className="text-xl font-bold text-[var(--text-primary)]">Budoor</span>
              </Link>
              <p className="text-sm text-[var(--text-secondary)]">
                {t("landing.footer.description")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">{t("landing.footer.product")}</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="#features" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.features")}</Link></li>
                <li><Link href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.pricing")}</Link></li>
                <li><Link href="#faq" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.faq")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">{t("landing.footer.resources")}</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/docs" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.docs")}</Link></li>
                <li><Link href="/blog" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.blog")}</Link></li>
                <li><Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.support")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">{t("landing.footer.legal")}</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.privacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">{t("landing.footer.terms")}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--border-muted)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              © 2026 Budoor. {t("common.allRightsReserved")}
            </p>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
