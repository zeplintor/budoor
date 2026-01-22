import Link from "next/link";
import { Badge } from "@/components/ui";
import { Sprout, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function TermsPage() {
  const t = await getTranslations();

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
            <FileText className="w-3 h-3 mr-1" />
            {t("landing.footer.terms")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Conditions d'utilisation
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Dernière mise à jour : 1er janvier 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-card)]">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">1. Acceptation des conditions</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                En accédant ou en utilisant la plateforme Budoor, vous acceptez d'être lié par ces conditions
                d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">2. Description du service</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Budoor est une plateforme d'aide à la décision agricole qui utilise l'intelligence artificielle
                pour fournir des recommandations personnalisées basées sur les données météorologiques, l'analyse
                du sol et les caractéristiques de vos parcelles.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">3. Compte utilisateur</h2>
              <p className="text-[var(--text-secondary)] mb-4">En créant un compte, vous vous engagez à :</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Notifier immédiatement toute utilisation non autorisée</li>
                <li>Être responsable de toutes les activités sur votre compte</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">4. Utilisation acceptable</h2>
              <p className="text-[var(--text-secondary)] mb-4">Vous vous engagez à ne pas :</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li>Utiliser le service à des fins illégales</li>
                <li>Tenter d'accéder à des systèmes non autorisés</li>
                <li>Interférer avec le bon fonctionnement du service</li>
                <li>Copier ou distribuer le contenu sans autorisation</li>
                <li>Créer plusieurs comptes pour contourner les limitations</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">5. Propriété intellectuelle</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Tous les contenus, marques, logos et logiciels de Budoor sont protégés par les droits de
                propriété intellectuelle. Vous bénéficiez d'une licence limitée, non exclusive et non
                transférable pour utiliser le service conformément à ces conditions.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">6. Données et confidentialité</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Votre utilisation du service est également régie par notre{" "}
                <Link href="/privacy" className="text-[var(--accent-pink-dark)] hover:underline">
                  Politique de confidentialité
                </Link>
                , qui décrit comment nous collectons et utilisons vos données.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">7. Abonnements et paiements</h2>
              <p className="text-[var(--text-secondary)] mb-4">Pour les abonnements payants :</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li>Les paiements sont facturés à l'avance sur une base mensuelle ou annuelle</li>
                <li>Les abonnements se renouvellent automatiquement sauf annulation</li>
                <li>Les remboursements sont possibles dans les 14 jours suivant la souscription</li>
                <li>Les prix peuvent être modifiés avec un préavis de 30 jours</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">8. Limitation de garantie</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Les recommandations fournies par Budoor sont basées sur des données et des modèles statistiques.
                Elles ne constituent pas des conseils professionnels et ne garantissent pas de résultats spécifiques.
                Le service est fourni "tel quel" sans garantie d'aucune sorte.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">9. Limitation de responsabilité</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Dans toute la mesure permise par la loi, Budoor ne sera pas responsable des dommages indirects,
                accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser
                le service, y compris les pertes de récoltes ou de revenus.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">10. Résiliation</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Vous pouvez résilier votre compte à tout moment depuis les paramètres. Nous nous réservons
                le droit de suspendre ou de résilier votre accès en cas de violation de ces conditions.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">11. Modifications</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront
                notifiées par email ou via la plateforme. Votre utilisation continue du service après
                notification constitue votre acceptation des nouvelles conditions.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">12. Droit applicable</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Ces conditions sont régies par le droit français. Tout litige sera soumis à la compétence
                exclusive des tribunaux de Paris, France.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">13. Contact</h2>
              <p className="text-[var(--text-secondary)]">
                Pour toute question concernant ces conditions, contactez-nous à :{" "}
                <a href="mailto:legal@budoor.app" className="text-[var(--accent-pink-dark)] hover:underline">
                  legal@budoor.app
                </a>
              </p>
            </div>
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
