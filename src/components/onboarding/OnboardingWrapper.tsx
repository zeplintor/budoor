"use client";

import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeModal } from "./WelcomeModal";
import { TourGuide, TourStep } from "./TourGuide";
import { usePathname } from "next/navigation";

// Tour steps for the parcelles page
const PARCELLES_TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='draw-button']",
    title: "Dessinez votre parcelle",
    content: "Cliquez ici pour commencer a tracer votre champ sur la carte. C'est simple : cliquez sur chaque coin de votre parcelle !",
    position: "right",
  },
  {
    target: "[data-tour='map-container']",
    title: "La carte satellite",
    content: "Utilisez la carte pour voir vos champs en vue satellite. Vous pouvez zoomer et vous deplacer pour trouver vos parcelles.",
    position: "left",
  },
  {
    target: "[data-tour='parcelle-list']",
    title: "Vos parcelles",
    content: "Toutes vos parcelles apparaissent ici. Cliquez sur une parcelle pour la voir sur la carte.",
    position: "right",
  },
];

// Tour steps for the dashboard home
const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='nav-parcelles']",
    title: "Gestion des parcelles",
    content: "Commencez par ajouter vos parcelles. C'est la premiere etape pour recevoir des conseils personnalises.",
    position: "right",
  },
  {
    target: "[data-tour='nav-reports']",
    title: "Rapports et conseils",
    content: "Consultez ici les rapports generes pour vos cultures. Meteo, risques, recommandations...",
    position: "right",
  },
  {
    target: "[data-tour='nav-settings']",
    title: "Parametres",
    content: "Configurez vos preferences : langue, notifications WhatsApp, et plus encore.",
    position: "right",
  },
];

export function OnboardingWrapper() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { showWelcome, showTour, completeWelcome, completeTour, isLoading } = useOnboarding();

  if (isLoading) {
    return null;
  }

  // Determine which tour steps to show based on current page
  const getTourSteps = (): TourStep[] => {
    if (pathname?.includes("/parcelles")) {
      return PARCELLES_TOUR_STEPS;
    }
    return DASHBOARD_TOUR_STEPS;
  };

  return (
    <>
      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal
          userName={user?.displayName?.split(" ")[0]}
          onComplete={completeWelcome}
        />
      )}

      {/* Tour Guide */}
      {showTour && !showWelcome && (
        <TourGuide
          steps={getTourSteps()}
          onComplete={completeTour}
          onSkip={completeTour}
        />
      )}
    </>
  );
}
