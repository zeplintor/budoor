import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://budoor.me";
const ogImage = `${baseUrl}/og-image.jpg`;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Budoor - Intelligence Agricole IA pour Agriculteurs Marocains",
    template: "%s | Budoor",
  },
  description:
    "Budoor: Un agronome IA expert dans votre poche qui surveille vos champs 24h/24. Conseils agricoles en temps réel, rapports météo, analyses de sol et recommandations personnalisées pour optimiser vos cultures au Maroc.",
  keywords: [
    "intelligence agricole",
    "agronome IA",
    "conseil agricole",
    "agriculture marocaine",
    "agriculture intelligente",
    "Darija",
    "rapports agricoles",
    "analyse de sol",
    "météo agricole",
    "irrigation conseil",
    "maladies plantes",
    "agriculture durable",
    "Maroc",
    "technologie agricole",
    "farm tech",
    "AgriTech",
  ],
  authors: [{ name: "Budoor", url: baseUrl }],
  creator: "Budoor Team",
  publisher: "Budoor",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: baseUrl,
    siteName: "Budoor",
    title: "Budoor - Intelligence Agricole IA pour Agriculteurs Marocains",
    description:
      "Agronome IA dans votre poche. Conseils agricoles en temps réel, rapports météo, analyses sol et recommandations personnalisées.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Budoor - Intelligence Agricole",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Budoor - Intelligence Agricole IA",
    description:
      "Agronome IA dans votre poche qui surveille vos champs 24h/24",
    images: [ogImage],
    creator: "@budoor_app",
  },
  alternates: {
    languages: {
      "fr-FR": `${baseUrl}/fr`,
      "ar-MA": `${baseUrl}/ar`,
      "en-US": `${baseUrl}/en`,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export const generatePageMetadata = (
  title: string,
  description: string,
  path?: string,
  keywords?: string[]
): Metadata => {
  const url = path ? `${baseUrl}${path}` : baseUrl;
  const defaultKeywords = defaultMetadata.keywords as string[];
  const fullKeywords = keywords
    ? [...keywords, ...defaultKeywords]
    : defaultKeywords;

  return {
    title,
    description,
    keywords: fullKeywords,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: "Budoor",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@budoor_app",
    },
  };
};

// Structured data (Schema.org JSON-LD)
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Budoor",
  description:
    "Intelligence Agricole IA pour agriculteurs marocains",
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  sameAs: [
    "https://www.facebook.com/budoor",
    "https://www.twitter.com/budoor_app",
    "https://www.linkedin.com/company/budoor",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+212-XXX-XXX-XXX",
    contactType: "Customer Support",
    areaServed: "MA",
    availableLanguage: ["fr", "ar", "en"],
  },
});

export const generateProductSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Budoor",
  description:
    "Un agronome expert IA dans votre poche qui surveille vos champs 24h/24",
  applicationCategory: "Productivity,Agriculture",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "MAD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
  author: {
    "@type": "Organization",
    name: "Budoor",
  },
  featureList: [
    "Rapports agricoles IA",
    "Analyse de sol en temps réel",
    "Prévisions météo agricoles",
    "Conseils en Darija marocain",
    "Suivi des parcelles",
    "Recommandations personnalisées",
  ],
});

export const generateFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce que Budoor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Budoor est une application d'intelligence agricole IA qui fournit des conseils agricoles experts en temps réel, adaptés aux conditions météo et au sol de vos champs, avec recommandations en Darija marocain.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionne Budoor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Budoor analyse les données météo, le sol et la topographie de vos champs pour générer des rapports agricoles détaillés avec des recommandations personnalisées en temps réel.",
      },
    },
    {
      "@type": "Question",
      name: "Budoor est-il gratuit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, Budoor offre une version gratuite avec des fonctionnalités essentielles. Des plans premium sont disponibles pour des analyses avancées.",
      },
    },
    {
      "@type": "Question",
      name: "Budoor fonctionne-t-il pour toutes les cultures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Budoor supporte les cultures principales au Maroc (blé, orge, maïs, cultures maraîchères, olivier, etc.) avec recommandations spécifiques à chaque type de culture.",
      },
    },
  ],
});
