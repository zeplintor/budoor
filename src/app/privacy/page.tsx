import Link from "next/link";
import { Badge } from "@/components/ui";
import { Sprout, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function PrivacyPage() {
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
          <Badge variant="mint" size="lg" className="mb-6">
            <Shield className="w-3 h-3 mr-1" />
            {t("landing.footer.privacy")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Politique de confidentialité
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
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">1. Introduction</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Chez Budoor, nous accordons une importance primordiale à la protection de vos données personnelles.
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons
                vos informations lorsque vous utilisez notre plateforme.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">2. Données collectées</h2>
              <p className="text-[var(--text-secondary)] mb-4">Nous collectons les types de données suivants :</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li><strong>Données d'identification :</strong> nom, email, numéro de téléphone</li>
                <li><strong>Données agricoles :</strong> informations sur vos parcelles, cultures, historique</li>
                <li><strong>Données de localisation :</strong> coordonnées géographiques de vos parcelles</li>
                <li><strong>Données d'utilisation :</strong> interactions avec la plateforme, rapports générés</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">3. Utilisation des données</h2>
              <p className="text-[var(--text-secondary)] mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li>Fournir et améliorer nos services</li>
                <li>Générer des rapports agronomiques personnalisés</li>
                <li>Envoyer des alertes et notifications (avec votre consentement)</li>
                <li>Analyser et améliorer notre plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">4. Protection des données</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger
                vos données contre tout accès non autorisé, modification, divulgation ou destruction.
                Toutes les données sont chiffrées en transit et au repos.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">5. Partage des données</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données uniquement avec :
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li>Nos prestataires de services (hébergement, analyse) sous contrat de confidentialité</li>
                <li>Les autorités compétentes si requis par la loi</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">6. Vos droits</h2>
              <p className="text-[var(--text-secondary)] mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mb-6 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
              </ul>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">7. Cookies</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme et des cookies
                analytiques (avec votre consentement) pour améliorer nos services.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">8. Conservation des données</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Vos données sont conservées tant que votre compte est actif. Après suppression du compte,
                les données sont anonymisées ou supprimées dans un délai de 30 jours, sauf obligation légale.
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">9. Contact</h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Pour toute question concernant cette politique ou vos données personnelles, contactez notre
                Délégué à la Protection des Données à : <a href="mailto:privacy@budoor.app" className="text-[var(--accent-pink-dark)] hover:underline">privacy@budoor.app</a>
              </p>

              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">10. Modifications</h2>
              <p className="text-[var(--text-secondary)]">
                Nous pouvons mettre à jour cette politique de confidentialité. Toute modification importante
                vous sera notifiée par email ou via la plateforme.
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
