import Link from "next/link";
import { Badge } from "@/components/ui";
import { Sprout, Calendar, Clock, ArrowRight, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function BlogPage() {
  const t = await getTranslations();

  const posts = [
    {
      title: "Comment optimiser l'irrigation avec les données météo",
      excerpt: "Découvrez comment utiliser les prévisions météorologiques pour planifier votre irrigation et économiser de l'eau.",
      date: "15 Jan 2026",
      readTime: "5 min",
      author: "Dr. Ahmed Benali",
      category: "Irrigation",
      accent: "mint",
      image: "🌱",
    },
    {
      title: "Les maladies du blé : prévention et traitement",
      excerpt: "Guide complet sur les principales maladies affectant le blé et comment les prévenir grâce à la surveillance IA.",
      date: "12 Jan 2026",
      readTime: "8 min",
      author: "Fatima Zahra",
      category: "Maladies",
      accent: "pink",
      image: "🌾",
    },
    {
      title: "Nouveauté : rapports WhatsApp quotidiens",
      excerpt: "Nous lançons une nouvelle fonctionnalité permettant de recevoir vos rapports agronomiques directement sur WhatsApp.",
      date: "10 Jan 2026",
      readTime: "3 min",
      author: "Équipe Budoor",
      category: "Actualités",
      accent: "purple",
      image: "📱",
    },
    {
      title: "Analyse du sol : interpréter les résultats",
      excerpt: "Comprendre les indicateurs clés de l'analyse du sol pour optimiser vos apports en nutriments.",
      date: "8 Jan 2026",
      readTime: "6 min",
      author: "Omar Kaddouri",
      category: "Sol",
      accent: "yellow",
      image: "🔬",
    },
    {
      title: "Préparer la saison des semis 2026",
      excerpt: "Conseils pratiques pour planifier et réussir vos semis de printemps avec l'aide de l'intelligence artificielle.",
      date: "5 Jan 2026",
      readTime: "7 min",
      author: "Dr. Ahmed Benali",
      category: "Saison",
      accent: "coral",
      image: "🌻",
    },
    {
      title: "Témoignage : +30% de rendement grâce à Budoor",
      excerpt: "Mohamed, céréalier au Maroc, partage son expérience après un an d'utilisation de la plateforme.",
      date: "2 Jan 2026",
      readTime: "4 min",
      author: "Équipe Budoor",
      category: "Témoignage",
      accent: "mint",
      image: "📈",
    },
  ];

  const accentColors: Record<string, { bg: string; text: string }> = {
    pink: { bg: "bg-[var(--accent-pink-light)]", text: "text-[var(--accent-pink-dark)]" },
    yellow: { bg: "bg-[var(--accent-yellow-light)]", text: "text-[var(--accent-yellow-dark)]" },
    mint: { bg: "bg-[var(--accent-mint-light)]", text: "text-[var(--accent-mint-dark)]" },
    purple: { bg: "bg-[var(--accent-purple-light)]", text: "text-[var(--accent-purple-dark)]" },
    coral: { bg: "bg-[var(--accent-coral-light)]", text: "text-[var(--accent-coral-dark)]" },
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
          <Badge variant="yellow" size="lg" className="mb-6">
            {t("landing.footer.blog")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Le Blog Budoor
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Actualités, conseils agronomiques et tutoriels pour optimiser vos cultures.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent-mint)] to-[var(--accent-yellow)] rounded-[var(--radius-2xl)] p-8 md:p-12">
            <div className="max-w-2xl">
              <Badge variant="default" className="mb-4 bg-white/90">À la une</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                Guide complet : préparer la saison agricole 2026
              </h2>
              <p className="text-[var(--text-primary)]/80 mb-6">
                Tout ce que vous devez savoir pour planifier et réussir votre saison agricole avec les outils d'intelligence artificielle.
              </p>
              <div className="flex items-center gap-4 text-sm text-[var(--text-primary)]/70">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  20 Jan 2026
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  12 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-8">Articles récents</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.title}
                className="group bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-40 ${accentColors[post.accent].bg} flex items-center justify-center text-6xl`}>
                  {post.image}
                </div>
                <div className="p-5">
                  <Badge variant={post.accent as "pink" | "yellow" | "mint" | "purple"} size="sm" className="mb-3">
                    {post.category}
                  </Badge>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-pink-dark)] transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--bg-muted)]">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Restez informé
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Recevez nos derniers articles et conseils agronomiques directement dans votre boîte mail.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 h-12 px-4 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-pink)]"
            />
            <button className="h-12 px-6 rounded-[var(--radius-md)] bg-[var(--accent-pink)] text-[var(--text-primary)] font-medium hover:bg-[var(--accent-pink-dark)] transition-colors">
              S'abonner
            </button>
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
