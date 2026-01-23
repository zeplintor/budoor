"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  OrganicBlob,
  GradientMesh,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { useSubscription, PLAN_LIMITS } from "@/hooks/useSubscription";
import {
  Check,
  X,
  Loader2,
  CreditCard,
  Crown,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

export default function PricingPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { status, isPro, loading, upgradeToPro, cancelSubscription } =
    useSubscription();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Check for success/cancel from redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setNotification({
        type: "success",
        message: t("pricing.successMessage"),
      });
    }
    if (searchParams.get("cancelled") === "true") {
      setNotification({
        type: "error",
        message: t("pricing.cancelledMessage"),
      });
    }
  }, [searchParams, t]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
    } catch (error) {
      setNotification({
        type: "error",
        message: t("pricing.error"),
      });
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      setShowCancelDialog(false);
      setNotification({
        type: "success",
        message: t("pricing.subscriptionCancelled"),
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: t("pricing.cancelError"),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: t("pricing.plans.free.name"),
      price: "0",
      description: t("pricing.plans.free.description"),
      features: [
        { text: t("pricing.plans.free.features.parcelles", { count: PLAN_LIMITS.free.maxParcelles }), included: true },
        { text: t("pricing.plans.free.features.reports", { count: PLAN_LIMITS.free.maxReportsPerMonth }), included: true },
        { text: t("pricing.plans.free.features.weather"), included: true },
        { text: t("pricing.plans.free.features.soil"), included: true },
        { text: t("pricing.plans.free.features.whatsapp"), included: true },
        { text: t("pricing.plans.pro.features.unlimited"), included: false },
        { text: t("pricing.plans.pro.features.daily"), included: false },
        { text: t("pricing.plans.pro.features.history"), included: false },
        { text: t("pricing.plans.pro.features.support"), included: false },
      ],
      current: !isPro,
    },
    {
      id: "pro",
      name: t("pricing.plans.pro.name"),
      price: "29",
      description: t("pricing.plans.pro.description"),
      popular: true,
      features: [
        { text: t("pricing.plans.pro.features.unlimited"), included: true },
        { text: t("pricing.plans.pro.features.reports"), included: true },
        { text: t("pricing.plans.free.features.weather"), included: true },
        { text: t("pricing.plans.free.features.soil"), included: true },
        { text: t("pricing.plans.pro.features.daily"), included: true },
        { text: t("pricing.plans.pro.features.history"), included: true },
        { text: t("pricing.plans.pro.features.support"), included: true },
        { text: t("pricing.plans.pro.features.export"), included: true },
        { text: t("pricing.plans.pro.features.api"), included: true },
      ],
      current: isPro,
    },
  ];

  if (loading) {
    return (
      <>
        <Header title={t("pricing.title")} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-pink)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t("pricing.title")} />

      <div className="max-w-5xl mx-auto space-y-8 relative">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 pointer-events-none">
          <OrganicBlob color="purple" size="xl" animated opacity={0.08} />
        </div>
        <div className="absolute top-1/2 -left-32 pointer-events-none">
          <OrganicBlob color="pink" size="lg" animated opacity={0.06} />
        </div>
        <GradientMesh colors={{ top: 'purple', middle: 'pink', bottom: 'coral' }} />

        {/* Notification */}
        {notification && (
          <div
            className={`p-5 rounded-[var(--radius-xl)] flex items-center gap-4 shadow-lg animate-fade-in-up backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-[var(--status-success-light)] border-2 border-[var(--status-success)]"
                : "bg-[var(--status-error-light)] border-2 border-[var(--status-error)]"
            }`}
          >
            {notification.type === "success" ? (
              <div className="p-2 rounded-full bg-[var(--status-success)]">
                <CheckCircle className="h-5 w-5 text-white shrink-0" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-[var(--status-error)]">
                <AlertTriangle className="h-5 w-5 text-white shrink-0" />
              </div>
            )}
            <p className="font-medium text-[var(--text-primary)] flex-1">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-[var(--text-primary)]" />
            </button>
          </div>
        )}

        {/* Current plan status */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent-mint-light)] via-[var(--accent-yellow-light)] to-[var(--accent-coral-light)] rounded-[var(--radius-2xl)] p-8 shadow-xl">
          {/* Animated blob background */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-mint)] opacity-20 rounded-full blur-3xl animate-blob" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-[var(--radius-xl)] shadow-lg ${
                  isPro
                    ? "bg-gradient-to-br from-[var(--accent-pink)] to-[var(--accent-purple)]"
                    : "bg-[var(--accent-mint)]"
                }`}
              >
                {isPro ? (
                  <Crown className="h-8 w-8 text-white" />
                ) : (
                  <Sparkles className="h-8 w-8 text-[var(--text-primary)]" />
                )}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
                  {isPro
                    ? t("pricing.currentPlan.pro")
                    : t("pricing.currentPlan.free")}
                </h2>
                <p className="text-base text-[var(--text-primary)]/80">
                  {isPro
                    ? t("pricing.currentPlan.proDescription")
                    : t("pricing.currentPlan.freeDescription")}
                </p>
              </div>
            </div>
            {isPro && status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="bg-white/50 backdrop-blur-sm border-2 text-red-600 hover:text-red-700 hover:bg-white/70 hover:border-red-300"
              >
                {t("pricing.cancelSubscription")}
              </Button>
            )}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 relative">
          {plans.map((planItem, index) => (
            <div
              key={planItem.id}
              className={`relative overflow-hidden bg-[var(--bg-secondary)] rounded-[var(--radius-2xl)] shadow-xl card-float animate-fade-in-up ${
                planItem.popular ? "md:scale-105" : ""
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Decorative blob */}
              <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-10 ${
                planItem.popular ? "bg-[var(--accent-pink)]" : "bg-[var(--accent-mint)]"
              }`} />

              {/* Border glow for popular plan */}
              {planItem.popular && (
                <div className="absolute inset-0 rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--accent-pink)]/20 to-[var(--accent-purple)]/20 p-[2px]">
                  <div className="h-full w-full bg-[var(--bg-secondary)] rounded-[var(--radius-2xl)]" />
                </div>
              )}

              {/* Current plan ring */}
              {planItem.current && !planItem.popular && (
                <div className="absolute inset-0 rounded-[var(--radius-2xl)] ring-2 ring-[var(--accent-mint)]" />
              )}

              <div className="relative p-8">
                {/* Badges */}
                <div className="flex gap-2 mb-6">
                  {planItem.popular && (
                    <Badge variant="pink" size="lg" className="shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {t("pricing.popular")}
                    </Badge>
                  )}
                  {planItem.current && (
                    <Badge variant="mint" size="lg">
                      <Check className="h-3 w-3 mr-1" />
                      {t("pricing.currentPlan.badge")}
                    </Badge>
                  )}
                </div>

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
                    {planItem.name}
                  </h3>
                  <p className="text-[var(--text-secondary)]">{planItem.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-display font-extrabold text-[var(--text-primary)]">
                      {planItem.price}€
                    </span>
                    <span className="text-lg text-[var(--text-secondary)]">
                      /{t("pricing.perMonth")}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {planItem.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded-full ${
                        feature.included
                          ? "bg-[var(--status-success-light)]"
                          : "bg-[var(--bg-muted)]"
                      }`}>
                        {feature.included ? (
                          <Check className="h-4 w-4 text-[var(--status-success)]" />
                        ) : (
                          <X className="h-4 w-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        feature.included
                          ? "text-[var(--text-primary)] font-medium"
                          : "text-[var(--text-muted)]"
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {planItem.id === "pro" && !isPro && (
                  <Button
                    className="w-full h-14 text-base shadow-lg hover:shadow-xl transition-all"
                    variant="primary"
                    size="lg"
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("pricing.processing")}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        {t("pricing.upgrade")}
                      </>
                    )}
                  </Button>
                )}

                {planItem.id === "free" && isPro && (
                  <Button
                    className="w-full h-14 text-base"
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    {t("pricing.downgrade")}
                  </Button>
                )}

                {planItem.current && (
                  <Button
                    className="w-full h-14 text-base bg-[var(--accent-mint-light)] border-2 border-[var(--accent-mint)]"
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    <Check className="h-5 w-5" />
                    {t("pricing.currentPlan.badge")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits section */}
        <Card className="relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-mint)] via-[var(--accent-yellow)] to-[var(--accent-pink)]" />

          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display text-2xl">
              <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--accent-yellow-light)]">
                <Zap className="h-6 w-6 text-[var(--accent-yellow-dark)]" />
              </div>
              {t("pricing.benefits.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-mint-light)] group-hover:bg-[var(--accent-mint)] group-hover:scale-110 transition-all duration-300">
                    <Shield className="h-6 w-6 text-[var(--accent-mint-dark)] group-hover:text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">
                      {t("pricing.benefits.secure.title")}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {t("pricing.benefits.secure.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-yellow-light)] group-hover:bg-[var(--accent-yellow)] group-hover:scale-110 transition-all duration-300">
                    <Clock className="h-6 w-6 text-[var(--accent-yellow-dark)] group-hover:text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">
                      {t("pricing.benefits.flexible.title")}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {t("pricing.benefits.flexible.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--accent-pink-light)] group-hover:bg-[var(--accent-pink)] group-hover:scale-110 transition-all duration-300">
                    <CreditCard className="h-6 w-6 text-[var(--accent-pink-dark)] group-hover:text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">
                      {t("pricing.benefits.trial.title")}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {t("pricing.benefits.trial.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pricing.faq.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {t("pricing.faq.q1.question")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pricing.faq.q1.answer")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {t("pricing.faq.q2.question")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pricing.faq.q2.answer")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {t("pricing.faq.q3.question")}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pricing.faq.q3.answer")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel subscription dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t("pricing.cancelDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("pricing.cancelDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t("pricing.cancelDialog.warning")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("pricing.cancelDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
