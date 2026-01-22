"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

export interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TourGuideProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function TourGuide({ steps, onComplete, onSkip }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const updatePosition = useCallback(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (!target) {
      // If target not found, move to next step or complete
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
      return;
    }

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    const position = step.position || "bottom";
    const tooltipWidth = 320;
    const tooltipHeight = 150;
    const padding = 12;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Keep tooltip within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    setTooltipPosition({ top, left });
  }, [step, currentStep, steps.length, onComplete]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [updatePosition]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  if (!step) return null;

  return (
    <>
      {/* Overlay with hole for target element */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className="fixed z-50 border-2 border-green-500 rounded-lg pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl p-4"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step counter */}
        <div className="text-xs text-green-600 font-medium mb-2">
          Etape {currentStep + 1} sur {steps.length}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-4">{step.content}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Precedent
              </button>
            )}
          </div>
          <Button size="sm" onClick={handleNext}>
            {isLastStep ? "Terminer" : "Suivant"}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>

        {/* Arrow pointing to target */}
        <div
          className={`absolute w-3 h-3 bg-white transform rotate-45 ${
            step.position === "top"
              ? "-bottom-1.5 left-1/2 -translate-x-1/2"
              : step.position === "left"
              ? "-right-1.5 top-1/2 -translate-y-1/2"
              : step.position === "right"
              ? "-left-1.5 top-1/2 -translate-y-1/2"
              : "-top-1.5 left-1/2 -translate-x-1/2"
          }`}
        />
      </div>
    </>
  );
}
