import { generatePageMetadata } from "@/lib/metadata";

// Auth pages
export const loginMetadata = generatePageMetadata(
  "Connexion à Budoor - Intelligence Agricole IA",
  "Connectez-vous à votre compte Budoor pour accéder à vos rapports agricoles et recommandations personnalisées.",
  "/login",
  ["login budoor", "connexion agriculture", "app agriculture"]
);

export const registerMetadata = generatePageMetadata(
  "Inscription Budoor - Commencez Gratuitement",
  "Créez votre compte Budoor gratuitement et commencez à recevoir des conseils agricoles IA en temps réel pour vos cultures.",
  "/register",
  ["inscription gratuite", "créer compte agriculture", "budoor gratuit"]
);

// Main pages
export const dashboardMetadata = generatePageMetadata(
  "Tableau de Bord Budoor - Suivi Agricole en Temps Réel",
  "Accédez à vos rapports agricoles, analyses de sol, prévisions météo et recommandations personnalisées.",
  "/dashboard"
);

export const pricingMetadata = generatePageMetadata(
  "Tarifs Budoor - Plans d'Intelligence Agricole",
  "Découvrez nos plans gratuit et premium pour accéder à l'intelligence agricole IA complète.",
  "/dashboard/pricing",
  ["tarifs agriculture", "plans budoor", "prix app agriculture"]
);

export const docsMetadata = generatePageMetadata(
  "Documentation Budoor - Guide Complet",
  "Documentation complète de Budoor: comment utiliser l'app, interpréter les rapports et optimiser vos cultures.",
  "/docs",
  ["documentation agriculture", "guide budoor", "comment utiliser"]
);

export const blogMetadata = generatePageMetadata(
  "Blog Budoor - Conseils Agricoles et Actualités",
  "Articles et conseils agricoles d'experts marocains sur l'optimisation des cultures avec l'IA.",
  "/blog",
  ["conseils agricoles", "actualités agriculture", "blog budoor"]
);

export const privacyMetadata = generatePageMetadata(
  "Politique de Confidentialité Budoor",
  "Politique de confidentialité de Budoor: protection de vos données agricoles et personnelles.",
  "/privacy",
  ["confidentialité", "politique de confidentialité", "données personnelles"]
);

export const termsMetadata = generatePageMetadata(
  "Conditions d'Utilisation Budoor",
  "Conditions d'utilisation de Budoor: droits, responsabilités et utilisation correcte de la plateforme.",
  "/terms",
  ["conditions d'utilisation", "CGU", "terms of service"]
);

export const supportMetadata = generatePageMetadata(
  "Support Budoor - Aide et Assistance",
  "Contactez l'équipe support de Budoor pour toute question ou problème technique.",
  "/support",
  ["support", "assistance", "contact budoor"]
);

export const forgotPasswordMetadata = generatePageMetadata(
  "Réinitialiser Mot de Passe Budoor",
  "Réinitialisez votre mot de passe Budoor en quelques étapes simples.",
  "/forgot-password",
  ["mot de passe oublié", "réinitialiser", "reset password"]
);

export const parcellesMetadata = generatePageMetadata(
  "Mes Parcelles - Budoor",
  "Gérez vos parcelles agricoles et importez-les dans Budoor pour recevoir des conseils personnalisés.",
  "/dashboard/parcelles",
  ["gérer parcelles", "importer parcelles", "mes champs"]
);

export const reportsMetadata = generatePageMetadata(
  "Rapports Agricoles - Budoor",
  "Générez et consultez vos rapports agricoles IA avec analyses détaillées et recommandations.",
  "/dashboard/reports",
  ["rapports agricoles", "analyse de sol", "conseils personnalisés"]
);

export const settingsMetadata = generatePageMetadata(
  "Paramètres - Budoor",
  "Gérez vos paramètres de compte, préférences de langue et notifications Budoor.",
  "/dashboard/settings",
  ["paramètres", "préférences", "mon compte"]
);
