import Link from "next/link";
import { Badge, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import {
  Sprout,
  Book,
  Map,
  CloudSun,
  Brain,
  MessageCircle,
  Settings,
  ChevronRight,
  Play,
  FileText,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function DocsPage() {
  const t = await getTranslations();

  const sections = [
    {
      title: "Démarrage rapide",
      titleAr: "البدء السريع",
      description: "Commencez à utiliser Budoor en quelques minutes",
      descriptionAr: "ابدأ باستخدام بدور في دقائق",
      icon: Zap,
      accent: "pink",
      articles: [
        { title: "Créer un compte", titleAr: "إنشاء حساب" },
        { title: "Ajouter votre première parcelle", titleAr: "إضافة أول حقل" },
        { title: "Comprendre le tableau de bord", titleAr: "فهم لوحة التحكم" },
      ],
    },
    {
      title: "Gestion des parcelles",
      titleAr: "إدارة الحقول",
      description: "Apprenez à gérer vos parcelles efficacement",
      descriptionAr: "تعلم إدارة حقولك بفعالية",
      icon: Map,
      accent: "yellow",
      articles: [
        { title: "Dessiner une parcelle", titleAr: "رسم حقل" },
        { title: "Modifier les informations", titleAr: "تعديل المعلومات" },
        { title: "Supprimer une parcelle", titleAr: "حذف حقل" },
      ],
    },
    {
      title: "Données météo",
      titleAr: "بيانات الطقس",
      description: "Comprendre les données météorologiques",
      descriptionAr: "فهم بيانات الطقس",
      icon: CloudSun,
      accent: "mint",
      articles: [
        { title: "Lecture des prévisions", titleAr: "قراءة التوقعات" },
        { title: "Alertes météo", titleAr: "تنبيهات الطقس" },
        { title: "Historique météo", titleAr: "سجل الطقس" },
      ],
    },
    {
      title: "Rapports IA",
      titleAr: "تقارير الذكاء الاصطناعي",
      description: "Générer et comprendre les rapports",
      descriptionAr: "إنشاء وفهم التقارير",
      icon: Brain,
      accent: "purple",
      articles: [
        { title: "Générer un rapport", titleAr: "إنشاء تقرير" },
        { title: "Interpréter les recommandations", titleAr: "تفسير التوصيات" },
        { title: "Exporter en PDF", titleAr: "تصدير PDF" },
      ],
    },
    {
      title: "Intégration WhatsApp",
      titleAr: "تكامل واتساب",
      description: "Configurer les alertes WhatsApp",
      descriptionAr: "إعداد تنبيهات واتساب",
      icon: MessageCircle,
      accent: "coral",
      articles: [
        { title: "Connecter WhatsApp", titleAr: "ربط واتساب" },
        { title: "Fréquence des rapports", titleAr: "تكرار التقارير" },
        { title: "Personnaliser les alertes", titleAr: "تخصيص التنبيهات" },
      ],
    },
    {
      title: "Paramètres",
      titleAr: "الإعدادات",
      description: "Configurer votre compte",
      descriptionAr: "إعداد حسابك",
      icon: Settings,
      accent: "pink",
      articles: [
        { title: "Profil utilisateur", titleAr: "ملف المستخدم" },
        { title: "Changer la langue", titleAr: "تغيير اللغة" },
        { title: "Notifications", titleAr: "الإشعارات" },
      ],
    },
  ];

  const accentColors: Record<string, string> = {
    pink: "bg-[var(--accent-pink)]",
    yellow: "bg-[var(--accent-yellow)]",
    mint: "bg-[var(--accent-mint)]",
    purple: "bg-[var(--accent-purple)]",
    coral: "bg-[var(--accent-coral)]",
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
          <Badge variant="purple" size="lg" className="mb-6">
            <Book className="w-3 h-3 mr-1" />
            {t("landing.footer.docs")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Centre de documentation
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Tout ce que vous devez savoir pour tirer le meilleur parti de Budoor.
            Guides, tutoriels et références techniques.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-muted)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 p-6 bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--accent-mint)]">
              <Play className="h-7 w-7 text-[var(--text-primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Nouveau sur Budoor ?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Suivez notre guide de démarrage rapide pour configurer votre compte en 5 minutes.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card key={section.title} className="hover:-translate-y-1 transition-transform duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-[var(--radius-md)] ${accentColors[section.accent]} flex items-center justify-center mb-4`}>
                    <section.icon className="h-6 w-6 text-[var(--text-primary)]" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <div className="px-5 pb-5">
                  <ul className="space-y-2">
                    {section.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href="#"
                          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
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
