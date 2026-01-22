import Link from "next/link";
import { Badge, Card, CardHeader, CardTitle, CardDescription, Button } from "@/components/ui";
import {
  Sprout,
  HelpCircle,
  MessageCircle,
  Mail,
  Book,
  Video,
  Users,
  ChevronRight,
  Search,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function SupportPage() {
  const t = await getTranslations();

  const supportOptions = [
    {
      title: "Documentation",
      description: "Guides détaillés et tutoriels",
      icon: Book,
      accent: "purple",
      href: "/docs",
    },
    {
      title: "FAQ",
      description: "Questions fréquentes",
      icon: HelpCircle,
      accent: "yellow",
      href: "/#faq",
    },
    {
      title: "WhatsApp",
      description: "Support via WhatsApp",
      icon: MessageCircle,
      accent: "mint",
      href: "#",
    },
    {
      title: "Email",
      description: "support@budoor.app",
      icon: Mail,
      accent: "pink",
      href: "mailto:support@budoor.app",
    },
  ];

  const faqs = [
    {
      question: "Comment réinitialiser mon mot de passe ?",
      answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre email et suivez les instructions.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations.",
    },
    {
      question: "Comment ajouter une nouvelle parcelle ?",
      answer: "Allez dans 'Mes Parcelles', cliquez sur 'Dessiner' et tracez les contours de votre parcelle sur la carte.",
    },
    {
      question: "Quelle est la précision des prévisions météo ?",
      answer: "Nos prévisions utilisent plusieurs sources de données pour une précision optimale, généralement supérieure à 85%.",
    },
    {
      question: "Comment annuler mon abonnement ?",
      answer: "Vous pouvez annuler à tout moment depuis les paramètres de votre compte, section 'Abonnement'.",
    },
  ];

  const accentColors: Record<string, string> = {
    pink: "bg-[var(--accent-pink)]",
    yellow: "bg-[var(--accent-yellow)]",
    mint: "bg-[var(--accent-mint)]",
    purple: "bg-[var(--accent-purple)]",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-muted)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-mint)]">
              <Sprout className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">Budoor</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t("nav.login")}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-muted)]">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="mint" size="lg" className="mb-6">
            <HelpCircle className="w-3 h-3 mr-1" />
            {t("landing.footer.support")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Notre équipe est là pour vous accompagner. Trouvez rapidement des réponses ou contactez-nous.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              className="w-full h-14 pl-12 pr-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-mint)] shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-8 text-center">
            Contactez-nous
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option) => (
              <Link
                key={option.title}
                href={option.href}
                className="group bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className={`w-14 h-14 rounded-[var(--radius-lg)] ${accentColors[option.accent]} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <option.icon className="h-7 w-7 text-[var(--text-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{option.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{option.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--bg-muted)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-[var(--text-primary)]">{faq.question}</span>
                  <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-open:rotate-90 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-6 text-[var(--text-secondary)]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/#faq">
              <Button variant="outline">Voir toutes les FAQ</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 text-center">
            Envoyez-nous un message et nous vous répondrons sous 24h.
          </p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Sujet
              </label>
              <input
                type="text"
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)] resize-none"
              />
            </div>
            <Button variant="primary" className="w-full" size="lg">
              Envoyer le message
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-muted)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-mint)]">
              <Sprout className="h-4 w-4 text-[var(--text-primary)]" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">Budoor</span>
          </Link>
          <p className="text-sm text-[var(--text-muted)]">
            © 2026 Budoor. {t("common.allRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}
