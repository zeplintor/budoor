"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { MapPin, Cloud, MessageCircle, ArrowRight, Sprout } from "lucide-react";

interface WelcomeModalProps {
  userName?: string;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Sprout,
    title: "Bienvenue sur Budoor !",
    description: "Votre assistant agricole intelligent. En 3 etapes simples, vous recevrez des conseils personnalises pour vos cultures.",
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    icon: MapPin,
    title: "1. Dessinez vos parcelles",
    description: "Tracez vos champs sur la carte satellite. Budoor calcule automatiquement la surface et analyse le terrain.",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    icon: Cloud,
    title: "2. Consultez les donnees",
    description: "Meteo, qualite du sol, altitude... Toutes les informations pour prendre les bonnes decisions.",
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    icon: MessageCircle,
    title: "3. Recevez des conseils",
    description: "Notre IA analyse vos donnees et vous envoie des recommandations par WhatsApp. Simple et pratique !",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
];

export function WelcomeModal({ userName, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div className="relative bg-white rounded-[var(--radius-2xl)] shadow-2xl max-w-md w-full overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-10 h-10 ${step.color}`} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {currentStep === 0 && userName ? `${step.title.replace("!", "")}, ${userName} !` : step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                    ? "w-8 bg-green-500"
                    : index < currentStep
                      ? "bg-green-300"
                      : "bg-gray-200"
                  }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Retour
              </Button>
            )}
            {currentStep === 0 && (
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Passer
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLastStep ? "Commencer" : "Suivant"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
